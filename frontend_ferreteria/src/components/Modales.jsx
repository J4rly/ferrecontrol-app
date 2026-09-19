import React, { useState, useEffect } from 'react';

export function ModalAuth({ modalAuthAbierto, setModalAuthAbierto, modoRegistro, setModoRegistro, formAuth, manejarCambioAuth, gestionarLoginRegistro }) {
  if (!modalAuthAbierto) return null;
  const estiloInput = { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <button onClick={() => setModalAuthAbierto(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✖</button>
        <h2 style={{ marginTop: 0, color: '#000', textAlign: 'center', marginBottom: '20px' }}>{modoRegistro ? '📝 Registro de Cliente' : '👤 Iniciar Sesión'}</h2>
        
        <form onSubmit={gestionarLoginRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {modoRegistro && (
            <>
              <input name="nombre_completo" placeholder="1er Nombre y 1er Apellido" value={formAuth.nombre_completo} onChange={manejarCambioAuth} required style={estiloInput} />
              <input name="direccion" placeholder="Dirección de entrega" value={formAuth.direccion} onChange={manejarCambioAuth} required style={estiloInput} />
              <input name="cedula" placeholder="Cédula o RUC" value={formAuth.cedula} onChange={manejarCambioAuth} required style={estiloInput} />
              <input name="whatsapp" placeholder="Número de WhatsApp" value={formAuth.whatsapp} onChange={manejarCambioAuth} required style={estiloInput} />
            </>
          )}
          <input type="email" name="correo" placeholder="Correo electrónico" value={formAuth.correo} onChange={manejarCambioAuth} required style={estiloInput} />
          <input type="password" name="contrasena" placeholder="Contraseña" value={formAuth.contrasena} onChange={manejarCambioAuth} required style={estiloInput} />
          
          <button type="submit" style={{ padding: '12px', backgroundColor: '#fcee21', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
            {modoRegistro ? 'Registrarse' : 'Entrar'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#555' }}>
          {modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} {' '}
          <span onClick={() => setModoRegistro(!modoRegistro)} style={{ color: '#0066cc', cursor: 'pointer', fontWeight: 'bold' }}>
            {modoRegistro ? 'Inicia sesión aquí' : 'Regístrate aquí'}
          </span>
        </p>
      </div>
    </div>
  );
}

export function ModalFactura({ modalFacturaAbierto, setModalFacturaAbierto, datosFactura, manejarCambioFactura, enviarDatosFacturaExtra }) {
  if (!modalFacturaAbierto) return null;
  const estiloInput = { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '450px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <button onClick={() => setModalFacturaAbierto(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✖</button>
        <h2 style={{ marginTop: 0, color: '#000', textAlign: 'center' }}>📋 Datos de Envío y Facturación</h2>
        <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginBottom: '20px' }}>Por favor completa tus datos para procesar el pedido en Guayaquil.</p>
        
        <form onSubmit={enviarDatosFacturaExtra} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input name="direccion" placeholder="Dirección exacta de entrega" value={datosFactura.direccion} onChange={manejarCambioFactura} required style={estiloInput} />
          <input name="cedula" placeholder="Número de Cédula o RUC" value={datosFactura.cedula} onChange={manejarCambioFactura} required style={estiloInput} />
          <input name="whatsapp" placeholder="Número de WhatsApp de contacto" value={datosFactura.whatsapp} onChange={manejarCambioFactura} required style={estiloInput} />
          
          <button type="submit" style={{ padding: '12px', backgroundColor: '#fcee21', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
            Continuar con el pago
          </button>
        </form>
      </div>
    </div>
  );
}

export function ModalMetodoPago({ modalPagoAbierto, setModalPagoAbierto, seleccionarMetodoPago, totalPagar }) {
  if (!modalPagoAbierto) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '450px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', textAlign: 'center' }}>
        <button onClick={() => setModalPagoAbierto(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✖</button>
        
        <h2 style={{ marginTop: 0, color: '#000' }}>💳 Selecciona tu Método de Pago</h2>
        <p style={{ fontSize: '15px', color: '#555', marginBottom: '20px' }}>
          Total a pagar: <strong style={{ color: '#008000', fontSize: '18px' }}>${totalPagar.toFixed(2)}</strong>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div 
            onClick={() => seleccionarMetodoPago('Efectivo')}
            style={{ padding: '20px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fafafa', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#000'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#ddd'}
          >
            <span style={{ fontSize: '32px' }}>💵</span>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#000' }}>Efectivo contra entrega</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Pagas en efectivo al momento que recibes tus productos.</p>
            </div>
          </div>

          <div 
            onClick={() => seleccionarMetodoPago('Transferencia')}
            style={{ padding: '20px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fafafa', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#000'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#ddd'}
          >
            <span style={{ fontSize: '32px' }}>🏦</span>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#000' }}>Transferencia Bancaria</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Realiza una transferencia directa a nuestras cuentas bancarias.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalDatosBanco({ modalBancoAbierto, setModalBancoAbierto, confirmarTransferencia, totalPagar }) {
  const [archivoVoucher, setArchivoVoucher] = useState(null);

  if (!modalBancoAbierto) return null;

  const manejarArchivo = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoVoucher(e.target.files[0]);
    }
  };

  const handleConfirmar = () => {
    if (!archivoVoucher) {
      alert("Por favor adjunta la foto o PDF del comprobante de transferencia.");
      return;
    }
    confirmarTransferencia(archivoVoucher);
    setArchivoVoucher(null);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '450px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={() => setModalBancoAbierto(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✖</button>
        
        <h2 style={{ marginTop: 0, color: '#000' }}>🏦 Datos para Transferencia</h2>
        <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
          Realiza tu transferencia por <strong style={{ color: '#008000' }}>${totalPagar.toFixed(2)}</strong> a nombre de <strong>Ferretería L E</strong>:
        </p>

        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'left', fontSize: '14px', marginBottom: '15px', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 6px 0' }}><strong>Banco Pichincha</strong> (Cuenta Corriente)</p>
          <p style={{ margin: '0 0 6px 0' }}>Nro: <strong>3050409020</strong></p>
          <p style={{ margin: '0 0 6px 0' }}>RUC: <strong>0992837465001</strong></p>
          <p style={{ margin: 0 }}>Correo: <strong>pagos@ferreterialle.com</strong></p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'left', border: '2px dashed #000', padding: '15px', borderRadius: '6px', backgroundColor: '#fffdf0' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
            📎 Adjuntar Comprobante (Foto o PDF):
          </label>
          <input 
            type="file" 
            accept="image/*, application/pdf" 
            onChange={manejarArchivo}
            style={{ width: '100%', fontSize: '13px' }}
          />
          {archivoVoucher && (
            <p style={{ fontSize: '12px', color: '#008000', marginTop: '8px', marginBottom: 0, fontWeight: 'bold' }}>
              ✓ Archivo seleccionado: {archivoVoucher.name}
            </p>
          )}
        </div>

        <button 
          onClick={handleConfirmar}
          style={{ width: '100%', padding: '12px', backgroundColor: '#fcee21', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          ✅ Confirmar Transferencia
        </button>
      </div>
    </div>
  );
}

export function ModalRecibo({ modalReciboAbierto, setModalReciboAbierto, datosRecibo }) {
  if (!modalReciboAbierto || !datosRecibo) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '500px', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <button onClick={() => setModalReciboAbierto(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✖</button>
        
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #ddd', paddingBottom: '15px', marginBottom: '15px' }}>
          <h2 style={{ margin: '0 0 5px 0', color: '#000' }}>FERRETERÍA L E</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Soluciones Integrales • Guayaquil, Ecuador</p>
          <h3 style={{ margin: '15px 0 0 0', color: '#008000', fontSize: '18px' }}>🧾 COMPROBANTE DE PAGO</h3>
        </div>

        <div style={{ fontSize: '13px', color: '#333', marginBottom: '15px', lineHeight: '1.5' }}>
          <p style={{ margin: 0 }}><strong>Cliente:</strong> {datosRecibo.nombre_cliente}</p>
          <p style={{ margin: 0 }}><strong>Cédula / RUC:</strong> {datosRecibo.cedula}</p>
          <p style={{ margin: 0 }}><strong>Dirección:</strong> {datosRecibo.direccion}</p>
          <p style={{ margin: 0 }}><strong>WhatsApp:</strong> {datosRecibo.whatsapp}</p>
          <p style={{ margin: 0 }}><strong>Método de Pago:</strong> <span style={{ color: '#0066cc', fontWeight: 'bold' }}>{datosRecibo.metodo_pago}</span></p>
          {datosRecibo.voucher && (
            <p style={{ margin: 0 }}><strong>Comprobante adjunto:</strong> <span style={{ color: '#008000', fontWeight: 'bold' }}>{datosRecibo.voucher}</span></p>
          )}
          <p style={{ margin: 0 }}><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
        </div>

        <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '15px', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '10px 0' }}>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#666', borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', paddingBottom: '5px' }}>Artículo</th>
                <th style={{ textAlign: 'center', paddingBottom: '5px' }}>Cant</th>
                <th style={{ textAlign: 'right', paddingBottom: '5px' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {datosRecibo.carrito.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '6px 0' }}>{item.nombre}</td>
                  <td style={{ textAlign: 'center', padding: '6px 0' }}>{item.cantidad}</td>
                  <td style={{ textAlign: 'right', padding: '6px 0' }}>${(item.cantidad * item.precio_venta).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
          <span>Total Cancelado:</span>
          <span style={{ color: '#008000' }}>${datosRecibo.total_pagado.toFixed(2)}</span>
        </div>

        <button 
          onClick={() => { setModalReciboAbierto(false); window.location.reload(); }}
          style={{ width: '100%', padding: '12px', backgroundColor: '#fcee21', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          Finalizar y Cerrar
        </button>

      </div>
    </div>
  );
}

export function ModalAdmin({ modalAdminAbierto, setModalAdminAbierto, claveAdmin, setClaveAdmin, verificarAdmin }) {
  if (!modalAdminAbierto) return null;
  const estiloInput = { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '350px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <button onClick={() => setModalAdminAbierto(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✖</button>
        <h2 style={{ marginTop: 0, color: '#000', textAlign: 'center' }}>🔐 Acceso Administrador</h2>
        
        <form onSubmit={verificarAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <input type="password" placeholder="Contraseña de administrador" value={claveAdmin} onChange={(e) => setClaveAdmin(e.target.value)} required style={estiloInput} />
          <button type="submit" style={{ padding: '12px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export function ModalDetallePedido({ clienteSeleccionado, setClienteSeleccionado }) {
  if (!clienteSeleccionado) return null;

  const esUrlServidor = clienteSeleccionado.voucher && clienteSeleccionado.voucher.startsWith("http");
  const esPendiente = clienteSeleccionado.metodo_pago && clienteSeleccionado.metodo_pago.includes('Pendiente');

  let itemsTicket = [];
  try {
    if (clienteSeleccionado.carrito) {
      itemsTicket = JSON.parse(clienteSeleccionado.carrito);
    }
  } catch (e) {
    console.error("No se pudo leer los items del pedido");
  }

  const aprobarPedidoAdmin = async () => {
    try {
      const revisor = clienteSeleccionado.revisor || "Administrador";
      const respuesta = await fetch(`http://192.168.1.82:8000/pedidos/${clienteSeleccionado.id}/aprobar?usuario=${encodeURIComponent(revisor)}`, {
        method: 'PUT'
      });
      const datos = await respuesta.json();
      if (datos.estado === "Éxito") {
        alert("✅ Pedido aprobado y stock descontado correctamente de la bodega.");
        setClienteSeleccionado(null);
        window.location.reload(); 
      } else {
        alert("Error al aprobar: " + datos.detalle);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  };

  const rechazarPedidoAdmin = async () => {
    const confirmar = window.confirm("¿Estás seguro de RECHAZAR y ELIMINAR este pedido falso/cancelado? Esta acción limpiará la base de datos y no se puede deshacer.");
    if (!confirmar) return;

    try {
      const revisor = clienteSeleccionado.revisor || "Administrador";
      const respuesta = await fetch(`http://192.168.1.82:8000/pedidos/${clienteSeleccionado.id}?usuario=${encodeURIComponent(revisor)}`, {
        method: 'DELETE'
      });
      const datos = await respuesta.json();
      if (datos.estado === "Éxito") {
        alert("❌ Pedido rechazado y eliminado de los registros exitosamente.");
        setClienteSeleccionado(null);
        window.location.reload(); 
      } else {
        alert("Error al rechazar: " + datos.detalle);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  };

  const imprimirRecibo = () => { window.print(); };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      <style>{`
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body { margin: 0; padding: 0; background: #fff; }
          .no-imprimir-modal { display: none !important; }
          #ticket-pedido-impresion { 
            display: block !important; 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 72mm; 
            padding: 4mm;
            margin: 0 auto; 
            font-family: 'Courier New', Courier, monospace; 
            font-size: 12px; 
            color: #000;
            background: white;
          }
        }
      `}</style>

      <div className="no-imprimir-modal" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '450px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={() => setClienteSeleccionado(null)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✖</button>
        
        <h2 style={{ marginTop: 0, color: '#000', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📦 Detalles del Pedido</h2>
        
        <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.8', marginTop: '15px' }}>
          <p style={{ margin: 0 }}><strong>Pedido ID:</strong> #{clienteSeleccionado.id}</p>
          <p style={{ margin: 0 }}><strong>Cliente:</strong> {clienteSeleccionado.nombre_cliente}</p>
          <p style={{ margin: 0 }}><strong>Correo:</strong> {clienteSeleccionado.correo_cliente}</p>
          <p style={{ margin: 0 }}><strong>Cédula / RUC:</strong> {clienteSeleccionado.cedula}</p>
          <p style={{ margin: 0 }}><strong>WhatsApp:</strong> {clienteSeleccionado.whatsapp}</p>
          <p style={{ margin: 0 }}><strong>Dirección:</strong> {clienteSeleccionado.direccion}</p>
          <p style={{ margin: 0 }}><strong>Método de Pago:</strong> <span style={{ color: '#0066cc', fontWeight: 'bold' }}>{clienteSeleccionado.metodo_pago || 'Efectivo'}</span></p>
          
          {clienteSeleccionado.voucher ? (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#008000', fontSize: '13px' }}>📄 Comprobante de Pago:</p>
              
              {esUrlServidor ? (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <a 
                    href={clienteSeleccionado.voucher} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ padding: '8px 14px', backgroundColor: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    👁️ Ver Imagen
                  </a>
                  <a 
                    href={clienteSeleccionado.voucher} 
                    download 
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '8px 14px', backgroundColor: '#28a745', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    📥 Descargar
                  </a>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    window.open(`https://wa.me/593${clienteSeleccionado.whatsapp.replace(/\D/g,'')}?text=Hola%20${clienteSeleccionado.nombre_cliente},%20te%20escribimos%20de%20Ferretería%20L%20E%20para%20validar%20el%20comprobante%20de%20tu%20pedido%20%23${clienteSeleccionado.id}.`, '_blank');
                  }}
                  style={{ padding: '8px 16px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  💬 Pedir por WhatsApp
                </button>
              )}
            </div>
          ) : (
            <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>Pago en efectivo (Sin comprobante digital)</p>
          )}

          <p style={{ margin: '15px 0 15px 0', fontSize: '16px' }}><strong>Total Pagado:</strong> <span style={{ color: '#008000', fontWeight: 'bold' }}>${parseFloat(clienteSeleccionado.total_pagado).toFixed(2)}</span></p>

          {esPendiente ? (
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={aprobarPedidoAdmin}
                style={{ flex: 1, padding: '12px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                ✅ Aprobar y Descontar
              </button>
              <button 
                onClick={rechazarPedidoAdmin}
                style={{ flex: 1, padding: '12px', backgroundColor: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                ❌ Rechazar (Eliminar)
              </button>
            </div>
          ) : (
            <div style={{ padding: '12px', backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
              ✓ Este pedido ya está validado y procesado
            </div>
          )}

          <button 
            onClick={imprimirRecibo}
            style={{ width: '100%', padding: '12px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}
          >
            🖨️ Imprimir Recibo del Pedido
          </button>
        </div>
      </div>

      <div id="ticket-pedido-impresion" style={{ display: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: 'bold' }}>FERRETERÍA L E</h2>
          <p style={{ margin: '2px 0', fontSize: '12px' }}>RUC: 0992837465001</p>
          <p style={{ margin: '2px 0', fontSize: '12px' }}>Batallón del Suburbio - Guayaquil</p>
          <p style={{ margin: '2px 0', fontSize: '12px' }}>Tel: 0987654321</p>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

        <div style={{ marginBottom: '10px', fontSize: '12px' }}>
          <p style={{ margin: '2px 0' }}><strong>Pedido:</strong> #{clienteSeleccionado.id}</p>
          <p style={{ margin: '2px 0' }}><strong>Fecha:</strong> {new Date(clienteSeleccionado.fecha_pedido).toLocaleDateString()}</p>
          <p style={{ margin: '2px 0' }}><strong>Cliente:</strong> {clienteSeleccionado.nombre_cliente}</p>
          <p style={{ margin: '2px 0' }}><strong>C.I/RUC:</strong> {clienteSeleccionado.cedula}</p>
          <p style={{ margin: '2px 0' }}><strong>Pago:</strong> {clienteSeleccionado.metodo_pago}</p>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

        {itemsTicket.length > 0 ? (
          <table style={{ width: '100%', textAlign: 'left', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', width: '15%' }}>Cant</th>
                <th style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', width: '60%' }}>Descripción</th>
                <th style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', textAlign: 'right', width: '25%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {itemsTicket.map((it, idx) => (
                <tr key={idx}>
                  <td style={{ paddingTop: '5px', verticalAlign: 'top' }}>{it.cantidad}</td>
                  <td style={{ paddingTop: '5px' }}>
                    {it.nombre}<br/>
                    <small style={{ color: '#555' }}>${parseFloat(it.precio_venta).toFixed(2)} c/u</small>
                  </td>
                  <td style={{ paddingTop: '5px', textAlign: 'right', verticalAlign: 'top' }}>${(it.precio_venta * it.cantidad).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#555', fontStyle: 'italic' }}>* Detalle de artículos no disponible en vista rápida *</p>
        )}

        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', margin: '10px 0' }}>
          <span>TOTAL:</span>
          <span>${parseFloat(clienteSeleccionado.total_pagado).toFixed(2)}</span>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

        <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '15px' }}>
          <p style={{ margin: '2px 0' }}>¡Gracias por su compra!</p>
          <p style={{ margin: '2px 0' }}>Revise su mercadería antes de salir.</p>
          <p style={{ margin: '2px 0' }}>* Documento sin validez tributaria *</p>
        </div>
      </div>
      
    </div>
  );
}

export function ModalMiCuenta({ modalCuentaAbierto, setModalCuentaAbierto, usuarioLogueado, setUsuarioLogueado }) {
  const [formCuenta, setFormCuenta] = useState({
    contrasena: '',
    direccion: usuarioLogueado?.direccion || '',
    whatsapp: usuarioLogueado?.whatsapp || ''
  });
  
  const [mostrarPassword, setMostrarPassword] = useState(false);

  if (!modalCuentaAbierto || !usuarioLogueado) return null;

  const manejarCambio = (e) => {
    setFormCuenta({ ...formCuenta, [e.target.name]: e.target.value });
  };

  const guardarCambios = (e) => {
    e.preventDefault();
    
    const datosAEnviar = {
      nombre_completo: usuarioLogueado.nombre_completo,
      cedula: usuarioLogueado.cedula,
      direccion: formCuenta.direccion,
      whatsapp: formCuenta.whatsapp,
      contrasena: formCuenta.contrasena ? formCuenta.contrasena : usuarioLogueado.contrasena
    };

    fetch(`http://192.168.1.82:8000/usuarios/${usuarioLogueado.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosAEnviar)
    })
    .then(r => r.json())
    .then(res => {
      if (res.estado === "Éxito") {
        setUsuarioLogueado({ ...usuarioLogueado, ...datosAEnviar });
        alert("¡Tus datos de cuenta han sido actualizados con éxito!");
        setModalCuentaAbierto(false);
      } else {
        alert("Error al actualizar: " + res.detalle);
      }
    });
  };

  const estiloInput = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
  const inputBloqueado = { ...estiloInput, backgroundColor: '#f0f0f0', color: '#666', cursor: 'not-allowed' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '420px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={() => setModalCuentaAbierto(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✖</button>
        
        <h2 style={{ marginTop: 0, color: '#000', borderBottom: '2px solid #eee', paddingBottom: '10px', textAlign: 'center' }}>⚙️ Mi Cuenta / Perfil</h2>
        
        <form onSubmit={guardarCambios} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>1er Nombre y 1er Apellido (No modificable):</label>
            <input value={usuarioLogueado.nombre_completo} disabled style={inputBloqueado} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Correo Electrónico (No modificable):</label>
            <input type="email" value={usuarioLogueado.correo} disabled style={inputBloqueado} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Cédula / RUC (No modificable):</label>
            <input value={usuarioLogueado.cedula} disabled style={inputBloqueado} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Nueva Contraseña (Opcional):</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={mostrarPassword ? "text" : "password"} 
                name="contrasena" 
                placeholder="Déjalo en blanco si no deseas cambiarla" 
                value={formCuenta.contrasena} 
                onChange={manejarCambio} 
                style={{ ...estiloInput, paddingRight: '40px' }} 
              />
              <button 
                type="button" 
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                title={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {mostrarPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Dirección de Entrega:</label>
            <input name="direccion" value={formCuenta.direccion} onChange={manejarCambio} required style={estiloInput} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Número de WhatsApp:</label>
            <input name="whatsapp" value={formCuenta.whatsapp} onChange={manejarCambio} required style={estiloInput} />
          </div>

          <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#fcee21', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
            💾 Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}

export function ModalMisCompras({ modalComprasAbierto, setModalComprasAbierto, usuarioLogueado }) {
  const [misPedidos, setMisPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (modalComprasAbierto && usuarioLogueado) {
      setCargando(true);
      fetch(`http://192.168.1.82:8000/pedidos/cliente/${usuarioLogueado.correo}`)
        .then(r => r.json())
        .then(data => {
          if (data.estado === "Éxito") {
            setMisPedidos(data.pedidos);
          }
          setCargando(false);
        });
    }
  }, [modalComprasAbierto, usuarioLogueado]);

  if (!modalComprasAbierto || !usuarioLogueado) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '550px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={() => setModalComprasAbierto(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✖</button>
        
        <h2 style={{ marginTop: 0, color: '#000', borderBottom: '2px solid #eee', paddingBottom: '10px', textAlign: 'center' }}>📦 Mis Compras Realizadas</h2>
        
        {cargando ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Cargando tu historial...</p>
        ) : misPedidos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            {misPedidos.map((pedido) => (
              <div key={pedido.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Pedido #{pedido.id}</p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '12px', color: '#666' }}>📅 Fecha: {new Date(pedido.fecha_pedido).toLocaleString()}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>💳 Pago: <span style={{ color: '#0066cc', fontWeight: 'bold' }}>{pedido.metodo_pago}</span></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#008000' }}>${parseFloat(pedido.total_pagado).toFixed(2)}</p>
                  {pedido.voucher ? (
                    <a href={pedido.voucher} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', backgroundColor: '#0066cc', color: '#fff', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                      Ver Voucher
                    </a>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>Efectivo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>Aún no has realizado ninguna compra en nuestra ferretería.</p>
        )}
      </div>
    </div>
  );
}