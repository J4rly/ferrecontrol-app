import { useEffect, useState } from 'react'
import Header from './components/Header'
import SeccionInicio from './components/SeccionInicio'
import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'
import { ModalAuth, ModalFactura, ModalAdmin, ModalDetallePedido } from './components/Modales'

function App() {
  const [productos, setProductos] = useState([])
  const [vistaAdmin, setVistaAdmin] = useState(false) 
  const [carrito, setCarrito] = useState([])
  const [editando, setEditando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todas las categorías')
  const [ofertaActiva, setOfertaActiva] = useState(null)
  
  // Estados de Autenticación y Modales
  const [modalAuthAbierto, setModalAuthAbierto] = useState(false)
  const [modoRegistro, setModoRegistro] = useState(false)
  const [usuarioLogueado, setUsuarioLogueado] = useState(null)
  const [formAuth, setFormAuth] = useState({ nombre_completo: '', correo: '', contrasena: '', direccion: '', cedula: '', whatsapp: '' })

  const [modalFacturaAbierto, setModalFacturaAbierto] = useState(false)
  const [datosFactura, setDatosFactura] = useState({ direccion: '', cedula: '', whatsapp: '' })

  const [modalAdminAbierto, setModalAdminAbierto] = useState(false)
  const [claveAdmin, setClaveAdmin] = useState('')
  const PASSWORD_SECRETA = "admin123"
  
  const [pedidosAdmin, setPedidosAdmin] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)

  // ¡AQUÍ ESTÁ EL NUEVO CAMPO imagen_url AÑADIDO!
  const estadoInicial = { sku: '', nombre: '', id_categoria: 1, costo_interno: '', precio_venta: '', stock: '', descripcion_corta: '', imagen_url: '' }
  const [nuevoProducto, setNuevoProducto] = useState(estadoInicial)

  const departamentos = [
    { nombre: 'Herramientas', id: 1, icono: '🛠️', bg: '#e3f2fd' },
    { nombre: 'Construcción', id: 2, icono: '🧱', bg: '#fff3e0' },
    { nombre: 'Electricidad', id: 3, icono: '⚡', bg: '#f3e5f5' },
    { nombre: 'Gafitería', id: 4, icono: '🔧', bg: '#e8f5e9' },
    { nombre: 'Plomería', id: 5, icono: '🚰', bg: '#e0f7fa' },
    { nombre: 'Pintura', id: 6, icono: '🎨', bg: '#fce4ec' },
    { nombre: 'Carpintería', id: 7, icono: '🪚', bg: '#efebe9' },
    { nombre: 'Fluidos', id: 8, icono: '💧', bg: '#e1f5fe' },
    { nombre: 'Automotriz', id: 9, icono: '🚗', bg: '#fffde7' }
  ]

  const cargarProductos = () => {
    fetch('http://127.0.0.1:8000/productos').then(r => r.json()).then(d => { if(d.estado === "Éxito") setProductos(d.catalogo) })
  }
  const cargarPedidosAdmin = () => {
    fetch('http://127.0.0.1:8000/pedidos').then(r => r.json()).then(d => { if(d.estado === "Éxito") setPedidosAdmin(d.pedidos) })
  }

  useEffect(() => { cargarProductos() }, [])

  const manejarCambioAuth = (e) => setFormAuth({ ...formAuth, [e.target.name]: e.target.value })
  const manejarCambioFactura = (e) => setDatosFactura({ ...datosFactura, [e.target.name]: e.target.value })

  const gestionarLoginRegistro = (e) => {
    e.preventDefault()
    const url = modoRegistro ? 'http://127.0.0.1:8000/registro' : 'http://127.0.0.1:8000/login'
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formAuth) })
    .then(r => r.json()).then(datos => {
      if (datos.estado === "Éxito") {
        if (modoRegistro) { alert("¡Registro exitoso! Ahora inicia sesión."); setModoRegistro(false); } 
        else { setUsuarioLogueado(datos.usuario); setModalAuthAbierto(false); alert(`¡Bienvenido, ${datos.usuario.nombre_completo}!`); }
        setFormAuth({ nombre_completo: '', correo: '', contrasena: '', direccion: '', cedula: '', whatsapp: '' })
      } else alert(datos.detalle || "Error.")
    })
  }

  const cerrarSesion = () => { setUsuarioLogueado(null); alert("Sesión cerrada."); }

  const iniciarProcesoCompra = () => {
    if (!usuarioLogueado) { alert("Debes iniciar sesión para poder comprar."); setModalAuthAbierto(true); return; }
    if (!usuarioLogueado.direccion || !usuarioLogueado.cedula || !usuarioLogueado.whatsapp) setModalFacturaAbierto(true)
    else ejecutarCompraFinal(usuarioLogueado.direccion, usuarioLogueado.cedula, usuarioLogueado.whatsapp)
  }

  const enviarDatosFacturaExtra = (e) => {
    e.preventDefault()
    const usuarioActualizado = { ...usuarioLogueado, ...datosFactura }
    setUsuarioLogueado(usuarioActualizado)
    ejecutarCompraFinal(datosFactura.direccion, datosFactura.cedula, datosFactura.whatsapp)
  }

  const ejecutarCompraFinal = (dir, ced, wapp) => {
    const datosPedido = {
      nombre_cliente: usuarioLogueado.nombre_completo, correo_cliente: usuarioLogueado.correo, total_pagado: totalCarrito,
      cedula: ced, whatsapp: wapp, direccion: dir, carrito: carrito.map(item => ({ sku: item.sku, cantidad: item.cantidad }))
    }
    fetch('http://127.0.0.1:8000/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datosPedido) })
    .then(r => r.json()).then(datos => {
      if(datos.estado === "Éxito") {
        alert(`¡Gracias por tu compra!\nTotal Pagado: $${totalCarrito.toFixed(2)}`);
        setCarrito([]); setModalFacturaAbierto(false); cargarProductos();
      } else alert("Error al procesar el pedido.")
    })
  }

  const verificarAdmin = (e) => {
    e.preventDefault()
    if (claveAdmin === PASSWORD_SECRETA) {
      setVistaAdmin(true); setModalAdminAbierto(false); setClaveAdmin(''); cargarPedidosAdmin();
    } else { alert("Contraseña incorrecta."); setClaveAdmin(''); }
  }

  const manejarCambio = (e) => setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.name === 'id_categoria' ? parseInt(e.target.value) : e.target.value })
  
  const guardarProducto = (e) => {
    e.preventDefault()
    const p = { ...nuevoProducto, costo_interno: parseFloat(nuevoProducto.costo_interno), precio_venta: parseFloat(nuevoProducto.precio_venta), stock: parseInt(nuevoProducto.stock), id_categoria: parseInt(nuevoProducto.id_categoria) }
    const url = editando ? `http://127.0.0.1:8000/productos/${nuevoProducto.sku}` : 'http://127.0.0.1:8000/productos'
    fetch(url, { method: editando ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }).then(r => r.json()).then(d => {
      if (d.estado === "Éxito") { cargarProductos(); setNuevoProducto(estadoInicial); setEditando(false); } else alert("Error: " + d.detalle)
    })
  }

  const prepararEdicion = (producto) => { setNuevoProducto(producto); setEditando(true); }
  const eliminarProducto = (sku) => { if(window.confirm(`¿Eliminar ${sku}?`)) fetch(`http://127.0.0.1:8000/productos/${sku}`, { method: 'DELETE' }).then(() => cargarProductos()) }

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.sku === producto.sku)
    if (existe) {
      if (existe.cantidad < producto.stock) setCarrito(carrito.map(item => item.sku === producto.sku ? { ...item, cantidad: item.cantidad + 1 } : item))
      else alert("No hay más stock.")
    } else {
      if (producto.stock > 0) setCarrito([...carrito, { ...producto, cantidad: 1 }]); else alert("Agotado.")
    }
  }

  const eliminarDelCarrito = (sku) => setCarrito(carrito.filter(item => item.sku !== sku))
  const totalCarrito = carrito.reduce((t, item) => t + (item.precio_venta * item.cantidad), 0)

  // NAVEGACIÓN Y FILTROS
  const seleccionarCategoria = (nombreCategoria) => { setCategoriaActiva(nombreCategoria); setOfertaActiva(null); setBusqueda(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const seleccionarOferta = (nombreOferta) => { setOfertaActiva(nombreOferta); setCategoriaActiva('Todas las categorías'); setBusqueda(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const irAInicio = () => { setVistaAdmin(false); setCategoriaActiva('Todas las categorías'); setOfertaActiva(null); setBusqueda(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  const mostrarInicio = busqueda === '' && categoriaActiva === 'Todas las categorías' && !ofertaActiva

  let productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.sku.toLowerCase().includes(busqueda.toLowerCase())
    let coincideCategoria = categoriaActiva === 'Todas las categorías' ? true : p.id_categoria === departamentos.find(d => d.nombre === categoriaActiva)?.id
    return coincideBusqueda && coincideCategoria
  })

  if (ofertaActiva) {
    if (ofertaActiva === 'Oferta Especial') productosFiltrados = productosFiltrados.filter(p => p.stock > 20) 
    else if (ofertaActiva === 'Descuento Masivo') productosFiltrados = productosFiltrados.filter(p => p.precio_venta < 15)
    else if (ofertaActiva === 'Temporada') productosFiltrados = productosFiltrados.filter(p => p.id_categoria === 2 || p.id_categoria === 6)
    else if (ofertaActiva === 'Todas las ofertas') productosFiltrados = productosFiltrados.filter(p => p.precio_venta < 15 || p.stock > 20)
  } else if (mostrarInicio) productosFiltrados = productosFiltrados.filter(p => (p.ventas || 0) >= 20)

  productosFiltrados = productosFiltrados.sort((a, b) => (b.ventas || 0) - (a.ventas || 0))

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* --- MODALES EXTRÍDOS --- */}
      <ModalAuth modalAuthAbierto={modalAuthAbierto} setModalAuthAbierto={setModalAuthAbierto} modoRegistro={modoRegistro} setModoRegistro={setModoRegistro} formAuth={formAuth} manejarCambioAuth={manejarCambioAuth} gestionarLoginRegistro={gestionarLoginRegistro} />
      <ModalFactura modalFacturaAbierto={modalFacturaAbierto} setModalFacturaAbierto={setModalFacturaAbierto} datosFactura={datosFactura} manejarCambioFactura={manejarCambioFactura} enviarDatosFacturaExtra={enviarDatosFacturaExtra} />
      <ModalAdmin modalAdminAbierto={modalAdminAbierto} setModalAdminAbierto={setModalAdminAbierto} claveAdmin={claveAdmin} setClaveAdmin={setClaveAdmin} verificarAdmin={verificarAdmin} />
      <ModalDetallePedido clienteSeleccionado={clienteSeleccionado} setClienteSeleccionado={setClienteSeleccionado} />

      {/* --- RENDERIZADO PRINCIPAL --- */}
      {vistaAdmin ? (
        <AdminPanel irAInicio={irAInicio} pedidosAdmin={pedidosAdmin} setClienteSeleccionado={setClienteSeleccionado} editando={editando} setEditando={setEditando} nuevoProducto={nuevoProducto} estadoInicial={estadoInicial} setNuevoProducto={setNuevoProducto} manejarCambio={manejarCambio} guardarProducto={guardarProducto} productos={productos} prepararEdicion={prepararEdicion} eliminarProducto={eliminarProducto} departamentos={departamentos} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <Header irAInicio={irAInicio} busqueda={busqueda} setBusqueda={setBusqueda} setCategoriaActiva={setCategoriaActiva} setOfertaActiva={setOfertaActiva} usuarioLogueado={usuarioLogueado} cerrarSesion={cerrarSesion} setModalAuthAbierto={setModalAuthAbierto} setModalAdminAbierto={setModalAdminAbierto} carrito={carrito} seleccionarCategoria={seleccionarCategoria} seleccionarOferta={seleccionarOferta} departamentos={departamentos} />

          {mostrarInicio && <SeccionInicio departamentos={departamentos} seleccionarCategoria={seleccionarCategoria} seleccionarOferta={seleccionarOferta} />}

          <div style={{ padding: '30px 5%', flex: 1 }}>
            
            {!mostrarInicio && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Inicio &gt; {busqueda ? `Resultados para: '${busqueda}'` : (ofertaActiva ? `Ofertas > ${ofertaActiva}` : `Departamento: ${categoriaActiva}`)}</div>
                <h2 style={{ fontSize: '38px', color: '#333', fontWeight: 'bold', margin: '0 0 30px 0' }}>{busqueda ? `Resultados para: '${busqueda.toUpperCase()}'` : (ofertaActiva ? `Promociones: ${ofertaActiva}` : categoriaActiva)}</h2>
              </div>
            )}

            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
              
              {/* FILTROS LATERALES */}
              {!mostrarInicio && (
                <div style={{ width: '220px', flexShrink: '0' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', margin: '0 0 5px 0', color: '#000' }}><span style={{fontSize: '24px'}}>⧼</span> Filtros</h3>
                  <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '20px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', color: '#333' }}>Categoría <span>⌄</span></div>
                    <div style={{ color: '#555', fontSize: '14px', lineHeight: '2.5' }}>
                      <div style={{cursor: 'pointer'}} onClick={() => seleccionarCategoria('Herramientas')}>Herramientas</div>
                      <div style={{cursor: 'pointer'}} onClick={() => seleccionarCategoria('Construcción')}>Construcción</div>
                    </div>
                  </div>
                </div>
              )}

              {/* GRILLA DE PRODUCTOS */}
              <div style={{ flex: '3' }}>
                {!mostrarInicio ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', color: '#555', alignItems: 'center' }}>
                    <span><strong>{productosFiltrados.length}</strong> Productos encontrados</span>
                  </div>
                ) : (
                  <h2 style={{ borderBottom: '3px solid #fcee21', paddingBottom: '10px', display: 'inline-block', marginBottom: '30px', color: '#000' }}>Productos más vendidos</h2>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((producto) => (
                      <div key={producto.sku} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1px solid #eaeaea' }}>
                        
                        {/* ¡AQUÍ SE MUESTRA LA IMAGEN REAL SI EXISTE! */}
                        {producto.imagen_url ? (
                          <div style={{ height: '180px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '4px' }}>
                            <img src={producto.imagen_url} alt={producto.nombre} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <div style={{ height: '180px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px' }}>🛠️</div>
                        )}

                        <h3 style={{ color: '#333', fontSize: '15px', margin: '0 0 10px 0', height: '40px', overflow: 'hidden', fontWeight: 'bold' }}>{producto.nombre}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '15px' }}>
                          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>${producto.precio_venta.toFixed(2)}</span>
                        </div>
                        <button onClick={() => agregarAlCarrito(producto)} disabled={producto.stock === 0} style={{ width: '100%', padding: '12px', backgroundColor: producto.stock > 0 ? '#fcee21' : '#e0e0e0', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: producto.stock > 0 ? 'pointer' : 'not-allowed' }}>
                          {producto.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
                        </button>
                      </div>
                    ))
                  ) : <p style={{ gridColumn: '1 / -1', color: '#666', fontSize: '18px' }}>No se encontraron artículos.</p>}
                </div>
              </div>

              {/* CARRITO FLOTANTE */}
              {carrito.length > 0 && (
                <div style={{ flex: '1', minWidth: '280px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'sticky', top: '180px', border: '2px solid #000' }}>
                  <h3 style={{ marginTop: 0, borderBottom: '2px solid #fcee21', paddingBottom: '10px', color: '#000' }}>Resumen de compra</h3>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                    {carrito.map((item) => (
                      <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <div style={{ flex: 1, paddingRight: '10px' }}>
                          <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>{item.nombre}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Cant: {item.cantidad}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>${(item.cantidad * item.precio_venta).toFixed(2)}</span>
                          <button onClick={() => eliminarDelCarrito(item.sku)} style={{ background: 'none', color: '#cc0000', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✖</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '2px solid #000', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                    <span>Total:</span><span style={{ color: '#000' }}>${totalCarrito.toFixed(2)}</span>
                  </div>
                  <button onClick={iniciarProcesoCompra} style={{ width: '100%', padding: '15px', backgroundColor: '#fcee21', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Finalizar Compra</button>
                </div>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: '#111', color: '#fff', padding: '25px 5%', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', borderTop: '3px solid #fcee21' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '32px' }}>🚚</span><div><h4 style={{ margin: 0, color: '#fcee21', fontSize: '16px' }}>Envío rápido</h4><p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>Entregas en 24h a todo Guayaquil</p></div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '32px' }}>🔒</span><div><h4 style={{ margin: 0, color: '#fcee21', fontSize: '16px' }}>Compra segura</h4><p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>Pagos 100% protegidos y cifrados</p></div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '32px' }}>🔄</span><div><h4 style={{ margin: 0, color: '#fcee21', fontSize: '16px' }}>Devoluciones fáciles</h4><p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>30 días para cambios sin costo</p></div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '32px' }}>📞</span><div><h4 style={{ margin: 0, color: '#fcee21', fontSize: '16px' }}>Atención 24/7</h4><p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>Soporte por chat, teléfono y correo</p></div></div>
          </div>

          <Footer irAInicio={irAInicio} seleccionarCategoria={seleccionarCategoria} setModalAdminAbierto={setModalAdminAbierto} />

        </div>
      )}
    </div>
  )
}

export default App