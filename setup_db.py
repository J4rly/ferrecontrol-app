import psycopg2

DB_CONFIG = {
    "dbname": "ferreteria_le",
    "user": "postgres",
    "password": "lorena",  
    "host": "localhost",
    "port": "5432"
}

def setup():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # Eliminar tablas viejas incompletas
    cursor.execute("""
    DROP TABLE IF EXISTS productos CASCADE;
    DROP TABLE IF EXISTS pedidos CASCADE;
    DROP TABLE IF EXISTS usuarios CASCADE;
    DROP TABLE IF EXISTS creditos_clientes CASCADE;
    DROP TABLE IF EXISTS abonos_creditos CASCADE;
    DROP TABLE IF EXISTS proveedores CASCADE;
    DROP TABLE IF EXISTS ordenes_compra CASCADE;
    DROP TABLE IF EXISTS producto_likes CASCADE;
    """)

    # Construir la estructura profesional
    cursor.execute("""
    CREATE TABLE productos (
        sku VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        id_categoria INT,
        costo_interno FLOAT DEFAULT 0.0,
        precio_venta FLOAT NOT NULL,
        stock INT NOT NULL,
        descripcion_corta TEXT,
        ventas INT DEFAULT 0,
        imagen_url TEXT,
        oferta_tipo TEXT,
        likes INT DEFAULT 0,
        activo BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE pedidos (
        id SERIAL PRIMARY KEY,
        nombre_cliente VARCHAR(150),
        correo_cliente VARCHAR(150),
        total_pagado FLOAT,
        cedula VARCHAR(20),
        whatsapp VARCHAR(20),
        direccion TEXT,
        metodo_pago VARCHAR(50),
        voucher TEXT,
        carrito TEXT,
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nombre_completo VARCHAR(150),
        correo VARCHAR(150) UNIQUE,
        contrasena VARCHAR(200),
        direccion TEXT,
        cedula VARCHAR(20),
        whatsapp VARCHAR(20)
    );

    CREATE TABLE creditos_clientes (
        id SERIAL PRIMARY KEY,
        nombre_cliente VARCHAR(150),
        cedula VARCHAR(20),
        telefono VARCHAR(20),
        limite_credito FLOAT,
        saldo_actual FLOAT,
        estado VARCHAR(50)
    );

    CREATE TABLE abonos_creditos (
        id SERIAL PRIMARY KEY,
        credito_id INT,
        monto_abonado FLOAT,
        tipo_pago VARCHAR(50),
        fecha_abono TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE proveedores (
        id SERIAL PRIMARY KEY,
        nombre_empresa VARCHAR(150),
        contacto VARCHAR(150),
        telefono VARCHAR(20),
        correo VARCHAR(150),
        categoria_principal VARCHAR(100)
    );

    CREATE TABLE ordenes_compra (
        id SERIAL PRIMARY KEY,
        proveedor_id INT,
        total_estimado FLOAT,
        detalles_items TEXT,
        estado VARCHAR(50),
        fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE producto_likes (
        id SERIAL PRIMARY KEY,
        usuario_id INT,
        sku VARCHAR(50)
    );
    """)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("¡Base de datos estructurada correctamente con todas las tablas profesionales!")

if __name__ == "__main__":
    setup()