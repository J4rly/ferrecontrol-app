import React from 'react';

function AdminPanel({
  irAInicio, pedidosAdmin, setClienteSeleccionado, editando, setEditando, nuevoProducto,
  estadoInicial, setNuevoProducto, manejarCambio, guardarProducto, productos,
  prepararEdicion, eliminarProducto, departamentos
}) {
  const estiloInput = { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button onClick={irAInicio} style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Volver a la Tienda
        </button>
      </div>
      
      <header style={{ backgroundColor: '#fcee21', padding: '25px', borderRadius: '8px', borderBottom: '5px solid #000', marginBottom: '25px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <img src="/logo.jpeg" alt="Logo Ferretería L E" onClick={irAInicio} style={{ width: '100%', maxWidth: '750px', maxHeight: '180px', objectFit: 'contain', cursor: 'pointer' }} />
        <h1 style={{ color: '#000', margin: 0, fontSize: '32px', fontWeight: 'bold' }}>Panel de Administración</h1>
      </header>

      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginBottom: '30px', borderTop: '4px solid #000' }}>
        <h2 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📦 Historial de Pedidos</h2>
        {pedidosAdmin.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#000', color: '#fcee21' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Cliente</th>
                  <th style={{ padding: '12px' }}>Correo</th>
                  <th style={{ padding: '12px' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidosAdmin.map((ped) => (
                  <tr key={ped.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>#{ped.id}</td>
                    <td style={{ padding: '12px' }}>{ped.nombre_cliente}</td>
                    <td style={{ padding: '12px' }}>{ped.correo_cliente}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#008000' }}>${parseFloat(ped.total_pagado).toFixed(2)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => setClienteSeleccionado(ped)} style={{ backgroundColor: '#0066cc', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        👁️ Ver Datos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p style={{ color: '#666', fontStyle: 'italic' }}>Aún no hay pedidos.</p>}
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderTop: '4px solid #000', height: 'fit-content' }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>{editando ? 'Editar Mercadería' : 'Ingresar Mercadería'}</h2>
          <form onSubmit={guardarProducto} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input name="sku" placeholder="SKU" value={nuevoProducto.sku} onChange={manejarCambio} required disabled={editando} style={estiloInput} />
            <input name="nombre" placeholder="Nombre del artículo" value={nuevoProducto.nombre} onChange={manejarCambio} required style={estiloInput} />
            <select name="id_categoria" value={nuevoProducto.id_categoria} onChange={manejarCambio} required style={estiloInput}>
              {departamentos.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
            <input name="costo_interno" type="number" step="0.01" placeholder="Costo proveedor ($)" value={nuevoProducto.costo_interno} onChange={manejarCambio} required style={estiloInput} />
            <input name="precio_venta" type="number" step="0.01" placeholder="Precio al público ($)" value={nuevoProducto.precio_venta} onChange={manejarCambio} required style={estiloInput} />
            <input name="stock" type="number" placeholder="Unidades" value={nuevoProducto.stock} onChange={manejarCambio} required style={estiloInput} />
            {/* NUEVO INPUT PARA LA IMAGEN */}
            <input name="imagen_url" placeholder="URL de la imagen (Link)" value={nuevoProducto.imagen_url || ''} onChange={manejarCambio} style={estiloInput} />
            
            <textarea name="descripcion_corta" placeholder="Descripción breve" value={nuevoProducto.descripcion_corta} onChange={manejarCambio} required style={{ ...estiloInput, minHeight: '60px' }} />
            <button type="submit" style={{ padding: '15px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editando ? 'Actualizar Artículo' : 'Guardar en Base de Datos'}
            </button>
            {editando && <button type="button" onClick={() => { setEditando(false); setNuevoProducto(estadoInicial); }} style={{ padding: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>}
          </form>
        </div>
        
        <div style={{ flex: '2', minWidth: '300px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', alignContent: 'start' }}>
          {productos.map((producto) => (
            <div key={producto.sku} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderLeft: '5px solid #fcee21', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                <button onClick={() => prepararEdicion(producto)} style={{ background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}>Editar</button>
                <button onClick={() => eliminarProducto(producto.sku)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}>Borrar</button>
              </div>
              
              {/* VISTA PREVIA DE IMAGEN EN ADMIN */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                {producto.imagen_url ? (
                  <img src={producto.imagen_url} alt={producto.nombre} style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', borderRadius: '4px' }}>🛠️</div>
                )}
                <div>
                  <h3 style={{ color: '#333', fontSize: '16px', margin: '0 0 5px 0' }}>{producto.nombre}</h3>
                  <span style={{ backgroundColor: '#eee', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{producto.sku}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>${producto.precio_venta.toFixed(2)}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: producto.stock > 0 ? 'green' : 'red' }}>Stock: {producto.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;