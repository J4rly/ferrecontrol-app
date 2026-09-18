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
from datetime import datetime, timedelta
import bcrypt
import requests

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

class CierreCajaNuevo(BaseModel):
    total_efectivo: float
    total_transferencia: float
    total_credito: float
    gran_total_sistema: float
    efectivo_contado: float
    diferencia: float
    observaciones: Optional[str] = "Sin novedades"

class OrdenActualizar(BaseModel):
    total_estimado: float
    detalles_items: str
    metodo_pago_credito: Optional[str] = "Crédito General"

class AbonoProveedorNuevo(BaseModel):
    orden_id: int
    monto_abonado: float
    tipo_pago: str  # 'Transferencia' o 'Cheque'
    referencia_banco: Optional[str] = "S/N"


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

def validar_cedula_ecuatoriana(cedula: str) -> bool:
    if len(cedula) != 10 or not cedula.isdigit():
        return False
    
    provincia = int(cedula[:2])
    if not (1 <= provincia <= 24 or provincia == 30):
        return False
        
    tercer_digito = int(cedula[2])
    if tercer_digito > 6:
        return False

    coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    suma = 0
    for i in range(9):
        valor = int(cedula[i]) * coeficientes[i]
        if valor > 9:
            valor -= 9
        suma += valor
        
    digito_verificador = int(cedula[9])
    decena_superior = (suma + 9) // 10 * 10
    resultado = decena_superior - suma
    if resultado == 10:
        resultado = 0
        
    return resultado == digito_verificador

@app.get("/buscar-cliente/{cedula}")
def buscar_cliente_por_cedula(cedula: str):
    try:
        es_valida = validar_cedula_ecuatoriana(cedula)
        
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT nombre_completo, direccion, whatsapp AS telefono, correo, cedula FROM usuarios WHERE cedula = %s", (cedula,))
        cliente = cursor.fetchone()
        
        if not cliente:
            cursor.execute("SELECT nombre_cliente AS nombre_completo, 'S/N' AS direccion, telefono, 'credito@ferreteriale.com' AS correo, cedula FROM creditos_clientes WHERE cedula = %s", (cedula,))
            cliente = cursor.fetchone()
            
        cursor.close()
        conexion.close()
        
        if cliente:
            partes = cliente['nombre_completo'].split(' ', 1)
            nombres = partes[0]
            apellidos = partes[1] if len(partes) > 1 else ""
            return {
                "estado": "Éxito", 
                "encontrado_local": True,
                "es_valida": es_valida,
                "cliente": {    
                    "nombres": nombres,
                    "apellidos": apellidos,
                    "direccion": cliente['direccion'],
                    "telefono": cliente['telefono'],
                    "correo": cliente['correo']
                }
            }
        
        return {
            "estado": "Éxito", 
            "encontrado_local": False,
            "es_valida": es_valida,
            "detalle": "Cédula correcta, ingrese datos del cliente nuevo."
        }
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/tendencia-ingresos")
async def obtener_tendencia_ingresos(fecha_inicio: Optional[str] = None, fecha_fin: Optional[str] = None):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        
        if not fecha_fin:
            dt_fin = datetime.now()
        else:
            dt_fin = datetime.strptime(fecha_fin, "%Y-%m-%d")
            
        if not fecha_inicio:
            dt_inicio = dt_fin - timedelta(days=30)
        else:
            dt_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d")

        query = """
            SELECT DATE(fecha_pedido) as dia, SUM(total_pagado) 
            FROM pedidos 
            WHERE fecha_pedido >= %s AND fecha_pedido <= %s
            GROUP BY DATE(fecha_pedido)
            ORDER BY dia ASC;
        """
        cursor.execute(query, (dt_inicio.date(), dt_fin.date()))
        resultados = cursor.fetchall()
        
        ventas_por_dia = {str(row[0]): float(row[1]) for row in resultados}
        
        catalogo_tendencia = []
        current_date = dt_inicio.date()
        while current_date <= dt_fin.date():
            fecha_str = current_date.strftime("%Y-%m-%d")
            catalogo_tendencia.append({
                "fecha": fecha_str,
                "ventas": ventas_por_dia.get(fecha_str, 0.0)
            })
            current_date += timedelta(days=1)

        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "tendencia": catalogo_tendencia}
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
            SELECT o.id, o.estado, o.total_estimado, 
                   GREATEST(o.total_estimado - COALESCE((SELECT SUM(monto_abonado) FROM abonos_proveedores WHERE orden_id = o.id), 0), 0) AS saldo_pendiente,
                   o.detalles_items, o.fecha_orden, 
                   COALESCE(o.metodo_pago_credito, 'Crédito') as metodo_pago_credito, 
                   p.nombre_empresa AS proveedor 
            FROM ordenes_compra o 
            JOIN proveedores p ON o.proveedor_id = p.id 
            ORDER BY o.fecha_orden DESC;
        """)
        ordenes = cursor.fetchall()
        
        for ord in ordenes:
            estado_real = 'Pagado' if float(ord['saldo_pendiente']) <= 0 else 'Pendiente'
            cursor.execute("UPDATE ordenes_compra SET saldo_pendiente = %s, estado = %s WHERE id = %s", 
                           (ord['saldo_pendiente'], estado_real, ord['id']))
        conexion.commit()
        
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
            INSERT INTO ordenes_compra (proveedor_id, total_estimado, saldo_pendiente, detalles_items, estado)
            VALUES (%s, %s, %s, %s, 'Pendiente')
        """, (orden.proveedor_id, orden.total_estimado, orden.total_estimado, orden.detalles_items))
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
            df = pd.read_excel(io.BytesIO(contenido), skiprows=3, engine='openpyxl')
            if len(df) > 0:
                headers = df.iloc[0].values
                df = df.iloc[1:].copy()
                df.columns = [str(h).strip() for h in headers]
        except Exception as e:
            return {"estado": "Error", "detalle": f"No se pudo leer el Excel: {str(e)}"}

        df.columns = df.columns.astype(str).str.strip()
        
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        
        importados = 0
        for index, fila in df.iterrows():
            nombre_excel = ""
            for col_n in ['Descripción del Artículo', 'Descripcion del Articulo', 'Descripcion', 'Descripción', 'nombre', 'producto']:
                if col_n in df.columns and pd.notna(fila[col_n]):
                    nombre_excel = str(fila[col_n]).strip()
                    break
            
            if not nombre_excel or nombre_excel.lower() in ['nan', 'none', '', 'hoja de toma física de inventario', 'responsable del conteo:']:
                continue
            
            sku_excel = ""
            for col_sku in ['Código / SKU', 'Codigo / SKU', 'SKU', 'Código', 'Codigo', 'sku']:
                if col_sku in df.columns and pd.notna(fila[col_sku]):
                    sku_excel = str(fila[col_sku]).strip()
                    break
            
            if not sku_excel or sku_excel.lower() in ['s/n', 'sn', 'nan', 'none']:
                sku_final = "GEN-" + uuid.uuid4().hex[:6].upper()
            else:
                try:
                    sku_final = str(int(float(sku_excel))) if ('e+' in sku_excel.lower() or '.' in sku_excel) else sku_excel
                except:
                    sku_final = sku_excel

            precio = 0.0
            for col_p in ['precio unitario', 'Precio unitario', 'Precio Unitario', 'precio', 'PVP']:
                if col_p in df.columns and pd.notna(fila[col_p]):
                    try:
                        precio = float(str(fila[col_p]).replace('$', '').replace(',', '').strip())
                        break
                    except:
                        pass
            
            stock_excel = 0
            for col_s in ['Cantidad Contada', 'cantidad contada', 'Stock', 'Cantidad', 'stock']:
                if col_s in df.columns and pd.notna(fila[col_s]):
                    try:
                        stock_excel = int(float(str(fila[col_s]).strip()))
                        break
                    except:
                        pass

            cat_excel = ""
            for col_c in ['Categoría', 'Categoria', 'categoría', 'categoria']:
                if col_c in df.columns and pd.notna(fila[col_c]):
                    cat_excel = str(fila[col_c]).strip().lower()
                    break
            
            id_cat = 1
            if any(w in cat_excel for w in ['baño', 'banio', 'gafiteria', 'herraje', 'accesorio']):
                id_cat = 4
            elif any(w in cat_excel for w in ['plomeria', 'plomería', 'polietileno', 'fluido']):
                id_cat = 5
            elif any(w in cat_excel for w in ['cocina']):
                id_cat = 11
            elif any(w in cat_excel for w in ['electricidad', 'electronica', 'electrónica']):
                id_cat = 3
            elif any(w in cat_excel for w in ['pintura', 'esmalte']):
                id_cat = 6
            elif any(w in cat_excel for w in ['jardin', 'jardín']):
                id_cat = 12
            elif any(w in cat_excel for w in ['herramienta']):
                id_cat = 1
            elif any(w in cat_excel for w in ['construccion', 'construcción', 'impermeabilizantes']):
                id_cat = 2
            elif any(w in cat_excel for w in ['insumo quimico', 'quimico', 'pegamento']):
                id_cat = 10
            else:
                nombre_lower = nombre_excel.lower()
                if any(w in nombre_lower for w in ['codo', 'tubo', 'te', 'pvc', 'valvula', 'grifo', 'sifon']):
                    id_cat = 4
                elif any(w in nombre_lower for w in ['cable', 'foco', 'interruptor', 'toma']):
                    id_cat = 3
                elif any(w in nombre_lower for w in ['pintura', 'esmalte', 'broca', 'rodillo']):
                    id_cat = 6
                else:
                    id_cat = 1

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
        registrar_log_interno("SINCRONIZACIÓN EXCEL", f"Sincronizados {importados} productos correctamente.")
        return {"estado": "Éxito", "mensaje": f"¡Se sincronizaron {importados} productos con sus categorías correctas!"}
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
        
        # 1. Verificar si el correo ya está registrado
        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (usuario.correo,))
        if cursor.fetchone(): 
            return {"estado": "Error", "detalle": "El correo electrónico ya está registrado."}
        
        # 2. Verificar si la cédula ya está registrada
        cursor.execute("SELECT id FROM usuarios WHERE cedula = %s", (usuario.cedula,))
        if cursor.fetchone(): 
            return {"estado": "Error", "detalle": "El número de cédula o RUC ya se encuentra registrado en el sistema."}
        
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
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        
        # 1. Obtener los datos actuales del usuario para no perder información
        cursor.execute("SELECT * FROM usuarios WHERE id = %s", (usuario_id,))
        usuario_actual = cursor.fetchone()
        if not usuario_actual:
            return {"estado": "Error", "detalle": "Usuario no encontrado."}

        # 2. Mantener los valores originales de nombre y cédula para bloquear su modificación por seguridad
        nombre_a_guardar = usuario_actual['nombre_completo']
        cedula_a_guardar = usuario_actual['cedula']
        
        # 3. Gestionar la contraseña (si viene vacía o es la misma encriptada, se conserva la actual)
        if not usuario.contrasena or usuario.contrasena == usuario_actual['contrasena']:
            hashed_pw = usuario_actual['contrasena']
        else:
            hashed_pw = get_password_hash(usuario.contrasena)
        
        # 4. Actualizar únicamente los campos permitidos (Dirección, WhatsApp y Contraseña opcional)
        cursor.execute("""
            UPDATE usuarios 
            SET nombre_completo = %s, contrasena = %s, direccion = %s, cedula = %s, whatsapp = %s 
            WHERE id = %s
        """, (
            nombre_a_guardar, 
            hashed_pw, 
            usuario.direccion or usuario_actual['direccion'], 
            cedula_a_guardar, 
            usuario.whatsapp or usuario_actual['whatsapp'], 
            usuario_id
        ))
        
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("ACTUALIZACIÓN PERFIL", f"El cliente con ID {usuario_id} actualizó su perfil exitosamente.")
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

# --- ENDPOINTS PARA CIERRE DE CAJA ---

@app.get("/caja/resumen-hoy")
def obtener_resumen_caja_hoy():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        
        hoy_str = datetime.now().strftime("%Y-%m-%d")
        
        cursor.execute("""
            SELECT metodo_pago, SUM(total_pagado) as total
            FROM pedidos
            WHERE CAST(fecha_pedido AS DATE) = %s
            GROUP BY metodo_pago;
        """, (hoy_str,))
        
        resultados = cursor.fetchall()
        cursor.close()
        conexion.close()
        
        efectivo = 0.0
        transferencia = 0.0
        credito = 0.0
        
        for row in resultados:
            metodo = (row['metodo_pago'] or '').lower()
            monto = float(row['total'])
            if 'efectivo' in metodo or 'caja' in metodo:
                efectivo += monto
            elif 'transferencia' in metodo:
                transferencia += monto
            elif 'crédito' in metodo or 'fiado' in metodo or 'abono' in metodo:
                credito += monto
                
        gran_total = efectivo + transferencia
        
        return {
            "estado": "Éxito",
            "resumen": {
                "efectivo": efectivo,
                "transferencia": transferencia,
                "credito": credito,
                "gran_total": gran_total
            }
        }
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/caja/cerrar")
def registrar_cierre_caja(cierre: CierreCajaNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO cierres_caja (total_efectivo, total_transferencia, total_credito, gran_total_sistema, efectivo_contado, diferencia, observaciones)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            cierre.total_efectivo, 
            cierre.total_transferencia, 
            cierre.total_credito, 
            cierre.gran_total_sistema, 
            cierre.efectivo_contado, 
            cierre.diferencia, 
            cierre.observaciones
        ))
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("CIERRE DE CAJA", f"Cierre de caja realizado con diferencia de ${cierre.diferencia:.2f}")
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/caja/historial")
def obtener_historial_cierres():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM cierres_caja ORDER BY fecha_cierre DESC LIMIT 30;")
        cierres = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "cierres": cierres}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/exportar/pedidos-rango")
def exportar_pedidos_rango(fecha_inicio: str, fecha_fin: str):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        query = """
            SELECT id AS "ID Pedido", nombre_cliente AS "Cliente", correo_cliente AS "Correo", 
                   cedula AS "Cédula / RUC", whatsapp AS "WhatsApp", direccion AS "Dirección", 
                   metodo_pago AS "Método de Pago", total_pagado AS "Total Pagado ($)", 
                   fecha_pedido AS "Fecha y Hora" 
            FROM pedidos 
            WHERE DATE(fecha_pedido) >= %s AND DATE(fecha_pedido) <= %s
            ORDER BY fecha_pedido DESC
        """
        df = pd.read_sql(query, conexion, params=(fecha_inicio, fecha_fin))
        conexion.close()
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Ventas por Rango')
        output.seek(0)
        
        filename = f"ventas_{fecha_inicio}_al_{fecha_fin}.xlsx"
        return StreamingResponse(
            output, 
            headers={'Content-Disposition': f'attachment; filename="{filename}"'}, 
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.put("/ordenes-compra/{orden_id}")
def actualizar_orden_compra(orden_id: int, orden: OrdenActualizar):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        cursor.execute("""
            UPDATE ordenes_compra 
            SET total_estimado = %s, saldo_pendiente = %s, detalles_items = %s, metodo_pago_credito = %s
            WHERE id = %s
        """, (orden.total_estimado, orden.total_estimado, orden.detalles_items, orden.metodo_pago_credito, orden_id))
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("ACTUALIZAR ORDEN", f"Se actualizó la orden de compra #{orden_id} a ${orden.total_estimado:.2f}")
        return {"estado": "Éxitor"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.post("/ordenes-compra/abonar")
def registrar_abono_proveedor(abono: AbonoProveedorNuevo):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        
        # 1. Obtener la orden para conocer su total
        cursor.execute("SELECT id, total_estimado FROM ordenes_compra WHERE id = %s", (abono.orden_id,))
        orden = cursor.fetchone()
        if not orden:
            return {"estado": "Error", "detalle": "Orden de compra no encontrada."}
        
        # 2. Registrar el abono
        cursor.execute("""
            INSERT INTO abonos_proveedores (orden_id, monto_abonado, tipo_pago, referencia_banco)
            VALUES (%s, %s, %s, %s)
        """, (abono.orden_id, abono.monto_abonado, abono.tipo_pago, abono.referencia_banco))
        
        # 3. Calcular la suma total de abonos realizados a esta orden
        cursor.execute("SELECT COALESCE(SUM(monto_abonado), 0) as total_abonado FROM abonos_proveedores WHERE orden_id = %s", (abono.orden_id,))
        suma_abonos = cursor.fetchone()['total_abonado']
        
        # 4. Calcular el nuevo saldo pendiente y determinar el estado exacto
        nuevo_saldo = max(float(orden['total_estimado']) - float(suma_abonos), 0.0)
        nuevo_estado = 'Pagado' if nuevo_saldo <= 0 else 'Pendiente'
        
        # 5. Actualizar la orden de compra
        cursor.execute("""
            UPDATE ordenes_compra 
            SET saldo_pendiente = %s,
                estado = %s
            WHERE id = %s
        """, (nuevo_saldo, nuevo_estado, abono.orden_id))
        
        conexion.commit()
        cursor.close()
        conexion.close()
        registrar_log_interno("ABONO A PROVEEDOR", f"Abono de ${abono.monto_abonado:.2f} ({abono.tipo_pago}) registrado para la orden #{abono.orden_id}")
        return {"estado": "Éxito"}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/ordenes-compra")
def obtener_ordenes():
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT o.id, o.estado, o.total_estimado, 
                   GREATEST(o.total_estimado - COALESCE((SELECT SUM(monto_abonado) FROM abonos_proveedores WHERE orden_id = o.id), 0), 0) AS saldo_pendiente,
                   o.detalles_items, o.fecha_orden, 
                   COALESCE(o.metodo_pago_credito, 'Crédito') as metodo_pago_credito, 
                   p.nombre_empresa AS proveedor 
            FROM ordenes_compra o 
            JOIN proveedores p ON o.proveedor_id = p.id 
            ORDER BY o.fecha_orden DESC;
        """)
        ordenes = cursor.fetchall()
        
        # Actualizar automáticamente en base al saldo real calculado
        for ord in ordenes:
            saldo_actual = float(ord['saldo_pendiente'])
            estado_real = 'Pagado' if saldo_actual <= 0 else 'Pendiente'
            cursor.execute("UPDATE ordenes_compra SET saldo_pendiente = %s, estado = %s WHERE id = %s", 
                           (saldo_actual, estado_real, ord['id']))
        conexion.commit()
        
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "ordenes": ordenes}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}

@app.get("/ordenes-compra/{orden_id}/abonos")
def obtener_abonos_orden(orden_id: int):
    try:
        conexion = psycopg2.connect(**DB_CONFIG)
        cursor = conexion.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id, monto_abonado, tipo_pago, referencia_banco, fecha_abono 
            FROM abonos_proveedores 
            WHERE orden_id = %s 
            ORDER BY fecha_abono DESC;
        """, (orden_id,))
        abonos = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"estado": "Éxito", "abonos": abonos}
    except Exception as error:
        return {"estado": "Error", "detalle": str(error)}