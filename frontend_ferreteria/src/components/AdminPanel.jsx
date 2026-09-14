import React, { useState } from 'react';

function AdminPanel({
  irAInicio, pedidosAdmin, setClienteSeleccionado, editando, setEditando, nuevoProducto,
  estadoInicial, setNuevoProducto, manejarCambio, guardarProducto, productos,
  prepararEdicion, eliminarProducto, departamentos
}) {
  const estiloInput = { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' };

  const [categoriaExpandida, setCategoriaExpandida] = useState(null);
  const [busquedaAdmin, setBusquedaAdmin] = useState('');
  
  const [modalPedidosAbierto, setModalPedidosAbierto] = useState(false);
  const [busquedaPedidos, setBusquedaPedidos] = useState('');

  const toggleCategoria = (id) => {
    setCategoriaExpandida(categoriaExpandida === id ? null : id);
  };

  const subirExcel = async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append("file", archivo);

    try {
        const respuesta = await fetch("http://localhost:8000/productos/cargar-excel", {
            method: "POST",
            body: formData,
        });
        const datos = await respuesta.json();
        
        if (datos.estado === "Éxito") {
            alert("¡Genial! " + datos.mensaje);
            window.location.reload(); 
        } else {
            alert("Error al cargar Excel: " + datos.detalle);
        }
    } catch (error) {
        console.error("Error en la conexión:", error);
        alert("Error de conexión con el servidor de Python.");
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busquedaAdmin.toLowerCase()) || 
    p.sku.toLowerCase().includes(busquedaAdmin.toLowerCase())
  );

  const pedidosFiltrados = pedidosAdmin.filter(ped => {
    const termino = busquedaPedidos.toLowerCase();
    const idStr = ped.id ? ped.id.toString() : '';
    const fechaStr = ped.fecha_pedido ? ped.fecha_pedido.toString() : '';
    const metodoStr = ped.metodo_pago ? ped.metodo_pago.toLowerCase() : '';
    
    return (
      (ped.nombre_cliente && ped.nombre_cliente.toLowerCase().includes(termino)) ||
      (ped.correo_cliente && ped.correo_cliente.toLowerCase().includes(termino)) ||
      idStr.includes(termino) ||
      fechaStr.includes(termino) ||
      metodoStr.includes(termino)
    );
  });

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', flex: 1, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button onClick={irAInicio} style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Volver a la Tienda
        </button>
      </div>
      
      <header style={{ backgroundColor: '#fcee21', padding: '25px', borderRadius: '8px', borderBottom: '5px solid #000', marginBottom: '25px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <img src="/logo.jpeg" alt="Logo Ferretería L E" onClick={irAInicio} style={{ width: '100%', maxWidth: '750px', maxHeight: '180px', objectFit: 'contain', cursor: 'pointer' }} />
        <h1 style={{ color: '#000', margin: 0, fontSize: '32px', fontWeight: 'bold' }}>Panel de Administración</h1>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <button 
          onClick={() => setModalPedidosAbierto(true)} 
          style={{ padding: '15px 30px', backgroundColor: '#111', color: '#fcee21', border: '2px solid #fcee21', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        >
          📦 Ver Historial de Pedidos ({pedidosAdmin.length})
        </button>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* --- COLUMNA IZQUIERDA: FORMULARIOS --- */}
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '2px dashed #000', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#333', fontSize: '18px', marginBottom: '5px' }}>📁 Carga Masiva (Excel)</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Sube tu archivo .xlsx para agregar o actualizar inventario.</p>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={subirExcel} 
              style={{ width: '100%', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderTop: '4px solid #000', height: 'fit-content' }}>
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
              <input name="imagen_url" placeholder="URL de la imagen (Link)" value={nuevoProducto.imagen_url || ''} onChange={manejarCambio} style={estiloInput} />
              
              <select name="oferta_tipo" value={nuevoProducto.oferta_tipo || ''} onChange={manejarCambio} style={estiloInput}>
                <option value="">Ninguna Oferta (Normal)</option>
                <option value="Oferta Especial">⭐ Oferta Especial (Banner Amarillo)</option>
                <option value="Descuento Masivo">🔥 Descuento Masivo (Banner Negro)</option>
                <option value="Temporada">🌞 Temporada (Banner Gris)</option>
              </select>
              
              <textarea name="descripcion_corta" placeholder="Descripción breve" value={nuevoProducto.descripcion_corta} onChange={manejarCambio} required style={{ ...estiloInput, minHeight: '60px' }} />
              <button type="submit" style={{ padding: '15px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {editando ? 'Actualizar Artículo' : 'Guardar en Base de Datos'}
              </button>
              {editando && <button type="button" onClick={() => { setEditando(false); setNuevoProducto(estadoInicial); }} style={{ padding: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>}
            </form>
          </div>
        </div>
        
        {/* --- COLUMNA DERECHA: INVENTARIO ACORDEÓN --- */}
        <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por SKU o Nombre para editar..." 
              value={busquedaAdmin}
              onChange={(e) => { setBusquedaAdmin(e.target.value); setCategoriaExpandida(null); }}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px' }}
            />
          </div>

          {departamentos.map((dep) => {
            const prodDeCategoria = productosFiltrados.filter(p => p.id_categoria === dep.id);
            if (prodDeCategoria.length === 0 && busquedaAdmin === '') return null;
            if (prodDeCategoria.length === 0 && busquedaAdmin !== '') return null;
            const estaExpandido = (categoriaExpandida === dep.id) || (busquedaAdmin !== '');

            return (
              <div key={dep.id} style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #eaeaea' }}>
                <div 
                  onClick={() => toggleCategoria(dep.id)} 
                  style={{ backgroundColor: '#111', color: '#fff', padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.3s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{dep.icono}</span>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{dep.nombre}</h3>
                    <span style={{ backgroundColor: '#fcee21', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginLeft: '10px' }}>
                      {prodDeCategoria.length}
                    </span>
                  </div>
                  <span style={{ fontSize: '18px', color: '#fcee21', transform: estaExpandido ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    ▼
                  </span>
                </div>

                {estaExpandido && (
                  <div style={{ padding: '20px', backgroundColor: '#fafafa', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px', borderTop: '3px solid #fcee21' }}>
                    {prodDeCategoria.map((producto) => (
                      <div key={producto.sku} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                          <button onClick={() => { prepararEdicion(producto); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{ background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}>Editar</button>
                          <button onClick={() => eliminarProducto(producto.sku)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}>Borrar</button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', alignItems: 'center' }}>
                          {producto.imagen_url ? (
                            <img src={producto.imagen_url} alt={producto.nombre} style={{ width: '45px', height: '45px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px' }} />
                          ) : (
                            <div style={{ width: '45px', height: '45px', backgroundColor: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', borderRadius: '4px' }}>🛠️</div>
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <h4 style={{ color: '#333', fontSize: '13px', margin: '0 0 4px 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={producto.nombre}>{producto.nombre}</h4>
                            <span style={{ backgroundColor: '#eee', padding: '2px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginRight: '5px' }}>{producto.sku}</span>
                            {producto.oferta_tipo && (
                              <span style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '2px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Oferta</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000' }}>${parseFloat(producto.precio_venta).toFixed(2)}</span>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: producto.stock > 0 ? 'green' : 'red' }}>Stock: {producto.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- VENTANA EMERGENTE (MODAL) DEL HISTORIAL DE PEDIDOS --- */}
      {modalPedidosAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '950px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            
            <button 
              onClick={() => { setModalPedidosAbierto(false); setBusquedaPedidos(''); }} 
              style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
            >
              ✖
            </button>
            
            <h2 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📦 Historial de Pedidos Registrados
            </h2>

            {/* BARRA DE BÚSQUEDA DE PEDIDOS */}
            <div style={{ backgroundColor: '#f9f9f9', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '18px' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por nombre, correo, ID, fecha o método de pago..." 
                value={busquedaPedidos}
                onChange={(e) => setBusquedaPedidos(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '15px' }}
              />
            </div>
            
            {/* CONTENEDOR DE LA TABLA (CON SCROLL INTERNO) */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {pedidosFiltrados.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#000', color: '#fcee21' }}>
                      <th style={{ padding: '12px', position: 'sticky', top: 0, backgroundColor: '#000' }}>ID</th>
                      <th style={{ padding: '12px', position: 'sticky', top: 0, backgroundColor: '#000' }}>Cliente</th>
                      <th style={{ padding: '12px', position: 'sticky', top: 0, backgroundColor: '#000' }}>Correo</th>
                      <th style={{ padding: '12px', position: 'sticky', top: 0, backgroundColor: '#000' }}>Pago</th>
                      {pedidosFiltrados[0].fecha_pedido && <th style={{ padding: '12px', position: 'sticky', top: 0, backgroundColor: '#000' }}>Fecha</th>}
                      <th style={{ padding: '12px', position: 'sticky', top: 0, backgroundColor: '#000' }}>Total</th>
                      <th style={{ padding: '12px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: '#000' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFiltrados.map((ped) => (
                      <tr key={ped.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>#{ped.id}</td>
                        <td style={{ padding: '12px' }}>{ped.nombre_cliente}</td>
                        <td style={{ padding: '12px' }}>{ped.correo_cliente}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ backgroundColor: ped.metodo_pago === 'Transferencia' ? '#e1f5fe' : '#e8f5e9', color: ped.metodo_pago === 'Transferencia' ? '#0288d1' : '#2e7d32', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                            {ped.metodo_pago || 'Efectivo'}
                          </span>
                        </td>
                        {ped.fecha_pedido && (
                          <td style={{ padding: '12px' }}>
                            {new Date(ped.fecha_pedido).toLocaleDateString()}
                          </td>
                        )}
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#008000' }}>${parseFloat(ped.total_pagado).toFixed(2)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button 
                            onClick={() => { 
                              setClienteSeleccionado(ped); 
                              // NOTA: EL HISTORIAL DE PEDIDOS YA NO SE CIERRA AL HACER CLIC EN VER DATOS
                            }} 
                            style={{ backgroundColor: '#0066cc', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                          >
                            👁️ Ver Datos
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                  {busquedaPedidos ? 'No se encontraron pedidos con esa búsqueda.' : 'Aún no hay pedidos registrados.'}
                </p>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminPanel;