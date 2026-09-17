import { useEffect, useState } from 'react'
import Header from './components/Header'
import SeccionInicio from './components/SeccionInicio'
import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'
import { ModalAuth, ModalFactura, ModalMetodoPago, ModalDatosBanco, ModalRecibo, ModalAdmin, ModalDetallePedido, ModalMiCuenta, ModalMisCompras } from './components/Modales'

function App() {
  const [productos, setProductos] = useState([])
  
  // 1. CARGAMOS LA VISTA ADMIN DESDE LA MEMORIA DEL NAVEGADOR
  const [vistaAdmin, setVistaAdmin] = useState(() => {
    return localStorage.getItem('esAdminFerreteria') === 'true';
  }) 

  // 2. CARGAMOS EL CARRITO DESDE LA MEMORIA DEL NAVEGADOR
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem('carritoFerreteria');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  })

  // 3. CARGAMOS LA SESIÓN DEL CLIENTE DESDE LA MEMORIA
  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    const usuarioGuardado = localStorage.getItem('usuarioFerreteria');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  })

  const [editando, setEditando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todas las categorías')
  const [ofertaActiva, setOfertaActiva] = useState(null)
  const [viendoFavoritos, setViendoFavoritos] = useState(false)
  
  const [modalAuthAbierto, setModalAuthAbierto] = useState(false)
  const [modoRegistro, setModoRegistro] = useState(false)
  const [formAuth, setFormAuth] = useState({ nombre_completo: '', correo: '', contrasena: '', direccion: '', cedula: '', whatsapp: '' })

  const [modalFacturaAbierto, setModalFacturaAbierto] = useState(false)
  const [datosFactura, setDatosFactura] = useState({ direccion: '', cedula: '', whatsapp: '' })

  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
  const [modalBancoAbierto, setModalBancoAbierto] = useState(false)
  const [modalReciboAbierto, setModalReciboAbierto] = useState(false)
  const [datosRecibo, setDatosRecibo] = useState(null)

  const [modalAdminAbierto, setModalAdminAbierto] = useState(false)
  const [modalCuentaAbierto, setModalCuentaAbierto] = useState(false)
  const [modalComprasAbierto, setModalComprasAbierto] = useState(false)
  const [claveAdmin, setClaveAdmin] = useState('')
  const PASSWORD_SECRETA = "admin123"
  
  const [pedidosAdmin, setPedidosAdmin] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)

  const estadoInicial = { sku: '', nombre: '', id_categoria: 1, costo_interno: '', precio_venta: '', stock: '', descripcion_corta: '', imagen_url: '', oferta_tipo: '' }
  const [nuevoProducto, setNuevoProducto] = useState(estadoInicial)

  const [modalCarritoAbierto, setModalCarritoAbierto] = useState(false)
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '' })

  const departamentos = [
    { nombre: 'Herramientas', id: 1, icono: '🛠️', bg: '#e3f2fd' },
    { nombre: 'Construcción', id: 2, icono: '🧱', bg: '#fff3e0' },
    { nombre: 'Electricidad', id: 3, icono: '⚡', bg: '#f3e5f5' },
    { nombre: 'Gafitería', id: 4, icono: '🔧', bg: '#e8f5e9' },
    { nombre: 'Plomería', id: 5, icono: '🚰', bg: '#e0f7fa' },
    { nombre: 'Pintura', id: 6, icono: '🎨', bg: '#fce4ec' },
    { nombre: 'Carpintería', id: 7, icono: '🪚', bg: '#efebe9' },
    { nombre: 'Fluidos', id: 8, icono: '💧', bg: '#e1f5fe' },
    { nombre: 'Automotriz', id: 9, icono: '🚗', bg: '#fffde7' },
    { nombre: 'Insumos Químicos', id: 10, icono: '🧪', bg: '#f0f4c3' },
    { nombre: 'Cocina', id: 11, icono: '🍳', bg: '#ffe0b2' },
    { nombre: 'Jardín', id: 12, icono: '🌿', bg: '#dcedc8' }
  ]

  const cargarProductos = () => {
    fetch('http://127.0.0.1:8000/productos').then(r => r.json()).then(d => { if(d.estado === "Éxito") setProductos(d.catalogo) })
  }
  const cargarPedidosAdmin = () => {
    fetch('http://127.0.0.1:8000/pedidos').then(r => r.json()).then(d => { if(d.estado === "Éxito") setPedidosAdmin(d.pedidos) })
  }

  // EFECTO: GUARDA EL CARRITO AUTOMÁTICAMENTE CADA VEZ QUE CAMBIA
  useEffect(() => {
    localStorage.setItem('carritoFerreteria', JSON.stringify(carrito));
  }, [carrito]);

  // EFECTO: Actualiza el catálogo automáticamente cada 15 segundos en segundo plano
  useEffect(() => {
    const intervalo = setInterval(() => {
      cargarProductos();
    }, 15000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => { 
    cargarProductos();
    
    // Si la memoria dice que somos admin, cargamos los pedidos al iniciar
    if (localStorage.getItem('esAdminFerreteria') === 'true') {
      cargarPedidosAdmin();
      window.history.replaceState({ tipo: 'admin' }, '', '');
    } else {
      window.history.replaceState({ tipo: 'inicio' }, '', '');
    }

    const manejarHistorial = (evento) => {
      const estado = evento.state;
      if (estado) {
        if (estado.tipo === 'categoria') {
          setCategoriaActiva(estado.nombre); setOfertaActiva(null); setBusqueda(''); setViendoFavoritos(false); setVistaAdmin(false);
        } else if (estado.tipo === 'oferta') {
          setOfertaActiva(estado.nombre); setCategoriaActiva('Todas las categorías'); setBusqueda(''); setViendoFavoritos(false); setVistaAdmin(false);
        } else if (estado.tipo === 'favoritos') {
          setViendoFavoritos(true); setOfertaActiva(null); setCategoriaActiva('Todas las categorías'); setBusqueda(''); setVistaAdmin(false);
        } else if (estado.tipo === 'admin') {
          setVistaAdmin(true);
        } else {
          setVistaAdmin(false); setViendoFavoritos(false); setCategoriaActiva('Todas las categorías'); setOfertaActiva(null); setBusqueda('');
        }
      } else {
        setVistaAdmin(false); setViendoFavoritos(false); setCategoriaActiva('Todas las categorías'); setOfertaActiva(null); setBusqueda('');
      }
    };

    window.addEventListener('popstate', manejarHistorial);
    return () => window.removeEventListener('popstate', manejarHistorial);
  }, [])

  const manejarCambioAuth = (e) => setFormAuth({ ...formAuth, [e.target.name]: e.target.value })
  const manejarCambioFactura = (e) => setDatosFactura({ ...datosFactura, [e.target.name]: e.target.value })

  const gestionarLoginRegistro = (e) => {
    e.preventDefault()
    
    // Acceso para administrador
    if (!modoRegistro && formAuth.correo === "admin@ferreteria.com" && formAuth.contrasena === "admin123") {
      setModalAuthAbierto(false);
      setVistaAdmin(true);
      localStorage.setItem('esAdminFerreteria', 'true'); // GUARDAR EN MEMORIA
      setFormAuth({ nombre_completo: '', correo: '', contrasena: '', direccion: '', cedula: '', whatsapp: '' });
      cargarPedidosAdmin();
      window.history.pushState({ tipo: 'admin' }, '', '');
      alert("¡Bienvenido al Panel de Administración!");
      return;
    }

    const url = modoRegistro ? 'http://127.0.0.1:8000/registro' : 'http://127.0.0.1:8000/login'
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formAuth) })
    .then(r => r.json()).then(datos => {
      if (datos.estado === "Éxito") {
        if (modoRegistro) { alert("¡Registro exitoso! Ahora inicia sesión."); setModoRegistro(false); } 
        else { 
          setUsuarioLogueado(datos.usuario); 
          localStorage.setItem('usuarioFerreteria', JSON.stringify(datos.usuario)); // GUARDAR EN MEMORIA
          setModalAuthAbierto(false); 
          alert(`¡Bienvenido, ${datos.usuario.nombre_completo}!`); 
        }
        setFormAuth({ nombre_completo: '', correo: '', contrasena: '', direccion: '', cedula: '', whatsapp: '' })
      } else alert(datos.detalle || "Error.")
    })
  }

  const cerrarSesion = () => { 
    setUsuarioLogueado(null); 
    setVistaAdmin(false);
    localStorage.removeItem('usuarioFerreteria'); // BORRAR DE MEMORIA
    localStorage.removeItem('esAdminFerreteria'); // BORRAR DE MEMORIA
    window.history.pushState({ tipo: 'inicio' }, '', '');
    alert("Sesión cerrada."); 
  }

  const iniciarProcesoCompra = () => {
    if (!usuarioLogueado) { alert("Debes iniciar sesión para poder comprar."); setModalAuthAbierto(true); return; }
    if (!usuarioLogueado.direccion || !usuarioLogueado.cedula || !usuarioLogueado.whatsapp) {
      setModalFacturaAbierto(true);
    } else {
      setModalPagoAbierto(true); 
    }
  }

  const enviarDatosFacturaExtra = (e) => {
    e.preventDefault()
    const usuarioActualizado = { ...usuarioLogueado, ...datosFactura }
    setUsuarioLogueado(usuarioActualizado)
    localStorage.setItem('usuarioFerreteria', JSON.stringify(usuarioActualizado)); // GUARDAR ACTUALIZACIÓN
    setModalFacturaAbierto(false);
    setModalPagoAbierto(true); 
  }

  const seleccionarMetodoPago = (metodo) => {
    setModalPagoAbierto(false);
    if (metodo === 'Transferencia') {
      setModalBancoAbierto(true);
    } else {
      ejecutarCompraFinal('Efectivo contra entrega', null);
    }
  }

  const confirmarTransferencia = (archivoObj) => {
    setModalBancoAbierto(false);
    ejecutarCompraFinal('Transferencia Bancaria', archivoObj);
  }

  const ejecutarCompraFinal = (metodoPagoNombre, archivoVoucherObj = null) => {
    const dir = usuarioLogueado.direccion;
    const ced = usuarioLogueado.cedula;
    const wapp = usuarioLogueado.whatsapp;

    const formData = new FormData();
    formData.append("nombre_cliente", usuarioLogueado.nombre_completo);
    formData.append("correo_cliente", usuarioLogueado.correo);
    formData.append("total_pagado", totalCarrito);
    formData.append("cedula", ced);
    formData.append("whatsapp", wapp);
    formData.append("direccion", dir);
    formData.append("metodo_pago", metodoPagoNombre);
    
    // CORREGIDO: Se envía correctamente el sku y la cantidad del carrito
    formData.append("carrito", JSON.stringify(carrito.map(item => ({ sku: item.sku, nombre: item.nombre, precio_venta: item.precio_venta, cantidad: item.cantidad }))));
    
    if (archivoVoucherObj) {
      formData.append("voucher_file", archivoVoucherObj);
    }

    fetch('http://127.0.0.1:8000/pedidos', { 
      method: 'POST', 
      body: formData 
    })
    .then(r => r.json()).then(datos => {
      if(datos.estado === "Éxito") {
        setDatosRecibo({
          nombre_cliente: usuarioLogueado.nombre_completo,
          cedula: ced,
          whatsapp: wapp,
          direccion: dir,
          metodo_pago: metodoPagoNombre,
          voucher: archivoVoucherObj ? archivoVoucherObj.name : "",
          total_pagado: totalCarrito,
          carrito: [...carrito]
        });
        setCarrito([]); // Se vacía el carrito
        cargarProductos(); // RECARGA AUTOMÁTICA DEL STOCK EN TIEMPO REAL
        setModalReciboAbierto(true); 
      } else alert("Error al procesar el pedido: " + (datos.detalle || ""));
    })
  }

  const verificarAdmin = (e) => {
    e.preventDefault()
    if (claveAdmin === PASSWORD_SECRETA) {
      setVistaAdmin(true); 
      localStorage.setItem('esAdminFerreteria', 'true'); // GUARDAR EN MEMORIA
      setModalAdminAbierto(false); 
      setClaveAdmin(''); 
      cargarPedidosAdmin();
      window.history.pushState({ tipo: 'admin' }, '', '');
    } else { alert("Contraseña incorrecta."); setClaveAdmin(''); }
  }

  const irAInicio = () => { 
    setVistaAdmin(false); 
    localStorage.removeItem('esAdminFerreteria'); // Si va a inicio, sale de admin
    setCategoriaActiva('Todas las categorías'); 
    setOfertaActiva(null); 
    setViendoFavoritos(false); 
    setBusqueda(''); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    window.history.pushState({ tipo: 'inicio' }, '', '');
  }

  const seleccionarCategoria = (nombreCategoria) => { 
    setCategoriaActiva(nombreCategoria); setOfertaActiva(null); setViendoFavoritos(false); setBusqueda(''); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    window.history.pushState({ tipo: 'categoria', nombre: nombreCategoria }, '', '');
  }

  const seleccionarOferta = (nombreOferta) => { 
    setOfertaActiva(nombreOferta); setCategoriaActiva('Todas las categorías'); setViendoFavoritos(false); setBusqueda(''); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    window.history.pushState({ tipo: 'oferta', nombre: nombreOferta }, '', '');
  }

  const seleccionarFavoritos = () => {
    setViendoFavoritos(true); setOfertaActiva(null); setCategoriaActiva('Todas las categorías'); setBusqueda('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ tipo: 'favoritos' }, '', '');
  }

  const darLike = (sku) => {
    if (!usuarioLogueado) {
      alert("Debes iniciar sesión para dar Me Gusta a los productos.");
      setModalAuthAbierto(true);
      return;
    }

    setProductos(prevProductos => 
      prevProductos.map(p => {
        if (p.sku === sku) {
          const nuevoLikes = (p.likes || 0) + 1;
          return { ...p, likes: nuevoLikes };
        }
        return p;
      })
    );

    fetch(`http://127.0.0.1:8000/productos/${sku}/like`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuarioLogueado.id })
    })
    .then(r => r.json())
    .then(d => {
      if (d.estado === "Éxito") {
        setProductos(prevProductos => 
          prevProductos.map(p => p.sku === sku ? { ...p, likes: d.likes } : p)
        );
      } else {
        alert(d.detalle || "Error al procesar el voto.");
        cargarProductos();
      }
    });
  }

  const manejarCambio = (e) => setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.name === 'id_categoria' ? parseInt(e.target.value) : e.target.value })
  
  // FUNCIÓN GUARDAR PRODUCTO OPTIMIZADA (SOPORTA COMAS Y PUNTOS DECIMALES)
  const guardarProducto = (e) => {
    e.preventDefault()
    
    const costoStr = String(nuevoProducto.costo_interno || "0").replace(',', '.');
    const precioStr = String(nuevoProducto.precio_venta || "0").replace(',', '.');
    
    const costo = parseFloat(costoStr);
    const precio = parseFloat(precioStr);
    const stockVal = parseInt(nuevoProducto.stock);

    if (isNaN(precio) || isNaN(stockVal)) {
      alert("⚠️ Por favor ingresa un Precio de Venta y un Stock válidos.");
      return;
    }

    const p = { 
      ...nuevoProducto, 
      costo_interno: isNaN(costo) ? 0 : costo, 
      precio_venta: precio, 
      stock: stockVal, 
      id_categoria: parseInt(nuevoProducto.id_categoria),
      oferta_tipo: nuevoProducto.oferta_tipo || "" 
    }

    const url = editando ? `http://127.0.0.1:8000/productos/${nuevoProducto.sku}` : 'http://127.0.0.1:8000/productos'
    
    fetch(url, { 
      method: editando ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(p) 
    })
    .then(r => r.json())
    .then(d => {
      if (d.estado === "Éxito") { 
        alert(editando ? "✅ ¡Producto actualizado con éxito!" : "✅ ¡Producto creado con éxito!");
        cargarProductos(); 
        setNuevoProducto(estadoInicial); 
        setEditando(false); 
      } else {
        alert("❌ Error del servidor: " + (d.detalle || d.mensaje || JSON.stringify(d)));
      }
    })
    .catch(err => {
      console.error("Error de red:", err);
      alert("❌ No se pudo conectar con el servidor backend.");
    });
  }

  const prepararEdicion = (producto) => { setNuevoProducto(producto); setEditando(true); }
  const eliminarProducto = (sku) => { if(window.confirm(`¿Eliminar ${sku}?`)) fetch(`http://127.0.0.1:8000/productos/${sku}`, { method: 'DELETE' }).then(() => cargarProductos()) }

  const mostrarNotificacion = (mensaje) => {
    setNotificacion({ visible: true, mensaje });
    setTimeout(() => { setNotificacion({ visible: false, mensaje: '' }); }, 3000); 
  }

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.sku === producto.sku)
    if (existe) {
      if (existe.cantidad < producto.stock) {
        setCarrito(carrito.map(item => item.sku === producto.sku ? { ...item, cantidad: item.cantidad + 1 } : item))
        mostrarNotificacion(`✅ +1 ${producto.nombre} añadido al carrito`);
      }
      else alert("No hay más stock disponible de este producto.")
    } else {
      if (producto.stock > 0) {
        setCarrito([...carrito, { ...producto, cantidad: 1 }]);
        mostrarNotificacion(`✅ ${producto.nombre} añadido al carrito`);
      }
      else alert("Este producto está agotado.")
    }
  }

  const restarDelCarrito = (sku) => {
    const existe = carrito.find(item => item.sku === sku);
    if (existe.cantidad > 1) {
      setCarrito(carrito.map(item => item.sku === sku ? { ...item, cantidad: item.cantidad - 1 } : item));
    } else {
      eliminarDelCarrito(sku);
    }
  }

  const eliminarDelCarrito = (sku) => setCarrito(carrito.filter(item => item.sku !== sku))
  const totalCarrito = carrito.reduce((t, item) => t + (item.precio_venta * item.cantidad), 0)

  const mostrarInicio = busqueda === '' && categoriaActiva === 'Todas las categorías' && !ofertaActiva && !viendoFavoritos

  let productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.sku.toLowerCase().includes(busqueda.toLowerCase())
    let coincideCategoria = categoriaActiva === 'Todas las categorías' ? true : p.id_categoria === departamentos.find(d => d.nombre === categoriaActiva)?.id
    return coincideBusqueda && coincideCategoria
  })

  if (viendoFavoritos) {
    productosFiltrados = productos.filter(p => (p.likes || 0) >= 20).sort((a, b) => b.likes - a.likes);
  } else if (ofertaActiva) {
    if (ofertaActiva === 'Todas las ofertas') {
      productosFiltrados = productosFiltrados.filter(p => p.oferta_tipo && p.oferta_tipo !== '');
    } else {
      productosFiltrados = productosFiltrados.filter(p => p.oferta_tipo === ofertaActiva);
    }
  } else if (mostrarInicio) {
    productosFiltrados = productosFiltrados.filter(p => (p.ventas || 0) >= 20)
  }

  if (!viendoFavoritos) {
    productosFiltrados = productosFiltrados.sort((a, b) => (b.ventas || 0) - (a.ventas || 0))
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {notificacion.visible && (
        <div style={{ 
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', 
          backgroundColor: '#4CAF50', color: 'white', padding: '15px 25px', 
          borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', 
          zIndex: 9999, fontWeight: 'bold', fontSize: '15px'
        }}>
          {notificacion.mensaje}
        </div>
      )}

      <div style={{
        position: 'fixed', top: 0, right: modalCarritoAbierto ? '0' : '-100%', 
        width: '100%', maxWidth: '400px', height: '100vh', backgroundColor: '#fff', 
        boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', transition: 'right 0.3s ease-in-out', 
        zIndex: 2000, display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', backgroundColor: '#fcee21', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>🛒 Mi Carrito</h2>
          <button onClick={() => setModalCarritoAbierto(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold', color: '#000' }}>✖</button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {carrito.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
              <span style={{ fontSize: '50px' }}>🛒</span>
              <p>Tu carrito está vacío.</p>
              <button onClick={() => setModalCarritoAbierto(false)} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Seguir Comprando</button>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ flex: 1, paddingRight: '15px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{item.nombre}</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#000', fontWeight: 'bold' }}>${(item.precio_venta * item.cantidad).toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '2px solid #ccc', borderRadius: '4px', padding: '2px 8px' }}>
                  <button onClick={() => restarDelCarrito(item.sku)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>-</button>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                  <button onClick={() => agregarAlCarrito(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>+</button>
                </div>
                <button onClick={() => eliminarDelCarrito(item.sku)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#ccc', marginLeft: '15px' }}>🗑️</button>
              </div>
            ))
          )}
        </div>

        {carrito.length > 0 && (
          <div style={{ padding: '20px', borderTop: '2px solid #eee', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
              <span>Total:</span>
              <span>${totalCarrito.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => { setModalCarritoAbierto(false); iniciarProcesoCompra(); }} 
              style={{ width: '100%', padding: '15px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
            >
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
      
      {modalCarritoAbierto && (
        <div onClick={() => setModalCarritoAbierto(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1999 }}></div>
      )}

      <ModalAuth modalAuthAbierto={modalAuthAbierto} setModalAuthAbierto={setModalAuthAbierto} modoRegistro={modoRegistro} setModoRegistro={setModoRegistro} formAuth={formAuth} manejarCambioAuth={manejarCambioAuth} gestionarLoginRegistro={gestionarLoginRegistro} />
      <ModalFactura modalFacturaAbierto={modalFacturaAbierto} setModalFacturaAbierto={setModalFacturaAbierto} datosFactura={datosFactura} manejarCambioFactura={manejarCambioFactura} enviarDatosFacturaExtra={enviarDatosFacturaExtra} />
      <ModalMetodoPago modalPagoAbierto={modalPagoAbierto} setModalPagoAbierto={setModalPagoAbierto} seleccionarMetodoPago={seleccionarMetodoPago} totalPagar={totalCarrito} />
      <ModalDatosBanco modalBancoAbierto={modalBancoAbierto} setModalBancoAbierto={setModalBancoAbierto} confirmarTransferencia={confirmarTransferencia} totalPagar={totalCarrito} />
      <ModalRecibo modalReciboAbierto={modalReciboAbierto} setModalReciboAbierto={setModalReciboAbierto} datosRecibo={datosRecibo} />
      <ModalAdmin modalAdminAbierto={modalAdminAbierto} setModalAdminAbierto={setModalAdminAbierto} claveAdmin={claveAdmin} setClaveAdmin={setClaveAdmin} verificarAdmin={verificarAdmin} />
      <ModalDetallePedido clienteSeleccionado={clienteSeleccionado} setClienteSeleccionado={setClienteSeleccionado} />
      <ModalMiCuenta modalCuentaAbierto={modalCuentaAbierto} setModalCuentaAbierto={setModalCuentaAbierto} usuarioLogueado={usuarioLogueado} setUsuarioLogueado={setUsuarioLogueado} />
      <ModalMisCompras modalComprasAbierto={modalComprasAbierto} setModalComprasAbierto={setModalComprasAbierto} usuarioLogueado={usuarioLogueado} />

      {/* RUTA PROTEGIDA DE ADMINISTRADOR */}
      {vistaAdmin ? (
        localStorage.getItem('esAdminFerreteria') === 'true' ? (
          <AdminPanel irAInicio={irAInicio} pedidosAdmin={pedidosAdmin} setClienteSeleccionado={setClienteSeleccionado} editando={editando} setEditando={setEditando} nuevoProducto={nuevoProducto} estadoInicial={estadoInicial} setNuevoProducto={setNuevoProducto} manejarCambio={manejarCambio} guardarProducto={guardarProducto} productos={productos} prepararEdicion={prepararEdicion} eliminarProducto={eliminarProducto} departamentos={departamentos} />
        ) : (
          <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
            <h2>⚠️ Acceso Denegado</h2>
            <p>No tienes los permisos de seguridad necesarios para ver esta sección.</p>
            <button onClick={irAInicio} style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Volver al Inicio</button>
          </div>
        )
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <Header irAInicio={irAInicio} busqueda={busqueda} setBusqueda={setBusqueda} setCategoriaActiva={setCategoriaActiva} setOfertaActiva={setOfertaActiva} usuarioLogueado={usuarioLogueado} cerrarSesion={cerrarSesion} setModalAuthAbierto={setModalAuthAbierto} setModalAdminAbierto={setModalAdminAbierto} setModalCuentaAbierto={setModalCuentaAbierto} setModalComprasAbierto={setModalComprasAbierto} setModalCarritoAbierto={setModalCarritoAbierto} carrito={carrito} seleccionarCategoria={seleccionarCategoria} seleccionarOferta={seleccionarOferta} seleccionarFavoritos={seleccionarFavoritos} departamentos={departamentos} />

          {mostrarInicio && <div onDoubleClick={() => setModalAdminAbierto(true)}><SeccionInicio departamentos={departamentos} seleccionarCategoria={seleccionarCategoria} seleccionarOferta={seleccionarOferta} /></div>}

          <div style={{ padding: '30px 5%', flex: 1 }}>
            
            {(!mostrarInicio || viendoFavoritos) && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
                  Inicio &gt; {viendoFavoritos ? 'Los favoritos (Más de 20 likes)' : (busqueda ? `Resultados para: '${busqueda}'` : (ofertaActiva ? `Ofertas > ${ofertaActiva}` : `Departamento: ${categoriaActiva}`))}
                </div>
                <h2 style={{ fontSize: '38px', color: '#333', fontWeight: 'bold', margin: '0 0 30px 0' }}>
                  {viendoFavoritos ? '❤️ Productos Favoritos del Público' : (busqueda ? `Resultados para: '${busqueda.toUpperCase()}'` : (ofertaActiva ? `Promociones: ${ofertaActiva}` : categoriaActiva))}
                </h2>
              </div>
            )}

            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
              
              {(!mostrarInicio || viendoFavoritos) && (
                <div style={{ width: '220px', flexShrink: '0' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', margin: '0 0 5px 0', color: '#000' }}><span style={{fontSize: '24px'}}>⧼</span> Filtros</h3>
                  <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '20px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', color: '#333' }}>Categoría <span>⌄</span></div>
                    <div style={{ color: '#555', fontSize: '14px', lineHeight: '2.5' }}>
                      {departamentos.map(dep => (
                        <div 
                          key={dep.id} 
                          style={{ cursor: 'pointer', fontWeight: categoriaActiva === dep.nombre && !viendoFavoritos ? 'bold' : 'normal', color: categoriaActiva === dep.nombre && !viendoFavoritos ? '#000' : '#555' }} 
                          onClick={() => seleccionarCategoria(dep.nombre)}
                        >
                          {dep.nombre}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ flex: '3' }}>
                {(!mostrarInicio || viendoFavoritos) ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', color: '#555', alignItems: 'center' }}>
                    <span><strong>{productosFiltrados.length}</strong> Productos encontrados</span>
                  </div>
                ) : (
                  <h2 style={{ borderBottom: '3px solid #fcee21', paddingBottom: '10px', display: 'inline-block', marginBottom: '30px', color: '#000' }}>Productos más vendidos</h2>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((producto) => (
                      <div key={producto.sku} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1px solid #eaeaea', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        
                        <button 
                          onClick={() => darLike(producto.sku)}
                          title="Dar Me Gusta"
                          style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 2 }}
                        >
                          ❤️ <span style={{ fontSize: '10px', fontWeight: 'bold', marginLeft: '2px' }}>{producto.likes || 0}</span>
                        </button>

                        <div>
                          {producto.imagen_url ? (
                            <div style={{ height: '180px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '4px' }}>
                              <img src={producto.imagen_url} alt={producto.nombre} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            </div>
                          ) : (
                            <div style={{ height: '180px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px' }}>🛠️</div>
                          )}

                          <h3 style={{ color: '#333', fontSize: '13px', margin: '0 0 10px 0', minHeight: '50px', maxHeight: '50px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', fontWeight: 'bold', lineHeight: '1.25' }} title={producto.nombre}>
                            {producto.nombre}
                          </h3>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>${producto.precio_venta.toFixed(2)}</span>
                          </div>
                          <button onClick={() => agregarAlCarrito(producto)} disabled={producto.stock === 0} style={{ width: '100%', padding: '12px', backgroundColor: producto.stock > 0 ? '#fcee21' : '#e0e0e0', color: '#000', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', cursor: producto.stock > 0 ? 'pointer' : 'not-allowed' }}>
                            {producto.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
                          </button>
                        </div>

                      </div>
                    ))
                  ) : <p style={{ gridColumn: '1 / -1', color: '#666', fontSize: '18px' }}>{viendoFavoritos ? 'Aún no hay productos con 20 o más likes. ¡Empieza a darles amor a tus favoritos!' : 'No se encontraron artículos.'}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* LAS NUEVAS 4 INSIGNIAS DE CONFIANZA */}
          <div style={{ backgroundColor: '#111', color: '#fff', padding: '25px 5%', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', borderTop: '3px solid #fcee21' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '32px' }}>🛒</span><div><h4 style={{ margin: 0, color: '#fcee21', fontSize: '16px' }}>Pedidos 24/7</h4><p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>Compra online, validación en horario laboral</p></div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '32px' }}>🔒</span><div><h4 style={{ margin: 0, color: '#fcee21', fontSize: '16px' }}>Compra segura</h4><p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>Tus datos están 100% protegidos y cifrados</p></div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '32px' }}>🔄</span><div><h4 style={{ margin: 0, color: '#fcee21', fontSize: '16px' }}>Devoluciones</h4><p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>Sujetas a términos y condiciones del local</p></div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '32px' }}>🏬</span><div><h4 style={{ margin: 0, color: '#fcee21', fontSize: '16px' }}>Retiro en Tienda</h4><p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>Cotiza web y retira directo en nuestro local</p></div></div>
          </div>

          <Footer irAInicio={irAInicio} seleccionarCategoria={seleccionarCategoria} setModalAdminAbierto={setModalAdminAbierto} />

        </div>
      )}
    </div>
  )
}

export default App