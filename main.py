from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
import io
import uuid
import os
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creamos la carpeta uploads si no existe para almacenar los vouchers físicamente
os.makedirs("uploads", exist_ok=True)

# Montamos la carpeta para que FastAPI sirva las imágenes y PDFs públicamente
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

DB_CONFIG = {
    "dbname": "ferreteria_le",
    "user": "postgres",
    "password": "lorena",  
    "host": "localhost",
    "port": "5432"
}

class ProductoNuevo(BaseModel):
    sku: str
    nombre: str
    id_categoria: int
    costo_interno: float
    precio_venta: float
    stock: int
    descripcion_corta: str
    imagen_url: Optional[str] = ""
    oferta_tipo: Optional[str] = ""

class UsuarioRegistro(BaseModel):
    nombre_completo: str
    correo: str
    contrasena: str
    direccion: str
    cedula: str
    whatsapp: str

class UsuarioLogin(BaseModel):
    correo: str
    contrasena: str

class UsuarioActualizar(BaseModel):
    nombre_completo: str
    contrasena: str
    direccion: str
    cedula: str
    whatsapp: str

class ItemCarrito(BaseModel):
    sku: str
    cantidad: int

@app.get("/")
def inicio():
    return {"mensaje": "¡El servidor está en línea!"}

@app.get("/productos")
def obtener_productos():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT sku, nombre, id_categoria, precio_venta, stock, descripcion_corta, costo_interno, COALESCE(ventas, 0) as ventas, COALESCE(imagen_url, '') as imagen_url, COALESCE(oferta_tipo, '') as oferta_tipo, COALESCE(likes, 0) as likes FROM productos WHERE activo = TRUE;")
        inventario = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "catalogo": inventario}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/productos")
def crear_producto(producto: ProductoNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO productos (sku, nombre, id_categoria, costo_interno, precio_venta, stock, descripcion_corta, ventas, imagen_url, oferta_tipo, likes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 0, %s, %s, 0)
        """, (producto.sku, producto.nombre, producto.id_categoria, producto.costo_interno, producto.precio_venta, producto.stock, producto.descripcion_corta, producto.imagen_url, producto.oferta_tipo))
        conexion.commit()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/productos/{sku}/like")
def dar_o_quitar_like(sku: str, datos: dict):
    try:
        usuario_id = datos.get("usuario_id")
        if not usuario_id:
            return {"estado": "Error", "detalle": "Debe iniciar sesión para dar Me Gusta."}

        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        
        cursor.execute("SELECT id FROM producto_likes WHERE usuario_id = %s AND sku = %s", (usuario_id, sku))
        ya_existe = cursor.fetchone()
        
        if ya_existe:
            cursor.execute("DELETE FROM producto_likes WHERE usuario_id = %s AND sku = %s", (usuario_id, sku))
            cursor.execute("UPDATE productos SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE sku = %s", (sku,))
            accion = "quitado"
        else:
            cursor.execute("INSERT INTO producto_likes (usuario_id, sku) VALUES (%s, %s)", (usuario_id, sku))
            cursor.execute("UPDATE productos SET likes = COALESCE(likes, 0) + 1 WHERE sku = %s", (sku,))
            accion = "agregado"
            
        conexion.commit()
        
        cursor.execute("SELECT COALESCE(likes, 0) as likes FROM productos WHERE sku = %s", (sku,))
        res = cursor.fetchone()
        nuevo_total = res[0] if res else 0
        
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "accion": accion, "likes": nuevo_total}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/productos/cargar-excel")
async def cargar_productos_excel(file: UploadFile = File(...)):
    try:
        contenido = await file.read()
        df = pd.read_excel(io.BytesIO(contenido), skiprows=4)
        df = df.dropna(subset=['Descripción del Artículo'])

        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        
        mapa_categorias = {
            "herramientas": 1, "accesorio": 1, "herraje": 1,
            "construcción": 2, "construccion": 2, "pegamento": 2, "impermeabilizantes": 2,
            "electricidad": 3,
            "gafitería": 4, "gafiteria": 4,
            "plomería": 5, "plomeria": 5, "baño": 5, "bañó": 5, "bañó ": 5,
            "pintura": 6, "esmalte": 6,
            "carpintería": 7, "carpinteria": 7,
            "fluidos": 8, "polietileno": 8,
            "automotriz": 9,
            "insumo quimico": 10, "insumos quimicos": 10,
            "cocina": 11, "cocina ": 11,
            "jardin": 12, "jardín": 12
        }
        
        for index, fila in df.iterrows():
            sku_excel = str(fila['Código / SKU']).strip()
            if pd.isna(fila['Código / SKU']) or sku_excel.lower() in ['', 'nan', 's/n', 'sn', 'sin numero']:
                sku_final = "GEN-" + uuid.uuid4().hex[:6].upper()
            else:
                sku_final = sku_excel

            marca = str(fila['Marca']) if pd.notna(fila['Marca']) else "Sin marca"
            obs = str(fila['Observaciones']) if pd.notna(fila['Observaciones']) else ""
            descripcion = f"Marca: {marca}. {obs}".strip()
            categoria_excel = str(fila['Categoría']).strip().lower()
            id_categoria = mapa_categorias.get(categoria_excel, 1) 
            costo_interno = 0.0 
            precio = float(fila['precio unitario']) if pd.notna(fila['precio unitario']) else 0.0
            stock = int(fila['Cantidad Contada']) if pd.notna(fila['Cantidad Contada']) else 0
            
            cursor.execute("""
                INSERT INTO productos (sku, nombre, id_categoria, costo_interno, precio_venta, stock, descripcion_corta, ventas, imagen_url, oferta_tipo, likes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 0, %s, '', 0)
                ON CONFLICT (sku) DO UPDATE 
                SET nombre = EXCLUDED.nombre,
                    id_categoria = EXCLUDED.id_categoria,  
                    precio_venta = EXCLUDED.precio_venta,
                    stock = EXCLUDED.stock,
                    descripcion_corta = EXCLUDED.descripcion_corta;
            """, (sku_final, str(fila['Descripción del Artículo']).strip(), id_categoria, costo_interno, precio, stock, descripcion, ""))
        
        conexion.commit()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "mensaje": f"Se procesaron todos los productos."}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.put("/productos/{sku}")
def actualizar_producto(sku: str, producto: ProductoNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            UPDATE productos 
            SET nombre = %s, id_categoria = %s, costo_interno = %s, precio_venta = %s, stock = %s, descripcion_corta = %s, imagen_url = %s, oferta_tipo = %s
            WHERE sku = %s
        """, (producto.nombre, producto.id_categoria, producto.costo_interno, producto.precio_venta, producto.stock, producto.descripcion_corta, producto.imagen_url, producto.oferta_tipo, sku))
        conexion.commit()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.delete("/productos/{sku}")
def eliminar_producto(sku: str):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("DELETE FROM productos WHERE sku = %s", (sku,))
        conexion.commit()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/registro")
def registrar_usuario(usuario: UsuarioRegistro):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (usuario.correo,))
        if cursor.fetchone(): return {"estado": "Error", "detalle": "El correo ya está registrado."}
        cursor.execute("INSERT INTO usuarios (nombre_completo, correo, contrasena, direccion, cedula, whatsapp) VALUES (%s, %s, %s, %s, %s, %s)", 
                       (usuario.nombre_completo, usuario.correo, usuario.contrasena, usuario.direccion, usuario.cedula, usuario.whatsapp))
        conexion.commit()
        return {"estado": "Éxito"}
    except Exception as error: return {"estado": "Error", "detalle": str(error)}

@app.post("/login")
def login_usuario(usuario: UsuarioLogin):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM usuarios WHERE correo = %s AND contrasena = %s", (usuario.correo, usuario.contrasena))
        cliente = cursor.fetchone()
        if cliente: return {"estado": "Éxito", "usuario": cliente}
        return {"estado": "Error", "detalle": "Datos incorrectos."}
    except Exception as error: return {"estado": "Error", "detalle": str(error)}

@app.put("/usuarios/{usuario_id}")
def actualizar_usuario(usuario_id: int, datos: UsuarioActualizar):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            UPDATE usuarios 
            SET nombre_completo = %s, contrasena = %s, direccion = %s, cedula = %s, whatsapp = %s
            WHERE id = %s
        """, (datos.nombre_completo, datos.contrasena, datos.direccion, datos.cedula, datos.whatsapp, usuario_id))
        conexion.commit()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/pedidos")
async def crear_pedido(
    nombre_cliente: str = Form(...),
    correo_cliente: str = Form(...),
    total_pagado: float = Form(...),
    cedula: str = Form(...),
    whatsapp: str = Form(...),
    direccion: str = Form(...),
    metodo_pago: str = Form("Efectivo"),
    carrito: str = Form(...),
    voucher_file: Optional[UploadFile] = File(None)
):
    try:
        voucher_url = ""
        if voucher_file:
            extension = os.path.splitext(voucher_file.filename)[1]
            nombre_archivo = f"{uuid.uuid4().hex}{extension}"
            ruta_destino = os.path.join("uploads", nombre_archivo)
            
            with open(ruta_destino, "wb") as buffer:
                contenido = await voucher_file.read()
                buffer.write(contenido)
            
            voucher_url = f"http://127.0.0.1:8000/uploads/{nombre_archivo}"

        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO pedidos (nombre_cliente, correo_cliente, total_pagado, cedula, whatsapp, direccion, metodo_pago, voucher) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (nombre_cliente, correo_cliente, total_pagado, cedula, whatsapp, direccion, metodo_pago, voucher_url))
        
        items_carrito = json.loads(carrito)
        for item in items_carrito:
            cursor.execute("UPDATE productos SET ventas = COALESCE(ventas, 0) + %s, stock = stock - %s WHERE sku = %s", (item['cantidad'], item['cantidad'], item['sku']))
        
        conexion.commit()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito"}
    except Exception as error: 
        return {"estado": "Error", "detalle": str(error)}

@app.get("/pedidos")
def obtener_pedidos():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, nombre_cliente, correo_cliente, total_pagado, cedula, whatsapp, direccion, fecha_pedido, COALESCE(metodo_pago, 'Efectivo') as metodo_pago, COALESCE(voucher, '') as voucher FROM pedidos ORDER BY fecha_pedido DESC;")
        pedidos = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "pedidos": pedidos}
    except Exception as error: 
        return {"estado": "Error", "detalle": str(error)}

@app.get("/pedidos/cliente/{correo}")
def obtener_pedidos_cliente(correo: str):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id, total_pagado, fecha_pedido, COALESCE(metodo_pago, 'Efectivo') as metodo_pago, COALESCE(voucher, '') as voucher 
            FROM pedidos 
            WHERE correo_cliente = %s 
            ORDER BY fecha_pedido DESC;
        """, (correo,))
        pedidos = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "pedidos": pedidos}
    except Exception as error: 
        return {"estado": "Error", "detalle": str(error)}