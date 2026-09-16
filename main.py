from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
import io
import uuid
import os
import json
from datetime import datetime
import bcrypt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

DB_CONFIG = {
    "dbname": "ferreteria_le",
    "user": "postgres",
    "password": "lorena",  
    "host": "localhost",
    "port": "5432"
}

def enviar_correo_recibo(correo_destino, nombre_cliente, pedido_id, total, metodo, items):
    pass

def get_password_hash(password: str) -> str:
    pwd_bytes = str(password).encode('utf-8', errors='ignore')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8', errors='ignore')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = str(plain_password).encode('utf-8', errors='ignore')[:72]
        hash_bytes = str(hashed_password).encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except:
        return plain_password == hashed_password

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

class LogAuditoria(BaseModel):
    accion: str
    detalles: str
    usuario: Optional[str] = "Administrador"

class CreditoNuevo(BaseModel):
    nombre_cliente: str
    cedula: str
    telefono: Optional[str] = ""
    limite_credito: float = 100.00
    saldo_actual: float = 0.00

class AbonoNuevo(BaseModel):
    credito_id: int
    monto_abonado: float
    tipo_pago: Optional[str] = "Efectivo"

class ProveedorNuevo(BaseModel):
    nombre_empresa: str
    contacto: Optional[str] = ""
    telefono: Optional[str] = ""
    correo: Optional[str] = ""
    categoria_principal: Optional[str] = "General"

class OrdenCompraNueva(BaseModel):
    proveedor_id: int
    total_estimado: float
    detalles_items: str

REGISTRO_AUDITORIA = [
    {"id": 1, "accion": "INICIO DE SERVIDOR", "detalles": "Backend FastAPI en línea y conectado correctamente", "usuario": "Sistema", "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
]

def registrar_log_interno(accion: str, detalles: str, usuario: str = "Administrador"):
    evento = {
        "id": len(REGISTRO_AUDITORIA) + 1,
        "accion": accion,
        "detalles": detalles,
        "usuario": usuario,
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    REGISTRO_AUDITORIA.insert(0, evento)

@app.get("/")
def inicio():
    return {"mensaje": "¡El servidor está en línea!"}

@app.get("/auditoria")
def obtener_logs():
    return {"estado": "Éxito", "logs": REGISTRO_AUDITORIA}

@app.post("/auditoria")
def registrar_log(log: LogAuditoria):
    try:
        registrar_log_interno(log.accion, log.detalles, log.usuario)
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/creditos")
def obtener_creditos():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM creditos_clientes ORDER BY saldo_actual DESC;")
        cuentas = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "cuentas": cuentas}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/creditos")
def crear_cuenta_credito(cuenta: CreditoNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO creditos_clientes (nombre_cliente, cedula, telefono, limite_credito, saldo_actual, estado)
            VALUES (%s, %s, %s, %s, %s, CASE WHEN %s > 0 THEN 'Deudor' ELSE 'Al día' END)
        """, (cuenta.nombre_cliente, cuenta.cedula, cuenta.telefono, cuenta.limite_credito, cuenta.saldo_actual, cuenta.saldo_actual))
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("NUEVO CRÉDITO", f"Se abrió cuenta fiada para {cuenta.nombre_cliente} con saldo inicial de ${cuenta.saldo_actual:.2f}")
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/creditos/abonar")
def registrar_abono(abono: AbonoNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT nombre_cliente, cedula, telefono, saldo_actual FROM creditos_clientes WHERE id = %s", (abono.credito_id,))
        cliente_credito = cursor.fetchone()
        if not cliente_credito:
            return {"estado": "Error", "detalle": "Cuenta de crédito no encontrada."}
        
        cursor.execute("""
            INSERT INTO abonos_creditos (credito_id, monto_abonado, tipo_pago)
            VALUES (%s, %s, %s)
        """, (abono.credito_id, abono.monto_abonado, abono.tipo_pago))

        cursor.execute("""
            UPDATE creditos_clientes 
            SET saldo_actual = GREATEST(saldo_actual - %s, 0),
                estado = CASE WHEN (saldo_actual - %s) <= 0 THEN 'Al día' ELSE 'Deudor' END
            WHERE id = %s
        """, (abono.monto_abonado, abono.monto_abonado, abono.credito_id))

        cursor.execute("""
            INSERT INTO pedidos (nombre_cliente, correo_cliente, total_pagado, cedula, whatsapp, direccion, metodo_pago) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            cliente_credito['nombre_cliente'], 
            "credito@ferreteriale.com", 
            abono.monto_abonado, 
            cliente_credito['cedula'], 
            cliente_credito['telefono'] or "S/N", 
            "S/N", 
            f"Abono a Crédito ({abono.tipo_pago})"
        ))

        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("ABONO A CRÉDITO", f"Abono de ${abono.monto_abonado:.2f} registrado para {cliente_credito['nombre_cliente']}")
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/proveedores")
def obtener_proveedores():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM proveedores ORDER BY id DESC;")
        provs = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "proveedores": provs}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/proveedores")
def crear_proveedor(prov: ProveedorNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO proveedores (nombre_empresa, contacto, telefono, correo, categoria_principal)
            VALUES (%s, %s, %s, %s, %s)
        """, (prov.nombre_empresa, prov.contacto, prov.telefono, prov.correo, prov.categoria_principal))
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("NUEVO PROVEEDOR", f"Se registró al proveedor: {prov.nombre_empresa}")
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/ordenes-compra")
def obtener_ordenes():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT o.id, o.estado, o.total_estimado, o.detalles_items, o.fecha_orden, p.nombre_empresa AS proveedor 
            FROM ordenes_compra o 
            JOIN proveedores p ON o.proveedor_id = p.id 
            ORDER BY o.fecha_orden DESC;
        """)
        ordenes = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "ordenes": ordenes}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/ordenes-compra")
def crear_orden(orden: OrdenCompraNueva):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO ordenes_compra (proveedor_id, total_estimado, detalles_items, estado)
            VALUES (%s, %s, %s, 'Pendiente')
        """, (orden.proveedor_id, orden.total_estimado, orden.detalles_items))
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("ORDEN DE COMPRA", f"Se generó una orden de compra por ${orden.total_estimado:.2f}")
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/exportar/inventario")
def exportar_inventario():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        df = pd.read_sql("""
            SELECT sku AS "Código SKU", nombre AS "Descripción del Artículo", precio_venta AS "Precio Venta ($)", stock AS "Stock Actual", ventas AS "Unidades Vendidas", descripcion_corta AS "Observaciones" 
            FROM productos WHERE activo = TRUE
        """, conexion)
        conexion.close()
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Inventario Ferreteria LE')
        output.seek(0)
        return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="inventario_ferreteria_le.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/exportar/pedidos")
def exportar_pedidos():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        df = pd.read_sql("""
            SELECT id AS "ID Pedido", nombre_cliente AS "Cliente", correo_cliente AS "Correo", cedula AS "Cédula / RUC", whatsapp AS "WhatsApp", direccion AS "Dirección", metodo_pago AS "Método de Pago", total_pagado AS "Total Pagado ($)", fecha_pedido AS "Fecha y Hora" 
            FROM pedidos ORDER BY fecha_pedido DESC
        """, conexion)
        conexion.close()
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Historial de Ventas')
        output.seek(0)
        return StreamingResponse(output, headers={'Content-Disposition': 'attachment; filename="ventas_pedidos_ferreteria.xlsx"'}, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

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
            INSERT INTO productos (sku, nombre, id_categoria, costo_interno, precio_venta, stock, descripcion_corta, ventas, imagen_url, oferta_tipo, likes, activo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 0, %s, %s, 0, TRUE)
        """, (producto.sku, producto.nombre, producto.id_categoria, producto.costo_interno, producto.precio_venta, producto.stock, producto.descripcion_corta, producto.imagen_url, producto.oferta_tipo))
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("CREACIÓN PRODUCTO", f"Se creó el producto SKU: {producto.sku}")
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/productos/{sku}/like")
def dar_o_quitar_like(sku: str, datos: dict):
    try:
        usuario_id = datos.get("usuario_id")
        if not usuario_id:
            return {"estado": "Error", "detalle": "Debe iniciar sesión."}
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("SELECT id FROM producto_likes WHERE usuario_id = %s AND sku = %s", (usuario_id, sku))
        ya_existe = cursor.fetchone()
        if ya_existe:
            cursor.execute("DELETE FROM producto_likes WHERE usuario_id = %s AND sku = %s", (usuario_id, sku))
            cursor.execute("UPDATE productos SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE sku = %s", (sku,))
        else:
            cursor.execute("INSERT INTO producto_likes (usuario_id, sku) VALUES (%s, %s)", (usuario_id, sku))
            cursor.execute("UPDATE productos SET likes = COALESCE(likes, 0) + 1 WHERE sku = %s", (sku,))
        conexion.commit()
        cursor.execute("SELECT COALESCE(likes, 0) as likes FROM productos WHERE sku = %s", (sku,))
        res = cursor.fetchone()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "likes": res[0] if res else 0}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/productos/cargar-excel")
async def cargar_productos_excel(file: UploadFile = File(...)):
    try:
        contenido = await file.read()
        
        try:
            df = pd.read_excel(io.BytesIO(contenido), header=4, engine='openpyxl')
        except Exception:
            try:
                df = pd.read_excel(io.BytesIO(contenido), engine='openpyxl')
            except Exception as e:
                return {"estado": "Error", "detalle": f"No se pudo leer el archivo Excel. Asegúrate de que sea un .xlsx válido. Detalle: {str(e)}"}

        df.columns = df.columns.astype(str).str.strip()
        
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        
        importados = 0
        for index, fila in df.iterrows():
            # Extraer Descripción del Artículo
            nombre_excel = ""
            for col_n in ['Descripción del Artículo', 'Descripcion del Articulo', 'Descripcion', 'Descripción', 'nombre', 'producto']:
                if col_n in df.columns and pd.notna(fila[col_n]):
                    try:
                        nombre_excel = str(fila[col_n]).encode('utf-8', errors='ignore').decode('utf-8').strip()
                        break
                    except:
                        nombre_excel = str(fila[col_n]).strip()
            
            if not nombre_excel or nombre_excel.lower() in ['nan', 'none', '', 'hoja de toma física de inventario', 'responsable del conteo:']:
                continue
            
            # Extraer Código / SKU
            sku_excel = ""
            for col_sku in ['Código / SKU', 'Codigo / SKU', 'SKU', 'Código', 'Codigo', 'sku']:
                if col_sku in df.columns and pd.notna(fila[col_sku]):
                    sku_excel = str(fila[col_sku]).strip()
                    break
            
            if not sku_excel or sku_excel.lower() in ['s/n', 'sn', 'nan', 'none']:
                sku_final = "GEN-" + uuid.uuid4().hex[:6].upper()
            else:
                try:
                    if 'e+' in sku_excel.lower() or '.' in sku_excel:
                        sku_final = str(int(float(sku_excel)))
                    else:
                        sku_final = sku_excel
                except:
                    sku_final = sku_excel

            # Extraer Precio Unitario
            precio = 0.0
            for col_p in ['precio unitario', 'Precio unitario', 'Precio Unitario', 'precio', 'PVP']:
                if col_p in df.columns and pd.notna(fila[col_p]):
                    try:
                        precio = float(str(fila[col_p]).replace('$', '').replace(',', '').strip())
                        break
                    except:
                        pass
            
            # Extraer Cantidad Contada (Stock)
            stock_excel = 0
            for col_s in ['Cantidad Contada', 'cantidad contada', 'Stock', 'Cantidad', 'stock']:
                if col_s in df.columns and pd.notna(fila[col_s]):
                    try:
                        stock_excel = int(float(str(fila[col_s]).strip()))
                        break
                    except:
                        pass

            # --- LECTURA DIRECTA DE LA COLUMNA CATEGORÍA DEL EXCEL ---
            cat_excel = ""
            for col_c in ['Categoría', 'Categoria', 'categoría', 'categoria']:
                if col_c in df.columns and pd.notna(fila[col_c]):
                    cat_excel = str(fila[col_c]).strip().lower()
                    break
            
            id_cat = 4  # Por defecto: General / Varios
            
            if 'cocina' in cat_excel:
                id_cat = 10  # ID para Cocina
            elif 'baño' in cat_excel or 'banio' in cat_excel:
                id_cat = 9   # ID para Baño
            elif 'gafiteria' in cat_excel or 'plomeria' in cat_excel or 'plomería' in cat_excel:
                id_cat = 5   # Plomería / Gafitería
            elif 'electricidad' in cat_excel:
                id_cat = 3   # Electricidad
            elif 'pintura' in cat_excel:
                id_cat = 6   # Pintura
            elif 'construccion' in cat_excel or 'construcción' in cat_excel:
                id_cat = 2   # Construcción
            elif 'herramienta' in cat_excel:
                id_cat = 1   # Herramientas
            else:
                # Respaldo por nombre si la columna está vacía
                nombre_lower = nombre_excel.lower()
                if any(w in nombre_lower for w in ['codo', 'tubo', 'te', 'pvc', 'valvula', 'grifo', 'sifon']):
                    id_cat = 5
                elif any(w in nombre_lower for w in ['cable', 'foco', 'interruptor', 'toma']):
                    id_cat = 3
                else:
                    id_cat = 4
            # ----------------------------------------------------

            cursor.execute("SELECT sku FROM productos WHERE sku = %s OR nombre = %s", (sku_final, nombre_excel))
            existente = cursor.fetchone()
            
            if existente:
                cursor.execute("""
                    UPDATE productos 
                    SET precio_venta = %s, stock = %s, id_categoria = %s, activo = TRUE 
                    WHERE sku = %s
                """, (precio if precio > 0 else 0.00, stock_excel, id_cat, existente[0]))
            else:
                cursor.execute("""
                    INSERT INTO productos (sku, nombre, id_categoria, costo_interno, precio_venta, stock, descripcion_corta, ventas, imagen_url, oferta_tipo, likes, activo) 
                    VALUES (%s, %s, %s, 0.0, %s, %s, '', 0, '', '', 0, TRUE)
                """, (sku_final, nombre_excel, id_cat, precio if precio > 0 else 0.00, stock_excel))
            
            importados += 1

        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("SINCRONIZACIÓN EXCEL", f"Archivo: {file.filename} ({importados} productos)")
        return {"estado": "Éxito", "mensaje": f"¡Se sincronizaron {importados} productos respetando las categorías del Excel!"}
    except Exception as error:
        return {"estado": "Error", "detalle": f"Error al procesar el archivo: {str(error)}"}
                
@app.put("/productos/{sku}")
def actualizar_producto(sku: str, producto: ProductoNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            UPDATE productos SET nombre = %s, id_categoria = %s, costo_interno = %s, precio_venta = %s, stock = %s, descripcion_corta = %s, imagen_url = %s, oferta_tipo = %s WHERE sku = %s
        """, (producto.nombre, producto.id_categoria, producto.costo_interno, producto.precio_venta, producto.stock, producto.descripcion_corta, producto.imagen_url, producto.oferta_tipo, sku))
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("ACTUALIZACIÓN PRODUCTO", f"SKU: {sku}")
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
        registrar_log_interno("ELIMINACIÓN PRODUCTO", f"SKU: {sku}")
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/registro")
def registrar_usuario(usuario: UsuarioRegistro):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (usuario.correo,))
        if cursor.fetchone(): 
            return {"estado": "Error", "detalle": "El correo ya está registrado."}
        
        hashed_pw = get_password_hash(usuario.contrasena)
        
        cursor.execute("INSERT INTO usuarios (nombre_completo, correo, contrasena, direccion, cedula, whatsapp) VALUES (%s, %s, %s, %s, %s, %s)", 
                       (usuario.nombre_completo, usuario.correo, hashed_pw, usuario.direccion, usuario.cedula, usuario.whatsapp))
        conexion.commit()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito"}
    except Exception as error: 
        return {"estado": "Error", "detalle": str(error)}

@app.post("/login")
def login_usuario(usuario: UsuarioLogin):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT * FROM usuarios WHERE correo = %s", (usuario.correo,))
        cliente = cursor.fetchone()
        
        if not cliente:
            return {"estado": "Error", "detalle": "Datos incorrectos."}
            
        if not verify_password(usuario.contrasena, cliente['contrasena']):
            return {"estado": "Error", "detalle": "Datos incorrectos."}
            
        return {"estado": "Éxito", "usuario": cliente}
    except Exception as error: 
        return {"estado": "Error", "detalle": str(error)}

@app.put("/usuarios/{usuario_id}")
def actualizar_usuario(usuario_id: int, usuario: UsuarioActualizar):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        
        hashed_pw = get_password_hash(usuario.contrasena)
        
        cursor.execute("""
            UPDATE usuarios 
            SET nombre_completo = %s, contrasena = %s, direccion = %s, cedula = %s, whatsapp = %s 
            WHERE id = %s
        """, (usuario.nombre_completo, hashed_pw, usuario.direccion, usuario.cedula, usuario.whatsapp, usuario_id))
        
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("ACTUALIZACIÓN PERFIL", f"El cliente con ID {usuario_id} actualizó sus datos.")
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
                buffer.write(await voucher_file.read())
            voucher_url = f"http://127.0.0.1:8000/uploads/{nombre_archivo}"

        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        
        cursor.execute("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS carrito TEXT DEFAULT '[]';")
        conexion.commit()
        
        descontar_stock_ahora = True
        if "contra entrega" in metodo_pago.lower() and not voucher_url:
            descontar_stock_ahora = False
            metodo_pago = "Pendiente - " + metodo_pago

        cursor.execute("""
            INSERT INTO pedidos (nombre_cliente, correo_cliente, total_pagado, cedula, whatsapp, direccion, metodo_pago, voucher, carrito) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (nombre_cliente, correo_cliente, total_pagado, cedula, whatsapp, direccion, metodo_pago, voucher_url, carrito))
        
        nuevo_id_pedido = cursor.fetchone()[0]
        
        items_carrito = json.loads(carrito)
        if descontar_stock_ahora:
            for item in items_carrito:
                cursor.execute("UPDATE productos SET ventas = COALESCE(ventas, 0) + %s, stock = stock - %s WHERE sku = %s", (item['cantidad'], item['cantidad'], str(item['sku'])))
            
            enviar_correo_recibo(correo_cliente, nombre_cliente, nuevo_id_pedido, total_pagado, metodo_pago, items_carrito)
        
        if "Crédito" in metodo_pago:
            if not cedula or cedula == "9999999999":
                raise Exception("Para otorgar un crédito, debes registrar los datos y cédula reales del cliente.")
            
            cursor.execute("SELECT id FROM creditos_clientes WHERE cedula = %s", (cedula,))
            cuenta_existente = cursor.fetchone()
            
            if cuenta_existente:
                cursor.execute("""
                    UPDATE creditos_clientes 
                    SET saldo_actual = saldo_actual + %s, estado = 'Deudor'
                    WHERE id = %s
                """, (total_pagado, cuenta_existente[0]))
            else:
                cursor.execute("""
                    INSERT INTO creditos_clientes (nombre_cliente, cedula, telefono, limite_credito, saldo_actual, estado)
                    VALUES (%s, %s, %s, 200.00, %s, 'Deudor')
                """, (nombre_cliente, cedula, whatsapp, total_pagado))

        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("NUEVA VENTA", f"Pedido registrado (${total_pagado:.2f} - {metodo_pago}) para {nombre_cliente}")
        return {"estado": "Éxito"}
    except Exception as error: 
        return {"estado": "Error", "detalle": str(error)}

@app.get("/pedidos")
def obtener_pedidos():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, nombre_cliente, correo_cliente, total_pagado, cedula, whatsapp, direccion, fecha_pedido, COALESCE(metodo_pago, 'Efectivo') as metodo_pago, COALESCE(voucher, '') as voucher, COALESCE(carrito, '[]') as carrito FROM pedidos ORDER BY fecha_pedido DESC;")
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
            SELECT id, total_pagado, fecha_pedido, COALESCE(metodo_pago, 'Efectivo') as metodo_pago, COALESCE(voucher, '') as voucher, COALESCE(carrito, '[]') as carrito 
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

@app.put("/pedidos/{pedido_id}/aprobar")
def aprobar_pedido(pedido_id: int):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS carrito TEXT DEFAULT '[]';")
        conexion.commit()
        
        cursor.execute("SELECT nombre_cliente, correo_cliente, total_pagado, carrito, metodo_pago FROM pedidos WHERE id = %s", (pedido_id,))
        pedido = cursor.fetchone()
        if not pedido:
            return {"estado": "Error", "detalle": "Pedido no encontrado."}
        
        if "Pendiente" in pedido['metodo_pago']:
            items_carrito = json.loads(pedido['carrito']) if pedido['carrito'] else []
            for item in items_carrito:
                cant = int(item.get('cantidad') or item.get('cant') or 1)
                sku_prod = str(item.get('sku') or item.get('codigo') or "").strip()
                
                if sku_prod:
                    cursor.execute("""
                        UPDATE productos 
                        SET ventas = COALESCE(ventas, 0) + %s, stock = stock - %s 
                        WHERE sku = %s
                    """, (cant, cant, sku_prod))
            
            nuevo_metodo = pedido['metodo_pago'].replace("Pendiente - ", "Aprobado - ")
            cursor.execute("UPDATE pedidos SET metodo_pago = %s WHERE id = %s", (nuevo_metodo, pedido_id))
            
            enviar_correo_recibo(pedido['correo_cliente'], pedido['nombre_cliente'], pedido_id, float(pedido['total_pagado']), nuevo_metodo, items_carrito)

        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("APROBAR PEDIDO", f"Se validó el pago de {pedido['nombre_cliente']} y se actualizó el inventario.")
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.delete("/pedidos/{pedido_id}")
def eliminar_pedido(pedido_id: int):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT nombre_cliente FROM pedidos WHERE id = %s", (pedido_id,))
        pedido = cursor.fetchone()
        
        cursor.execute("DELETE FROM pedidos WHERE id = %s", (pedido_id,))
        conexion.commit()
        cursor.close()
        conexion.close()
        
        if pedido:
            registrar_log_interno("PEDIDO RECHAZADO", f"Se rechazó y eliminó el pedido #{pedido_id} de {pedido['nombre_cliente']}.")
            
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}