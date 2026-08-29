import React from 'react';

// Estilo compartido para todos los inputs de los modales
const estiloInput = { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' };

export function ModalAuth({ modalAuthAbierto, setModalAuthAbierto, modoRegistro, setModoRegistro, formAuth, manejarCambioAuth, gestionarLoginRegistro }) {
  if (!modalAuthAbierto) return null; // Si no está abierto, no dibuja nada en pantalla

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '380px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative', border: '3px solid #000' }}>
        <button onClick={() => setModalAuthAbierto(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
        <h2 style={{ textAlign: 'center', marginTop: 0, color: '#000' }}>{modoRegistro ? 'Crea tu Cuenta' : 'Iniciar Sesión'}</h2>
        <form onSubmit={gestionarLoginRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
          {modoRegistro && (
            <>
              <input name="nombre_completo" placeholder="Nombre completo" value={formAuth.nombre_completo} onChange={manejarCambioAuth} required style={estiloInput} />
              <input name="cedula" placeholder="Cédula o RUC" value={formAuth.cedula} onChange={manejarCambioAuth} required style={estiloInput} />
              <input name="whatsapp" placeholder="Número de WhatsApp" value={formAuth.whatsapp} onChange={manejarCambioAuth} required style={estiloInput} />
              <input name="direccion" placeholder="Dirección de entrega" value={formAuth.direccion} onChange={manejarCambioAuth} required style={estiloInput} />
            </>
          )}
          <input name="correo" type="email" placeholder="Correo electrónico" value={formAuth.correo} onChange={manejarCambioAuth} required style={estiloInput} />
          <input name="contrasena" type="password" placeholder="Contraseña" value={formAuth.contrasena} onChange={manejarCambioAuth} required style={estiloInput} />
          <button type="submit" style={{ padding: '12px', backgroundColor: '#fcee21', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
            {modoRegistro ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          <span onClick={() => setModoRegistro(!modoRegistro)} style={{ color: '#0066cc', cursor: 'pointer', fontWeight: 'bold' }}>
            {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ModalFactura({ modalFacturaAbierto, setModalFacturaAbierto, datosFactura, manejarCambioFactura, enviarDatosFacturaExtra }) {
  if (!modalFacturaAbierto) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '360px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative', border: '3px solid #000' }}>
        <button onClick={() => setModalFacturaAbierto(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
        <h3 style={{ textAlign: 'center', marginTop: 0, color: '#000' }}>Datos para tu Nota de Entrega</h3>
        <form onSubmit={enviarDatosFacturaExtra} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
          <input name="cedula" placeholder="Cédula o RUC" value={datosFactura.cedula} onChange={manejarCambioFactura} required style={estiloInput} />
          <input name="whatsapp" placeholder="Número de WhatsApp" value={datosFactura.whatsapp} onChange={manejarCambioFactura} required style={estiloInput} />
          <input name="direccion" placeholder="Dirección de entrega" value={datosFactura.direccion} onChange={manejarCambioFactura} required style={estiloInput} />
          <button type="submit" style={{ padding: '12px', backgroundColor: '#fcee21', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Confirmar y Procesar Compra
          </button>
        </form>
      </div>
    </div>
  );
}

export function ModalAdmin({ modalAdminAbierto, setModalAdminAbierto, claveAdmin, setClaveAdmin, verificarAdmin }) {
  if (!modalAdminAbierto) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '320px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative', border: '3px solid #000' }}>
        <button onClick={() => setModalAdminAbierto(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
        <h3 style={{ textAlign: 'center', marginTop: 0, color: '#000' }}>Acceso Restringido</h3>
        <form onSubmit={verificarAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <input type="password" placeholder="Contraseña Admin" value={claveAdmin} onChange={(e) => setClaveAdmin(e.target.value)} required autoFocus style={estiloInput} />
          <button type="submit" style={{ padding: '12px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Entrar al Panel
          </button>
        </form>
      </div>
    </div>
  );
}

export function ModalDetallePedido({ clienteSeleccionado, setClienteSeleccionado }) {
  if (!clienteSeleccionado) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '400px', border: '3px solid #000', position: 'relative' }}>
        <button onClick={() => setClienteSeleccionado(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
        <h3 style={{ marginTop: 0, borderBottom: '2px solid #fcee21', paddingBottom: '8px' }}>📋 Pedido #{clienteSeleccionado.id}</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <p><strong>Cliente:</strong> {clienteSeleccionado.nombre_cliente}</p>
          <p><strong>Cédula:</strong> {clienteSeleccionado.cedula}</p>
          <p><strong>WhatsApp:</strong> {clienteSeleccionado.whatsapp}</p>
          <p><strong>Dirección:</strong> {clienteSeleccionado.direccion}</p>
          <p><strong>Total Pagado:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>${parseFloat(clienteSeleccionado.total_pagado).toFixed(2)}</span></p>
        </div>
      </div>
    </div>
  );
}