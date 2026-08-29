from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "dbname": "ferreteria_le",
    "user": "postgres",
    "password": "lorena",  
    "host": "localhost",
    "port": "5432"
}

# --- CLASES DE VALIDACIÓN ---
class ProductoNuevo(BaseModel):
    sku: str
    nombre: str
    id_categoria: int
    costo_interno: float
    precio_venta: float
    stock: int
    descripcion_corta: str
    imagen_url: Optional[str] = "" # NUEVO CAMPO PARA LA IMAGEN

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

class ItemCarrito(BaseModel):
    sku: str
    cantidad: int

class PedidoNuevo(BaseModel):
    nombre_cliente: str
    correo_cliente: str
    total_pagado: float
    cedula: str
    whatsapp: str
    direccion: str
    carrito: List[ItemCarrito] = []

@app.get("/")
def inicio():
    return {"mensaje": "¡El servidor está en línea!"}

# --- RUTAS DE PRODUCTOS ---
@app.get("/productos")
def obtener_productos():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT sku, nombre, id_categoria, precio_venta, stock, descripcion_corta, costo_interno, COALESCE(ventas, 0) as ventas, COALESCE(imagen_url, '') as imagen_url FROM productos WHERE activo = TRUE;")
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
            INSERT INTO productos (sku, nombre, id_categoria, costo_interno, precio_venta, stock, descripcion_corta, ventas, imagen_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 0, %s)
        """, (producto.sku, producto.nombre, producto.id_categoria, producto.costo_interno, producto.precio_venta, producto.stock, producto.descripcion_corta, producto.imagen_url))
        conexion.commit()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.put("/productos/{sku}")
def actualizar_producto(sku: str, producto: ProductoNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            UPDATE productos 
            SET nombre = %s, id_categoria = %s, costo_interno = %s, precio_venta = %s, stock = %s, descripcion_corta = %s, imagen_url = %s
            WHERE sku = %s
        """, (producto.nombre, producto.id_categoria, producto.costo_interno, producto.precio_venta, producto.stock, producto.descripcion_corta, producto.imagen_url, sku))
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

# --- RUTAS DE AUTENTICACIÓN Y PEDIDOS SE MANTIENEN IGUAL ---
@app.post("/registro")
def registrar_usuario(usuario: UsuarioRegistro):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (usuario.correo,))
        if cursor.fetchone():
            return {"estado": "Error", "detalle": "El correo ya está registrado."}
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

@app.post("/pedidos")
def crear_pedido(pedido: PedidoNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("INSERT INTO pedidos (nombre_cliente, correo_cliente, total_pagado, cedula, whatsapp, direccion) VALUES (%s, %s, %s, %s, %s, %s)", 
                       (pedido.nombre_cliente, pedido.correo_cliente, pedido.total_pagado, pedido.cedula, pedido.whatsapp, pedido.direccion))
        for item in pedido.carrito:
            cursor.execute("UPDATE productos SET ventas = COALESCE(ventas, 0) + %s, stock = stock - %s WHERE sku = %s", (item.cantidad, item.cantidad, item.sku))
        conexion.commit()
        return {"estado": "Éxito"}
    except Exception as error: return {"estado": "Error", "detalle": str(error)}

@app.get("/pedidos")
def obtener_pedidos():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM pedidos ORDER BY fecha_pedido DESC;")
        pedidos = cursor.fetchall()
        return {"estado": "Éxito", "pedidos": pedidos}
    except Exception as error: return {"estado": "Error", "detalle": str(error)}