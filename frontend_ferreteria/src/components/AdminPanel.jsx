import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

function AdminPanel({
  irAInicio, pedidosAdmin, setClienteSeleccionado, editando, setEditando, nuevoProducto,
  estadoInicial, setNuevoProducto, manejarCambio, guardarProducto, productos,
  prepararEdicion, eliminarProducto, departamentos
}) {
  const estiloInput = { padding: '6px 10px', borderRadius: '2px', border: '1px solid #aaa', fontSize: '13px', width: '100%', boxSizing: 'border-box' };
  const estiloLabel = { fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '2px', display: 'block' };

  const [pestañaActiva, setPestañaActiva] = useState('dashboard'); 
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const [detalleDashboard, setDetalleDashboard] = useState(null); 

  const [busquedaAdmin, setBusquedaAdmin] = useState('');
  const [filtroDeptoInventario, setFiltroDeptoInventario] = useState('todos');
  const [filtroEstadoStock, setFiltroEstadoStock] = useState('todos');
  const [ordenInventario, setOrdenInventario] = useState('recientes');

  const [busquedaPedidos, setBusquedaPedidos] = useState('');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('todos');

  const [listaLogs, setListaLogs] = useState([]);
  const [busquedaLogs, setBusquedaLogs] = useState('');

  const [listaCreditos, setListaCreditos] = useState([]);
  const [busquedaCreditos, setBusquedaCreditos] = useState('');
  const [modalCreditoAbierto, setModalCreditoAbierto] = useState(false);
  const [nuevoCredito, setNuevoCredito] = useState({ nombre_cliente: '', cedula: '', telefono: '', limite_credito: 100, saldo_actual: 0 });
  const [modalAbonoAbierto, setModalAbonoAbierto] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');

  const [listaProveedores, setListaProveedores] = useState([]);
  const [listaOrdenes, setListaOrdenes] = useState([]);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({ nombre_empresa: '', contacto: '', telefono: '', correo: '', categoria_principal: 'General' });
  const [modalOrdenAbierto, setModalOrdenAbierto] = useState(false);
  const [nuevaOrden, setNuevaOrden] = useState({ proveedor_id: '', total_estimado: '', detalles_items: '' });

  const cargarLogsAuditoria = async () => {
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/auditoria');
      const datos = await respuesta.json();
      if (datos.estado === "Éxito") setListaLogs(datos.logs);
    } catch (error) { console.error(error); }
  };

  const cargarCreditos = async () => {
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/creditos');
      const datos = await respuesta.json();
      if (datos.estado === "Éxito") setListaCreditos(datos.cuentas);
    } catch (error) { console.error(error); }
  };

  const cargarProveedoresYOrdenes = async () => {
    try {
      const resProv = await fetch('http://127.0.0.1:8000/proveedores');
      const dataProv = await resProv.json();
      if (dataProv.estado === "Éxito") setListaProveedores(dataProv.proveedores);

      const resOrd = await fetch('http://127.0.0.1:8000/ordenes-compra');
      const dataOrd = await resOrd.json();
      if (dataOrd.estado === "Éxito") setListaOrdenes(dataOrd.ordenes);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    cargarLogsAuditoria();
    cargarCreditos();
    cargarProveedoresYOrdenes();
  }, [pestañaActiva]);

  const [carritoPOS, setCarritoPOS] = useState([]);
  const [busquedaPOS, setBusquedaPOS] = useState('');
  const [esConsumidorFinal, setEsConsumidorFinal] = useState(true);
  const [datosPOS, setDatosPOS] = useState({ nombre: '', apellido: '', cedula: '', direccion: '', correo: '', telefono: '' });
  const [metodoPagoPOS, setMetodoPagoPOS] = useState('Efectivo');
  
  const [ultimaVentaPOS, setUltimaVentaPOS] = useState(null);
  const [modalImprimirAbierto, setModalImprimirAbierto] = useState(false);

  const [listaPedidos, setListaPedidos] = useState(pedidosAdmin);
  const [listaProductos, setListaProductos] = useState(productos);

  useEffect(() => {
    setListaPedidos(pedidosAdmin);
    setListaProductos(productos);
  }, [pedidosAdmin, productos]);

  const recargarDatosEnSegundoPlano = async () => {
    try {
      const resPed = await fetch('http://127.0.0.1:8000/pedidos');
      const dataPed = await resPed.json();
      if(dataPed.estado === "Éxito") setListaPedidos(dataPed.pedidos);

      const resProd = await fetch('http://127.0.0.1:8000/productos');
      const dataProd = await resProd.json();
      if(dataProd.estado === "Éxito") setListaProductos(dataProd.catalogo);

      cargarLogsAuditoria();
      cargarCreditos();
      cargarProveedoresYOrdenes();
    } catch (error) { console.error(error); }
  };

  const subirExcel = async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    const formData = new FormData();
    formData.append("file", archivo);

    try {
        const respuesta = await fetch("http://localhost:8000/productos/cargar-excel", { method: "POST", body: formData });
        const datos = await respuesta.json();
        if (datos.estado === "Éxito") {
            alert("¡Genial! " + datos.mensaje);
            recargarDatosEnSegundoPlano(); 
        } else { alert("Error al cargar Excel: " + datos.detalle); }
    } catch (error) { alert("Error de conexión con el servidor."); }
  };

  const guardarNuevoCredito = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/creditos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCredito)
      });
      const datos = await respuesta.json();
      if (datos.estado === "Éxito") {
        alert("✅ Cuenta de crédito creada con éxito.");
        setModalCreditoAbierto(false);
        setNuevoCredito({ nombre_cliente: '', cedula: '', telefono: '', limite_credito: 100, saldo_actual: 0 });
        cargarCreditos();
      } else { alert("Error al crear cuenta: " + datos.detalle); }
    } catch (err) { alert("Error de conexión con el servidor."); }
  };

  const procesarAbono = async (e) => {
    e.preventDefault();
    if (!cuentaSeleccionada || !montoAbono) return;
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/creditos/abonar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credito_id: cuentaSeleccionada.id,
          monto_abonado: parseFloat(montoAbono),
          tipo_pago: 'Efectivo'
        })
      });
      const datos = await respuesta.json();
      if (datos.estado === "Éxito") {
        alert("✅ Abono registrado correctamente.");
        setModalAbonoAbierto(false);
        setCuentaSeleccionada(null);
        setMontoAbono('');
        recargarDatosEnSegundoPlano();
      } else { alert("Error al abonar: " + datos.detalle); }
    } catch (err) { alert("Error de conexión con el servidor."); }
  };

  const guardarNuevoProveedor = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProveedor)
      });
      const datos = await respuesta.json();
      if (datos.estado === "Éxito") {
        alert("✅ Proveedor registrado con éxito.");
        setModalProveedorAbierto(false);
        setNuevoProveedor({ nombre_empresa: '', contacto: '', telefono: '', correo: '', categoria_principal: 'General' });
        cargarProveedoresYOrdenes();
      } else { alert("Error al registrar proveedor: " + datos.detalle); }
    } catch (err) { alert("Error de conexión."); }
  };

  const guardarNuevaOrden = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/ordenes-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proveedor_id: parseInt(nuevaOrden.proveedor_id),
          total_estimado: parseFloat(nuevaOrden.total_estimado),
          detalles_items: nuevaOrden.detalles_items
        })
      });
      const datos = await respuesta.json();
      if (datos.estado === "Éxito") {
        alert("✅ Orden de compra generada con éxito.");
        setModalOrdenAbierto(false);
        setNuevaOrden({ proveedor_id: '', total_estimado: '', detalles_items: '' });
        cargarProveedoresYOrdenes();
      } else { alert("Error al generar orden: " + datos.detalle); }
    } catch (err) { alert("Error de conexión."); }
  };

  // --- FILTROS DE INVENTARIO ---
  let productosFiltrados = listaProductos.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(busquedaAdmin.toLowerCase()) || p.sku.toLowerCase().includes(busquedaAdmin.toLowerCase());
    const coincideDepto = filtroDeptoInventario === 'todos' ? true : p.id_categoria === parseInt(filtroDeptoInventario);
    let coincideStock = true;
    if (filtroEstadoStock === 'agotados') coincideStock = p.stock === 0;
    else if (filtroEstadoStock === 'criticos') coincideStock = p.stock > 0 && p.stock <= 5;
    else if (filtroEstadoStock === 'normales') coincideStock = p.stock > 5;
    return coincideTexto && coincideDepto && coincideStock;
  });

  if (ordenInventario === 'precio_asc') productosFiltrados.sort((a, b) => a.precio_venta - b.precio_venta);
  else if (ordenInventario === 'precio_desc') productosFiltrados.sort((a, b) => b.precio_venta - a.precio_venta);
  else if (ordenInventario === 'stock_asc') productosFiltrados.sort((a, b) => a.stock - b.stock);

  const productosFiltradosPOS = busquedaPOS.trim() === '' ? [] : listaProductos.filter(p => p.nombre.toLowerCase().includes(busquedaPOS.toLowerCase()) || p.sku.toLowerCase().includes(busquedaPOS.toLowerCase())).slice(0, 10);
  
  const pedidosFiltrados = listaPedidos.filter(ped => {
    const termino = busquedaPedidos.toLowerCase();
    const coincideTexto = ((ped.nombre_cliente && ped.nombre_cliente.toLowerCase().includes(termino)) || (ped.correo_cliente && ped.correo_cliente.toLowerCase().includes(termino)) || (ped.id && ped.id.toString().includes(termino)));
    const coincideMetodo = filtroMetodoPago === 'todos' ? true : (ped.metodo_pago && ped.metodo_pago.toLowerCase().includes(filtroMetodoPago.toLowerCase()));
    return coincideTexto && coincideMetodo;
  });

  const logsFiltrados = listaLogs.filter(log => log.accion.toLowerCase().includes(busquedaLogs.toLowerCase()) || log.detalles.toLowerCase().includes(busquedaLogs.toLowerCase()) || log.usuario.toLowerCase().includes(busquedaLogs.toLowerCase()));
  const creditosFiltrados = listaCreditos.filter(c => c.nombre_cliente.toLowerCase().includes(busquedaCreditos.toLowerCase()) || c.cedula.toLowerCase().includes(busquedaCreditos.toLowerCase()));

  const agregarAlPOS = (producto) => {
    if (producto.stock <= 0) return alert(`El producto "${producto.nombre}" está agotado en bodega.`);
    const existe = carritoPOS.find(item => item.sku === producto.sku);
    if (existe) {
      if (existe.cantidad < producto.stock) setCarritoPOS(carritoPOS.map(item => item.sku === producto.sku ? { ...item, cantidad: item.cantidad + 1 } : item));
      else alert("No hay más stock disponible.");
    } else { setCarritoPOS([...carritoPOS, { ...producto, cantidad: 1 }]); }
    setBusquedaPOS('');
  };

  const cambiarCantidadPOS = (sku, nuevaCantidad, stockMax) => {
    const cant = parseInt(nuevaCantidad);
    if (isNaN(cant) || cant <= 0) return;
    if (cant > stockMax) return alert("Supera el stock disponible.");
    setCarritoPOS(carritoPOS.map(item => item.sku === sku ? { ...item, cantidad: cant } : item));
  };

  const eliminarDelPOS = (sku) => setCarritoPOS(carritoPOS.filter(item => item.sku !== sku));
  const manejarCambioPOS = (e) => setDatosPOS({ ...datosPOS, [e.target.name]: e.target.value });
  const totalPOS = carritoPOS.reduce((t, item) => t + (item.precio_venta * item.cantidad), 0);

  const procesarVentaPOS = async () => {
    if (carritoPOS.length === 0) return alert("Agrega artículos al detalle antes de cobrar.");
    if (!esConsumidorFinal && (!datosPOS.nombre || !datosPOS.cedula)) return alert("Por favor ingresa Nombre y Cédula/RUC del cliente.");
    if (metodoPagoPOS === 'Crédito / Fiado' && esConsumidorFinal) {
      return alert("⚠️ Para otorgar un crédito debes ingresar los datos reales del cliente.");
    }

    const nombreClienteFinal = esConsumidorFinal ? "Consumidor Final" : `${datosPOS.nombre} ${datosPOS.apellido}`.trim();
    const cedulaFinal = esConsumidorFinal ? "9999999999" : datosPOS.cedula;
    const direccionFinal = esConsumidorFinal ? "S/N" : (datosPOS.direccion || "S/N");
    const metodoFinal = metodoPagoPOS === 'Efectivo' ? 'Efectivo (Caja)' : (metodoPagoPOS === 'Transferencia' ? 'Transferencia Bancaria' : 'Crédito / Fiado');

    const formData = new FormData();
    formData.append("nombre_cliente", nombreClienteFinal);
    formData.append("cedula", cedulaFinal);
    formData.append("direccion", direccionFinal);
    formData.append("whatsapp", esConsumidorFinal ? "9999999999" : (datosPOS.telefono || "S/N"));
    formData.append("correo_cliente", esConsumidorFinal ? "mostrador@ferreteriale.com" : (datosPOS.correo || "mostrador@ferreteriale.com"));
    formData.append("total_pagado", totalPOS);
    formData.append("metodo_pago", metodoFinal);
    formData.append("carrito", JSON.stringify(carritoPOS.map(item => ({ sku: item.sku, cantidad: item.cantidad, nombre: item.nombre, precio_venta: item.precio_venta }))));

    try {
      const respuesta = await fetch('http://127.0.0.1:8000/pedidos', { method: 'POST', body: formData });
      const datos = await respuesta.json();
      if (datos.estado === "Éxito") {
        setUltimaVentaPOS({
          cliente: nombreClienteFinal, cedula: cedulaFinal, direccion: direccionFinal, metodo: metodoFinal, total: totalPOS, items: [...carritoPOS], fecha: new Date().toLocaleString()
        });
        alert(metodoFinal === 'Crédito / Fiado' ? "✅ Crédito registrado exitosamente en Cuentas Corrientes." : "✅ Venta cobrada correctamente.");
        setCarritoPOS([]);
        setDatosPOS({ nombre: '', apellido: '', cedula: '', direccion: '', correo: '', telefono: '' });
        setEsConsumidorFinal(true);
        recargarDatosEnSegundoPlano(); 
        setModalImprimirAbierto(true); 
      } else alert("Error al procesar: " + datos.detalle);
    } catch (error) { alert("Error de conexión con el servidor."); }
  };

  const imprimirRecibo = () => { window.print(); };

  const pedidosCaja = listaPedidos.filter(ped => {
    const metodo = (ped.metodo_pago || '').toLowerCase();
    if (metodo.includes('pendiente')) return false; 
    if (metodo === 'crédito / fiado') return false; 
    return true; 
  });

  const totalIngresos = pedidosCaja.reduce((acc, ped) => acc + parseFloat(ped.total_pagado || 0), 0);
  
  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset() * 60000;
    return new Date(hoy.getTime() - offset).toISOString().split('T')[0];
  };
  const [fechaFiltro, setFechaFiltro] = useState(obtenerFechaLocal());
  const hoyStr = obtenerFechaLocal();
  
  const ventasHoy = pedidosCaja.filter(ped => ped.fecha_pedido && ped.fecha_pedido.startsWith(hoyStr)).reduce((acc, ped) => acc + parseFloat(ped.total_pagado || 0), 0);
  const pedidosFiltradosPorFecha = pedidosCaja.filter(ped => ped.fecha_pedido && ped.fecha_pedido.startsWith(fechaFiltro));
  const totalFiltradoPorFecha = pedidosFiltradosPorFecha.reduce((acc, ped) => acc + parseFloat(ped.total_pagado || 0), 0);

  const ventasPorFechaMap = {};
  pedidosCaja.forEach(ped => {
    if (ped.fecha_pedido) {
      const fecha = ped.fecha_pedido.split('T')[0];
      ventasPorFechaMap[fecha] = (ventasPorFechaMap[fecha] || 0) + parseFloat(ped.total_pagado || 0);
    }
  });
  const datosGraficoVentas = Object.keys(ventasPorFechaMap).sort().map(fecha => ({ fecha: fecha.slice(5), ventas: ventasPorFechaMap[fecha] }));

  const productosAgotados = listaProductos.filter(p => p.stock === 0);
  const productosActivos = listaProductos.filter(p => p.stock > 0);
  const productosCriticos = listaProductos.filter(p => p.stock > 0 && p.stock <= 5);

  const ventasPorCategoriaMap = {};
  listaProductos.forEach(p => {
    if (p.ventas > 0) {
      const nombreDepto = departamentos.find(d => d.id === p.id_categoria)?.nombre || 'General';
      ventasPorCategoriaMap[nombreDepto] = (ventasPorCategoriaMap[nombreDepto] || 0) + p.ventas;
    }
  });
  const datosGraficoCategorias = Object.keys(ventasPorCategoriaMap).map(cat => ({ categoria: cat, cantidad: ventasPorCategoriaMap[cat] })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

  const getBotonSidebarStyle = (pestaña) => ({
    width: '100%', padding: sidebarColapsado ? '15px 0' : '15px 20px', textAlign: 'left',
    backgroundColor: pestañaActiva === pestaña ? '#fcee21' : 'transparent', color: pestañaActiva === pestaña ? '#000' : '#fff', border: 'none', cursor: 'pointer',
    fontSize: '15px', fontWeight: 'bold', borderLeft: pestañaActiva === pestaña ? '5px solid #fff' : '5px solid transparent',
    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: sidebarColapsado ? 'center' : 'flex-start', gap: sidebarColapsado ? '0' : '12px'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: pestañaActiva === 'dashboard' ? '#0b1622' : '#e0e4e8', fontFamily: 'Arial, sans-serif', transition: 'background-color 0.3s' }}>
      
      {/* SIDEBAR */}
      <div className="no-print" style={{ width: sidebarColapsado ? '70px' : '240px', backgroundColor: '#070d14', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.3s ease', borderRight: '1px solid #1a2938' }}>
        <div style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: sidebarColapsado ? 'center' : 'space-between', borderBottom: '1px solid #1a2938' }}>
          {!sidebarColapsado && <img src="/logo.jpeg" alt="Ferretería" style={{ width: '130px', borderRadius: '4px', backgroundColor: '#fcee21', padding: '3px' }} />}
          <button onClick={() => setSidebarColapsado(!sidebarColapsado)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: 0 }}>☰</button>
        </div>
        <nav style={{ flex: 1, paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button onClick={() => setPestañaActiva('dashboard')} style={getBotonSidebarStyle('dashboard')}><span style={{ fontSize: '20px' }}>📊</span> {!sidebarColapsado && <span>Dashboard Analítico</span>}</button>
          <button onClick={() => setPestañaActiva('pos')} style={getBotonSidebarStyle('pos')}><span style={{ fontSize: '20px' }}>🏪</span> {!sidebarColapsado && <span>Facturación POS</span>}</button>
          <button onClick={() => setPestañaActiva('inventario')} style={getBotonSidebarStyle('inventario')}><span style={{ fontSize: '20px' }}>🗄️</span> {!sidebarColapsado && <span>Inventario</span>}</button>
          <button onClick={() => setPestañaActiva('pedidos')} style={getBotonSidebarStyle('pedidos')}><span style={{ fontSize: '20px' }}>📦</span> {!sidebarColapsado && <span>Ventas & Pedidos</span>}</button>
          <button onClick={() => setPestañaActiva('creditos')} style={getBotonSidebarStyle('creditos')}><span style={{ fontSize: '20px' }}>💳</span> {!sidebarColapsado && <span>Créditos & Fiados</span>}</button>
          <button onClick={() => setPestañaActiva('proveedores')} style={getBotonSidebarStyle('proveedores')}><span style={{ fontSize: '20px' }}>🏭</span> {!sidebarColapsado && <span>Proveedores & Órdenes</span>}</button>
          <button onClick={() => setPestañaActiva('auditoria')} style={getBotonSidebarStyle('auditoria')}><span style={{ fontSize: '20px' }}>🛡️</span> {!sidebarColapsado && <span>Auditoría & Logs</span>}</button>
          <button onClick={() => setPestañaActiva('ajustes')} style={getBotonSidebarStyle('ajustes')}><span style={{ fontSize: '20px' }}>⚙️</span> {!sidebarColapsado && <span>Carga & Ajustes</span>}</button>
        </nav>
        <div style={{ padding: '15px', borderTop: '1px solid #1a2938' }}>
          <button onClick={irAInicio} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: sidebarColapsado ? '0' : '10px' }}><span style={{ fontSize: '18px' }}>🏠</span> {!sidebarColapsado && <span style={{ fontSize: '14px' }}>Ir a la Tienda</span>}</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', position: 'relative' }}>
        
        {/* FACTURACIÓN POS */}
        {pestañaActiva === 'pos' && (
          <div className="no-print" style={{ backgroundColor: '#f0f0f0', border: '2px solid #999', borderRadius: '4px', padding: '10px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', boxShadow: 'inset 1px 1px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e4e4e4', border: '1px solid #ccc', padding: '5px 15px', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#000' }}>📄 Sistema de Gestión Comercial - Ferretería L E</h2>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Fecha: {new Date().toLocaleDateString()}</div>
            </div>

            <fieldset style={{ border: '1px solid #aaa', padding: '10px', marginBottom: '10px', backgroundColor: '#fafafa' }}>
              <legend style={{ fontSize: '12px', fontWeight: 'bold', color: '#0056b3' }}>Datos Cliente</legend>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                  <input type="checkbox" checked={esConsumidorFinal} onChange={(e) => setEsConsumidorFinal(e.target.checked)} style={{ transform: 'scale(1.2)' }}/> Consumidor Final (Venta Rápida)
                </label>
              </div>
              {!esConsumidorFinal && (
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '150px' }}><label style={estiloLabel}>I. / R.U.C.</label><input name="cedula" value={datosPOS.cedula} onChange={manejarCambioPOS} style={estiloInput} /></div>
                  <div style={{ flex: 2, minWidth: '200px' }}><label style={estiloLabel}>Nombres / Razón Social</label><div style={{display:'flex', gap:'5px'}}><input name="nombre" placeholder="Nombres" value={datosPOS.nombre} onChange={manejarCambioPOS} style={estiloInput} /><input name="apellido" placeholder="Apellidos" value={datosPOS.apellido} onChange={manejarCambioPOS} style={estiloInput} /></div></div>
                  <div style={{ flex: 2, minWidth: '200px' }}><label style={estiloLabel}>Dirección</label><input name="direccion" value={datosPOS.direccion} onChange={manejarCambioPOS} style={estiloInput} /></div>
                  <div style={{ flex: 1, minWidth: '120px' }}><label style={estiloLabel}>Teléfono</label><input name="telefono" value={datosPOS.telefono} onChange={manejarCambioPOS} style={estiloInput} /></div>
                  <div style={{ flex: 1.5, minWidth: '150px' }}><label style={estiloLabel}>Correo</label><input name="correo" value={datosPOS.correo} onChange={manejarCambioPOS} style={estiloInput} /></div>
                </div>
              )}
            </fieldset>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', position: 'relative' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #aaa', padding: '2px 8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>🔍</span>
                <input type="text" placeholder="Buscar producto por Código o Detalle para agregar al detalle..." value={busquedaPOS} onChange={(e) => setBusquedaPOS(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', padding: '6px', fontSize: '13px', backgroundColor: 'transparent' }}/>
              </div>
              
              {productosFiltradosPOS.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #aaa', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                  {productosFiltradosPOS.map(p => (
                    <div 
                      key={p.sku} 
                      onClick={() => p.stock > 0 ? agregarAlPOS(p) : alert(`El producto "${p.nombre}" está agotado.`)} 
                      style={{ padding: '8px 15px', borderBottom: '1px solid #eee', cursor: p.stock > 0 ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'space-between', fontSize: '12px', backgroundColor: p.stock > 0 ? '#fff' : '#ffebee' }}
                    >
                      <span style={{ fontWeight: 'bold' }}>{p.sku}</span>
                      <span style={{ flex: 1, margin: '0 15px' }}>{p.nombre}</span>
                      <span style={{ color: p.stock > 0 ? 'green' : '#c62828', fontWeight: 'bold' }}>Stock: {p.stock}</span>
                      <span style={{ fontWeight: 'bold', marginLeft: '15px' }}>${parseFloat(p.precio_venta).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #aaa', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead style={{ backgroundColor: '#d0e4f5', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ border: '1px solid #aaa', padding: '6px' }}>Código</th>
                    <th style={{ border: '1px solid #aaa', padding: '6px', width: '50%' }}>Detalle</th>
                    <th style={{ border: '1px solid #aaa', padding: '6px', textAlign: 'center' }}>Cant.</th>
                    <th style={{ border: '1px solid #aaa', padding: '6px', textAlign: 'right' }}>Pre.Unit.</th>
                    <th style={{ border: '1px solid #aaa', padding: '6px', textAlign: 'right' }}>Total</th>
                    <th style={{ border: '1px solid #aaa', padding: '6px', textAlign: 'center' }}>Exis.</th>
                    <th style={{ border: '1px solid #aaa', padding: '6px', textAlign: 'center' }}>X</th>
                  </tr>
                </thead>
                <tbody>
                  {carritoPOS.map((item, index) => (
                    <tr key={item.sku} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ border: '1px solid #aaa', padding: '4px 6px' }}>{item.sku}</td>
                      <td style={{ border: '1px solid #aaa', padding: '4px 6px', fontWeight: 'bold' }}>{item.nombre}</td>
                      <td style={{ border: '1px solid #aaa', padding: '2px', textAlign: 'center', backgroundColor: '#e1f5fe' }}>
                        <input type="number" value={item.cantidad} onChange={(e) => cambiarCantidadPOS(item.sku, e.target.value, item.stock)} style={{ width: '50px', textAlign: 'center', border: 'none', backgroundColor: 'transparent', outline: 'none', fontWeight: 'bold' }}/>
                      </td>
                      <td style={{ border: '1px solid #aaa', padding: '4px 6px', textAlign: 'right' }}>{parseFloat(item.precio_venta).toFixed(4)}</td>
                      <td style={{ border: '1px solid #aaa', padding: '4px 6px', textAlign: 'right', fontWeight: 'bold', color: '#0056b3' }}>{(item.precio_venta * item.cantidad).toFixed(4)}</td>
                      <td style={{ border: '1px solid #aaa', padding: '4px 6px', textAlign: 'center', color: '#555' }}>{item.stock}</td>
                      <td style={{ border: '1px solid #aaa', padding: '2px', textAlign: 'center' }}><button onClick={() => eliminarDelPOS(item.sku)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>X</button></td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 10 - carritoPOS.length) }).map((_, i) => (
                    <tr key={`empty-${i}`}><td style={{ border: '1px solid #aaa', padding: '12px' }}></td><td style={{ border: '1px solid #aaa' }}></td><td style={{ border: '1px solid #aaa', backgroundColor: '#e1f5fe' }}></td><td style={{ border: '1px solid #aaa' }}></td><td style={{ border: '1px solid #aaa' }}></td><td style={{ border: '1px solid #aaa' }}></td><td style={{ border: '1px solid #aaa' }}></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <fieldset style={{ flex: 1, border: '1px solid #aaa', padding: '10px', backgroundColor: '#fafafa' }}>
                <legend style={{ fontSize: '12px', fontWeight: 'bold' }}>Forma de Pago</legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}><input type="radio" name="metodo" checked={metodoPagoPOS === 'Efectivo'} onChange={() => setMetodoPagoPOS('Efectivo')} /> Efectivo</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}><input type="radio" name="metodo" checked={metodoPagoPOS === 'Transferencia'} onChange={() => setMetodoPagoPOS('Transferencia')} /> Transferencia</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#b71c1c', fontWeight: 'bold' }}><input type="radio" name="metodo" checked={metodoPagoPOS === 'Crédito / Fiado'} onChange={() => setMetodoPagoPOS('Crédito / Fiado')} /> 💳 Crédito / Fiado</label>
                </div>
              </fieldset>

              <fieldset style={{ flex: 1.5, border: '1px solid #aaa', padding: '10px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '5px' }}><span style={{ fontSize: '13px', fontWeight: 'bold' }}>Subtotal:</span><span style={{ fontSize: '13px' }}>{totalPOS.toFixed(4)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '5px' }}><span style={{ fontSize: '13px', fontWeight: 'bold' }}>IVA 0%:</span><span style={{ fontSize: '13px' }}>0.0000</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', backgroundColor: '#fcee21', padding: '5px', border: '1px solid #000' }}><span style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>Total USD:</span><span style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>${totalPOS.toFixed(2)}</span></div>
              </fieldset>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '160px' }}>
                <button onClick={procesarVentaPOS} style={{ flex: 1, backgroundColor: '#000', color: '#fcee21', border: '1px solid #000', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>💳 COBRAR</button>
                <button onClick={() => setCarritoPOS([])} style={{ flex: 1, backgroundColor: '#eee', color: '#333', border: '1px solid #aaa', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: DASHBOARD */}
        {pestañaActiva === 'dashboard' && (
          <div className="no-print" style={{ color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: '#101e2e', padding: '15px 25px', borderRadius: '8px', border: '1px solid #1a2f44' }}>
              <div><h1 style={{ margin: 0, fontSize: '24px', color: '#fcee21', textTransform: 'uppercase', letterSpacing: '1px' }}>Dashboard de Ventas</h1><p style={{ margin: '5px 0 0 0', color: '#8da2b5', fontSize: '13px' }}>El poder de los datos - Ferretería L E</p></div>
              <div style={{ backgroundColor: '#0b1622', padding: '8px 15px', borderRadius: '4px', border: '1px solid #1a2f44' }}><span style={{ color: '#8da2b5', fontSize: '12px', display: 'block' }}>Fecha de corte</span><strong style={{ color: '#fff', fontSize: '14px' }}>Hoy</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', backgroundColor: '#101e2e', padding: '15px 25px', borderRadius: '8px', border: '1px solid #1a2f44', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fcee21', fontSize: '15px' }}>📥 Reportes Gerenciales y Contabilidad</h3>
                <p style={{ margin: '3px 0 0 0', color: '#8da2b5', fontSize: '12px' }}>Descarga la información oficial del negocio en formato Excel (.xlsx)</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.open('http://127.0.0.1:8000/exportar/inventario', '_blank')} style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>📊 Descargar Inventario</button>
                <button onClick={() => window.open('http://127.0.0.1:8000/exportar/pedidos', '_blank')} style={{ backgroundColor: '#0288d1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>📈 Descargar Ventas / Pedidos</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div style={{ backgroundColor: '#101e2e', padding: '20px', borderRadius: '8px', border: '1px solid #1a2f44', borderLeft: '4px solid #4caf50' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#8da2b5', fontSize: '12px', textTransform: 'uppercase' }}>Ingresos Acumulados</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>${totalIngresos.toFixed(2)}</p><span style={{ fontSize: '26px' }}>💵</span></div>
              </div>
              <div onClick={() => { setDetalleDashboard('ventas_diarias'); setFechaFiltro(obtenerFechaLocal()); }} style={{ backgroundColor: '#101e2e', padding: '20px', borderRadius: '8px', border: '1px solid #1a2f44', borderLeft: '4px solid #9c27b0', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#8da2b5', fontSize: '12px', textTransform: 'uppercase' }}>Ventas de Hoy</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>${ventasHoy.toFixed(2)}</p><span style={{ fontSize: '26px' }}>📅</span></div>
              </div>
              <div onClick={() => setDetalleDashboard('pedidos')} style={{ backgroundColor: '#101e2e', padding: '20px', borderRadius: '8px', border: '1px solid #1a2f44', borderLeft: '4px solid #2196f3', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#8da2b5', fontSize: '12px', textTransform: 'uppercase' }}>Total Pedidos</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{listaPedidos.length}</p><span style={{ fontSize: '26px' }}>📦</span></div>
              </div>
              <div onClick={() => setDetalleDashboard('activos')} style={{ backgroundColor: '#101e2e', padding: '20px', borderRadius: '8px', border: '1px solid #1a2f44', borderLeft: '4px solid #fcee21', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#8da2b5', fontSize: '12px', textTransform: 'uppercase' }}>Productos Activos</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{productosActivos.length}</p><span style={{ fontSize: '26px' }}>🛠️</span></div>
              </div>
              <div onClick={() => setDetalleDashboard('criticos')} style={{ backgroundColor: '#101e2e', padding: '20px', borderRadius: '8px', border: '1px solid #fbc02d', borderLeft: '4px solid #fbc02d', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#8da2b5', fontSize: '12px', textTransform: 'uppercase' }}>Por Agotarse</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#fbc02d' }}>{productosCriticos.length}</p><span style={{ fontSize: '26px' }}>⚠️</span></div>
              </div>
              <div onClick={() => setDetalleDashboard('agotados')} style={{ backgroundColor: '#101e2e', padding: '20px', borderRadius: '8px', border: '1px solid #ff4b4b', borderLeft: '4px solid #ff4b4b', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#8da2b5', fontSize: '12px', textTransform: 'uppercase' }}>Agotados</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ff4b4b' }}>{productosAgotados.length}</p><span style={{ fontSize: '26px' }}>❌</span></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              <div style={{ backgroundColor: '#101e2e', padding: '25px', borderRadius: '8px', border: '1px solid #1a2f44' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '16px' }}>📈 Tendencia de Ingresos (Histórico)</h3>
                <div style={{ width: '100%', height: '260px' }}>
                  {datosGraficoVentas.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={datosGraficoVentas}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2f44" />
                        <XAxis dataKey="fecha" stroke="#8da2b5" fontSize={12} />
                        <YAxis stroke="#8da2b5" fontSize={12} tickFormatter={(val) => `$${val}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#070d14', border: '1px solid #1a2f44', color: '#fff' }} />
                        <Line type="monotone" dataKey="ventas" stroke="#fcee21" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div style={{ color: '#8da2b5', textAlign: 'center', padding: '50px' }}>Sin datos de ventas.</div>}
                </div>
              </div>

              <div style={{ backgroundColor: '#101e2e', padding: '25px', borderRadius: '8px', border: '1px solid #1a2f44' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '16px' }}>📊 Volumen de Ventas por Categoría</h3>
                <div style={{ width: '100%', height: '260px' }}>
                  {datosGraficoCategorias.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosGraficoCategorias}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2f44" />
                        <XAxis dataKey="categoria" stroke="#8da2b5" fontSize={11} />
                        <YAxis stroke="#8da2b5" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#070d14', border: '1px solid #1a2f44', color: '#fff' }} />
                        <Bar dataKey="cantidad" fill="#4caf50" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div style={{ color: '#8da2b5', textAlign: 'center', padding: '50px' }}>Sin ventas por categoría.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: INVENTARIO */}
        {pestañaActiva === 'inventario' && (
          <div className="no-print" style={{ backgroundColor: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Gestión Avanzada de Inventario</h2>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 10px', width: '280px' }}>
                  <span style={{ fontSize: '14px' }}>🔍</span>
                  <input type="text" placeholder="Buscar SKU o Nombre..." value={busquedaAdmin} onChange={(e) => setBusquedaAdmin(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', padding: '6px', width: '100%', fontSize: '13px' }}/>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px 15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Departamento:</span>
                  <select value={filtroDeptoInventario} onChange={(e) => setFiltroDeptoInventario(e.target.value)} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                    <option value="todos">Todas las categorías</option>
                    {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Estado Stock:</span>
                  <select value={filtroEstadoStock} onChange={(e) => setFiltroEstadoStock(e.target.value)} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                    <option value="todos">Todos los estados</option>
                    <option value="normales">Stock Normal (&gt;5)</option>
                    <option value="criticos">Por Agotarse (&lt;=5)</option>
                    <option value="agotados">Agotados (0)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Ordenar por:</span>
                  <select value={ordenInventario} onChange={(e) => setOrdenInventario(e.target.value)} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                    <option value="recientes">Más recientes</option>
                    <option value="precio_asc">Precio: Menor a Mayor</option>
                    <option value="precio_desc">Precio: Mayor a Menor</option>
                    <option value="stock_asc">Stock: Menor a Mayor</option>
                  </select>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Mostrando {productosFiltrados.length} de {listaProductos.length}</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead style={{ backgroundColor: '#f4f6f8', position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>SKU</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Img</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Producto</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Precio</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Stock</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((p) => {
                    const depto = departamentos.find(d => d.id === p.id_categoria)?.nombre || 'General';
                    return (
                      <tr key={p.sku} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px 15px', fontWeight: 'bold' }}>{p.sku}</td>
                        <td style={{ padding: '8px 15px' }}>{p.imagen_url ? <img src={p.imagen_url} alt="" style={{ width: '30px', height: '30px', objectFit: 'contain' }} /> : '🛠️'}</td>
                        <td style={{ padding: '8px 15px' }}><div style={{ fontWeight: 'bold', color: '#333' }}>{p.nombre}</div><div style={{ fontSize: '11px', color: '#888' }}>{depto}</div></td>
                        <td style={{ padding: '8px 15px', fontWeight: 'bold' }}>${parseFloat(p.precio_venta).toFixed(2)}</td>
                        <td style={{ padding: '8px 15px' }}><span style={{ backgroundColor: p.stock > 5 ? '#e8f5e9' : (p.stock > 0 ? '#fff8e1' : '#ffebee'), color: p.stock > 5 ? '#2e7d32' : (p.stock > 0 ? '#f57f17' : '#c62828'), padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '11px' }}>{p.stock} un.</span></td>
                        <td style={{ padding: '8px 15px', textAlign: 'center' }}>
                          <button onClick={() => { setPestañaActiva('ajustes'); prepararEdicion(p); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', marginRight: '8px' }} title="Editar">✏️</button>
                          <button onClick={() => eliminarProducto(p.sku)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px' }} title="Eliminar">🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: PEDIDOS */}
        {pestañaActiva === 'pedidos' && (
          <div className="no-print" style={{ backgroundColor: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Registro de Pedidos y Ventas</h2>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={filtroMetodoPago} onChange={(e) => setFiltroMetodoPago(e.target.value)} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                  <option value="todos">Todos los métodos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Crédito">Crédito / Fiado</option>
                </select>
                <input type="text" placeholder="Buscar cliente..." value={busquedaPedidos} onChange={(e) => setBusquedaPedidos(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', width: '220px' }}/>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#f4f6f8', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>ID</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Cliente</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Método de Pago</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Total</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((ped) => (
                    <tr key={ped.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 15px', fontWeight: 'bold' }}>#{ped.id}</td>
                      <td style={{ padding: '10px 15px' }}><div style={{ fontWeight: 'bold', color: '#333' }}>{ped.nombre_cliente}</div></td>
                      <td style={{ padding: '10px 15px' }}><span style={{ backgroundColor: ped.metodo_pago.includes('Pendiente') ? '#fff3e0' : '#e1f5fe', color: ped.metodo_pago.includes('Pendiente') ? '#e65100' : '#0288d1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{ped.metodo_pago}</span></td>
                      <td style={{ padding: '10px 15px', fontWeight: 'bold', color: '#008000' }}>${parseFloat(ped.total_pagado).toFixed(2)}</td>
                      <td style={{ padding: '10px 15px', textAlign: 'center' }}><button onClick={() => setClienteSeleccionado(ped)} style={{ backgroundColor: '#000', color: '#fcee21', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Ver Detalles</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: CRÉDITOS & FIADOS */}
        {pestañaActiva === 'creditos' && (
          <div className="no-print" style={{ backgroundColor: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>💳 Cuentas Corrientes y Créditos (Fiados)</h2>
                <p style={{ margin: '3px 0 0 0', color: '#666', fontSize: '12px' }}>Control de saldos pendientes, límites y abonos de clientes frecuentes.</p>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button onClick={recargarDatosEnSegundoPlano} style={{ backgroundColor: '#fcee21', color: '#000', border: '1px solid #000', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🔄 Actualizar Saldos</button>
                <button onClick={() => setModalCreditoAbierto(true)} style={{ backgroundColor: '#000', color: '#fcee21', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>➕ Nueva Cuenta Fiada</button>
                <input type="text" placeholder="Buscar cliente..." value={busquedaCreditos} onChange={(e) => setBusquedaCreditos(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', width: '200px' }}/>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#f4f6f8', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Cliente</th>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Cédula / RUC</th>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Límite Crédito</th>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Saldo Actual</th>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Estado</th>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {creditosFiltrados.length > 0 ? creditosFiltrados.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{c.nombre_cliente}</td>
                      <td style={{ padding: '12px 15px', color: '#666' }}>{c.cedula}</td>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>${parseFloat(c.limite_credito).toFixed(2)}</td>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold', color: c.saldo_actual > 0 ? '#c62828' : '#2e7d32' }}>${parseFloat(c.saldo_actual).toFixed(2)}</td>
                      <td style={{ padding: '12px 15px' }}><span style={{ backgroundColor: c.estado === 'Al día' ? '#e8f5e9' : '#ffebee', color: c.estado === 'Al día' ? '#2e7d32' : '#c62828', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{c.estado}</span></td>
                      <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <button onClick={() => { setCuentaSeleccionada(c); setModalAbonoAbierto(true); }} style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>💵 Registrar Abono</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>No hay cuentas de crédito.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: PROVEEDORES & ÓRDENES */}
        {pestañaActiva === 'proveedores' && (
          <div className="no-print" style={{ backgroundColor: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>🏭 Control de Proveedores y Órdenes de Compra</h2>
                <p style={{ margin: '3px 0 0 0', color: '#666', fontSize: '12px' }}>Gestión de casas comerciales y abastecimiento de inventario.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setModalProveedorAbierto(true)} style={{ backgroundColor: '#000', color: '#fcee21', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>➕ Registrar Proveedor</button>
                <button onClick={() => setModalOrdenAbierto(true)} style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>📦 Nueva Orden de Compra</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '15px' }}>📋 Listado de Proveedores Registrados</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                {listaProveedores.length > 0 ? listaProveedores.map(prov => (
                  <div key={prov.id} style={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '6px', padding: '15px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#000', fontSize: '15px' }}>{prov.nombre_empresa}</h4>
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#555' }}><strong>Contacto:</strong> {prov.contacto || 'N/A'}</p>
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#555' }}><strong>Teléfono:</strong> {prov.telefono || 'N/A'}</p>
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#555' }}><strong>Correo:</strong> {prov.correo || 'N/A'}</p>
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#0056b3', fontWeight: 'bold' }}>Categoría: {prov.categoria_principal}</p>
                  </div>
                )) : <p style={{ color: '#666', fontStyle: 'italic' }}>No hay proveedores registrados todavía.</p>}
              </div>

              <h3 style={{ fontSize: '16px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '15px' }}>📦 Órdenes de Compra Generadas</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#f4f6f8' }}>
                  <tr>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>ID Orden</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Proveedor</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Detalles / Items</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Total Estimado</th>
                    <th style={{ padding: '10px 15px', borderBottom: '2px solid #ddd' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {listaOrdenes.length > 0 ? listaOrdenes.map(ord => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 15px', fontWeight: 'bold' }}>#{ord.id}</td>
                      <td style={{ padding: '10px 15px', fontWeight: 'bold' }}>{ord.proveedor}</td>
                      <td style={{ padding: '10px 15px', color: '#555' }}>{ord.detalles_items}</td>
                      <td style={{ padding: '10px 15px', fontWeight: 'bold', color: '#2e7d32' }}>${parseFloat(ord.total_estimado).toFixed(2)}</td>
                      <td style={{ padding: '10px 15px' }}><span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{ord.estado}</span></td>
                    </tr>
                  )) : <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>No hay órdenes de compra registradas.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: AUDITORÍA */}
        {pestañaActiva === 'auditoria' && (
          <div className="no-print" style={{ backgroundColor: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>🛡️ Registro de Auditoría (Logs de Seguridad)</h2>
              <button onClick={cargarLogsAuditoria} style={{ backgroundColor: '#fcee21', color: '#000', border: '1px solid #000', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🔄 Actualizar Logs</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#f4f6f8', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>ID</th>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Acción</th>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Detalles</th>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Usuario</th>
                    <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {logsFiltrados.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>#{log.id}</td>
                      <td style={{ padding: '12px 15px' }}><span style={{ backgroundColor: '#e3f2fd', color: '#1565c0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{log.accion}</span></td>
                      <td style={{ padding: '12px 15px' }}>{log.detalles}</td>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#0056b3' }}>{log.usuario}</td>
                      <td style={{ padding: '12px 15px', color: '#555' }}>{log.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: AJUSTES */}
        {pestañaActiva === 'ajustes' && (
          <div className="no-print" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '280px', backgroundColor: '#fff', padding: '20px', borderRadius: '6px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <h2 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '18px' }}>{editando ? '✏️ Editar Artículo' : '➕ Crear Artículo Manual'}</h2>
              <form onSubmit={(e) => { guardarProducto(e); setPestañaActiva('inventario'); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={estiloLabel}>Código SKU</label><input name="sku" value={nuevoProducto.sku} onChange={manejarCambio} required disabled={editando} style={estiloInput} />
                <label style={estiloLabel}>Nombre del Producto</label><input name="nombre" value={nuevoProducto.nombre} onChange={manejarCambio} required style={estiloInput} />
                <div style={{ display: 'flex', gap: '10px' }}><div style={{ flex: 1 }}><label style={estiloLabel}>Precio Venta ($)</label><input name="precio_venta" type="text" value={nuevoProducto.precio_venta} onChange={manejarCambio} required style={estiloInput} /></div><div style={{ flex: 1 }}><label style={estiloLabel}>Stock</label><input name="stock" type="number" value={nuevoProducto.stock} onChange={manejarCambio} required style={estiloInput} /></div></div>
                <label style={estiloLabel}>Categoría</label><select name="id_categoria" value={nuevoProducto.id_categoria} onChange={manejarCambio} required style={estiloInput}>{departamentos.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}</select>
                <label style={estiloLabel}>Imagen URL</label><input name="imagen_url" value={nuevoProducto.imagen_url || ''} onChange={manejarCambio} style={estiloInput} />
                <label style={estiloLabel}>Descripción</label><textarea name="descripcion_corta" value={nuevoProducto.descripcion_corta} onChange={manejarCambio} required style={{ ...estiloInput, minHeight: '60px' }} />
                <button type="submit" style={{ padding: '12px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{editando ? 'Guardar Cambios' : 'Crear Producto'}</button>
              </form>
            </div>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '6px', border: '2px dashed #000', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}><span style={{ fontSize: '30px' }}>📁</span><h2 style={{ marginTop: '10px', color: '#333', fontSize: '18px' }}>Sincronización Modo Espejo</h2><p style={{ color: '#666', fontSize: '13px', marginBottom: '15px' }}>Sube tu archivo de Excel (.xlsx) para actualizar stock y precios.</p><input type="file" accept=".xlsx, .xls" onChange={subirExcel} style={{ width: '100%', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}/></div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: NUEVO PROVEEDOR */}
      {modalProveedorAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', color: '#000', borderRadius: '8px', width: '100%', maxWidth: '450px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>➕ Registrar Nuevo Proveedor</h3>
            <form onSubmit={guardarNuevoProveedor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={estiloLabel}>Nombre de la Empresa</label>
              <input type="text" required value={nuevoProveedor.nombre_empresa} onChange={(e) => setNuevoProveedor({...nuevoProveedor, nombre_empresa: e.target.value})} style={estiloInput} />
              <label style={estiloLabel}>Persona de Contacto</label>
              <input type="text" value={nuevoProveedor.contacto} onChange={(e) => setNuevoProveedor({...nuevoProveedor, contacto: e.target.value})} style={estiloInput} />
              <label style={estiloLabel}>Teléfono</label>
              <input type="text" value={nuevoProveedor.telefono} onChange={(e) => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})} style={estiloInput} />
              <label style={estiloLabel}>Correo Electrónico</label>
              <input type="email" value={nuevoProveedor.correo} onChange={(e) => setNuevoProveedor({...nuevoProveedor, correo: e.target.value})} style={estiloInput} />
              <label style={estiloLabel}>Categoría Principal</label>
              <input type="text" value={nuevoProveedor.categoria_principal} onChange={(e) => setNuevoProveedor({...nuevoProveedor, categoria_principal: e.target.value})} style={estiloInput} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Proveedor</button>
                <button type="button" onClick={() => setModalProveedorAbierto(false)} style={{ padding: '10px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA ORDEN DE COMPRA */}
      {modalOrdenAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', color: '#000', borderRadius: '8px', width: '100%', maxWidth: '450px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>📦 Generar Orden de Compra</h3>
            <form onSubmit={guardarNuevaOrden} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={estiloLabel}>Seleccionar Proveedor</label>
              <select required value={nuevaOrden.proveedor_id} onChange={(e) => setNuevaOrden({...nuevaOrden, proveedor_id: e.target.value})} style={estiloInput}>
                <option value="">-- Elige un proveedor --</option>
                {listaProveedores.map(p => <option key={p.id} value={p.id}>{p.nombre_empresa}</option>)}
              </select>

              <label style={estiloLabel}>Total Estimado ($)</label>
              <input type="number" step="0.01" required value={nuevaOrden.total_estimado} onChange={(e) => setNuevaOrden({...nuevaOrden, total_estimado: e.target.value})} placeholder="0.00" style={estiloInput} />

              <label style={estiloLabel}>Detalles / Artículos solicitados</label>
              <textarea required value={nuevaOrden.detalles_items} onChange={(e) => setNuevaOrden({...nuevaOrden, detalles_items: e.target.value})} placeholder="Ej. 10 galones de pintura, 5 sacos de cemento..." style={{ ...estiloInput, minHeight: '80px' }} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Emitir Orden</button>
                <button type="button" onClick={() => setModalOrdenAbierto(false)} style={{ padding: '10px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO CRÉDITO */}
      {modalCreditoAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', color: '#000', borderRadius: '8px', width: '100%', maxWidth: '450px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>➕ Nueva Cuenta Fiada</h3>
            <form onSubmit={guardarNuevoCredito} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={estiloLabel}>Nombre del Cliente</label>
              <input type="text" required value={nuevoCredito.nombre_cliente} onChange={(e) => setNuevoCredito({...nuevoCredito, nombre_cliente: e.target.value})} style={estiloInput} />
              <label style={estiloLabel}>Cédula / RUC</label>
              <input type="text" required value={nuevoCredito.cedula} onChange={(e) => setNuevoCredito({...nuevoCredito, cedula: e.target.value})} style={estiloInput} />
              <label style={estiloLabel}>Teléfono</label>
              <input type="text" value={nuevoCredito.telefono} onChange={(e) => setNuevoCredito({...nuevoCredito, telefono: e.target.value})} style={estiloInput} />
              <label style={estiloLabel}>Límite de Crédito ($)</label>
              <input type="number" step="0.01" required value={nuevoCredito.limite_credito} onChange={(e) => setNuevoCredito({...nuevoCredito, limite_credito: parseFloat(e.target.value)})} style={estiloInput} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                <button type="button" onClick={() => setModalCreditoAbierto(false)} style={{ padding: '10px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ABONO */}
      {modalAbonoAbierto && cuentaSeleccionada && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', color: '#000', borderRadius: '8px', width: '100%', maxWidth: '400px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>💵 Registrar Abono a Cuenta</h3>
            <p style={{ fontSize: '13px', color: '#555', margin: '0 0 15px 0' }}>
              Cliente: <strong>{cuentaSeleccionada.nombre_cliente}</strong><br/>
              Saldo Pendiente: <strong style={{color: '#c62828'}}>${parseFloat(cuentaSeleccionada.saldo_actual).toFixed(2)}</strong>
            </p>
            <form onSubmit={procesarAbono} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={estiloLabel}>Monto a Abonar ($)</label>
              <input type="number" step="0.01" required value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} placeholder="0.00" style={estiloInput} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar Abono</button>
                <button type="button" onClick={() => setModalAbonoAbierto(false)} style={{ padding: '10px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RECIBO (FORMATO TICKET TÉRMICO 80mm) */}
      {modalImprimirAbierto && ultimaVentaPOS && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <style>{`
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body { margin: 0; padding: 0; background: #fff; }
              body * { visibility: hidden; }
              #zona-ticket, #zona-ticket * { visibility: visible; }
              #zona-ticket { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 72mm; /* Dejamos un margen para la impresora de 80mm */
                padding: 4mm;
                margin: 0 auto; 
                font-family: 'Courier New', Courier, monospace; 
                font-size: 12px; 
                color: #000;
                background: white;
              }
              /* Ocultar botones al imprimir */
              .no-imprimir-ticket { display: none !important; }
            }
          `}</style>
          
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%', maxWidth: '380px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* AREA DEL TICKET */}
            <div id="zona-ticket" style={{ padding: '20px', flex: 1, overflowY: 'auto', fontFamily: "'Courier New', Courier, monospace", fontSize: '13px', color: '#000', backgroundColor: '#fff' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: 'bold' }}>FERRETERÍA L E</h2>
                <p style={{ margin: '2px 0', fontSize: '12px' }}>RUC: 0992837465001</p>
                <p style={{ margin: '2px 0', fontSize: '12px' }}>Batallón del Suburbio - Guayaquil</p>
                <p style={{ margin: '2px 0', fontSize: '12px' }}>Tel: 0987654321</p>
              </div>

              <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

              <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                <p style={{ margin: '2px 0' }}><strong>Fecha:</strong> {ultimaVentaPOS.fecha}</p>
                <p style={{ margin: '2px 0' }}><strong>Cliente:</strong> {ultimaVentaPOS.cliente}</p>
                <p style={{ margin: '2px 0' }}><strong>C.I/RUC:</strong> {ultimaVentaPOS.cedula}</p>
                <p style={{ margin: '2px 0' }}><strong>Pago:</strong> {ultimaVentaPOS.metodo}</p>
              </div>

              <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

              <table style={{ width: '100%', textAlign: 'left', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', width: '15%' }}>Cant</th>
                    <th style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', width: '60%' }}>Descripción</th>
                    <th style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', textAlign: 'right', width: '25%' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimaVentaPOS.items.map((it, idx) => (
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

              <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', margin: '10px 0' }}>
                <span>TOTAL:</span>
                <span>${ultimaVentaPOS.total.toFixed(2)}</span>
              </div>

              <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

              <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '15px' }}>
                <p style={{ margin: '2px 0' }}>¡Gracias por su compra!</p>
                <p style={{ margin: '2px 0' }}>Revise su mercadería antes de salir.</p>
                <p style={{ margin: '2px 0' }}>* Documento sin validez tributaria *</p>
              </div>

            </div>

            {/* BOTONES (No se imprimen) */}
            <div className="no-imprimir-ticket" style={{ display: 'flex', gap: '10px', padding: '15px', backgroundColor: '#f0f0f0', borderTop: '1px solid #ccc' }}>
              <button onClick={() => setModalImprimirAbierto(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', border: '1px solid #aaa', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar</button>
              <button onClick={imprimirRecibo} style={{ flex: 2, padding: '10px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Imprimir Ticket</button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DASHBOARD REPORTES */}
      {detalleDashboard && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#101e2e', color: '#fff', borderRadius: '8px', width: '100%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid #1a2f44', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #1a2f44', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#fcee21', fontSize: '18px' }}>
                {detalleDashboard === 'agotados' && '⚠️ Reporte de Productos Agotados'}
                {detalleDashboard === 'criticos' && '📦 Sugerencia de Reabastecimiento (Stock Crítico)'}
                {detalleDashboard === 'activos' && '🛠️ Reporte de Productos Activos'}
                {detalleDashboard === 'pedidos' && '📦 Historial Rápido de Pedidos'}
                {detalleDashboard === 'ventas_diarias' && '📅 Reporte de Ventas Diarias'}
              </h2>
              <button onClick={() => setDetalleDashboard(null)} style={{ background: 'none', border: 'none', color: '#8da2b5', fontSize: '24px', cursor: 'pointer' }}>✖</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: detalleDashboard === 'ventas_diarias' ? '20px' : '0' }}>
              {detalleDashboard === 'ventas_diarias' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <label style={{ color: '#8da2b5', fontWeight: 'bold' }}>Selecciona el día:</label>
                    <input type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #1a2f44', backgroundColor: '#0b1622', color: '#fff', outline: 'none' }} />
                  </div>
                  <div style={{ backgroundColor: '#0b1622', padding: '20px', borderRadius: '6px', border: '1px solid #1a2f44', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#8da2b5', fontSize: '16px' }}>Total Recaudado el {fechaFiltro}:</span>
                    <span style={{ color: '#4caf50', fontSize: '28px', fontWeight: 'bold' }}>${totalFiltradoPorFecha.toFixed(2)}</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#0b1622' }}>
                      <tr><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>ID</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Cliente</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Método</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Total</th></tr>
                    </thead>
                    <tbody>
                      {pedidosFiltradosPorFecha.length > 0 ? pedidosFiltradosPorFecha.map(ped => (
                        <tr key={ped.id} style={{ borderBottom: '1px solid #1a2f44' }}>
                          <td style={{ padding: '12px 20px', color: '#8da2b5' }}>#{ped.id}</td>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{ped.nombre_cliente}</td>
                          <td style={{ padding: '12px 20px', color: '#8da2b5' }}>{ped.metodo_pago}</td>
                          <td style={{ padding: '12px 20px', color: '#4caf50', fontWeight: 'bold' }}>${parseFloat(ped.total_pagado).toFixed(2)}</td>
                        </tr>
                      )) : <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#8da2b5', fontStyle: 'italic' }}>No hay ventas registradas en esta fecha.</td></tr>}
                    </tbody>
                  </table>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#0b1622' }}>
                    {detalleDashboard === 'criticos' ? (
                      <tr><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>SKU</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Producto</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Stock Actual</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Sugerencia Proveedor</th></tr>
                    ) : detalleDashboard !== 'pedidos' ? (
                      <tr><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>SKU</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Producto</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Precio</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Stock Actual</th></tr>
                    ) : (
                      <tr><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>ID</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Cliente</th><th style={{ padding: '12px 20px', color: '#8da2b5', borderBottom: '1px solid #1a2f44' }}>Total</th></tr>
                    )}
                  </thead>
                  <tbody>
                    {detalleDashboard === 'criticos' && productosCriticos.map(p => {
                      const sugerenciaPedido = Math.max(10, (p.ventas || 0) * 2 - p.stock);
                      return (
                        <tr key={p.sku} style={{ borderBottom: '1px solid #1a2f44' }}>
                          <td style={{ padding: '12px 20px', color: '#8da2b5' }}>{p.sku}</td>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{p.nombre}</td>
                          <td style={{ padding: '12px 20px', color: '#fbc02d', fontWeight: 'bold' }}>{p.stock} un.</td>
                          <td style={{ padding: '12px 20px', color: '#4caf50', fontWeight: 'bold' }}>🛒 Pedir +{sugerenciaPedido} un.</td>
                        </tr>
                      );
                    })}
                    {detalleDashboard === 'agotados' && productosAgotados.map(p => (<tr key={p.sku} style={{ borderBottom: '1px solid #1a2f44' }}><td style={{ padding: '12px 20px', color: '#8da2b5' }}>{p.sku}</td><td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{p.nombre}</td><td style={{ padding: '12px 20px' }}>${parseFloat(p.precio_venta).toFixed(2)}</td><td style={{ padding: '12px 20px', color: '#ff4b4b', fontWeight: 'bold' }}>0</td></tr>))}
                    {detalleDashboard === 'activos' && productosActivos.map(p => (<tr key={p.sku} style={{ borderBottom: '1px solid #1a2f44' }}><td style={{ padding: '12px 20px', color: '#8da2b5' }}>{p.sku}</td><td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{p.nombre}</td><td style={{ padding: '12px 20px' }}>${parseFloat(p.precio_venta).toFixed(2)}</td><td style={{ padding: '12px 20px', color: '#4caf50', fontWeight: 'bold' }}>{p.stock}</td></tr>))}
                    {detalleDashboard === 'pedidos' && listaPedidos.map(ped => (<tr key={ped.id} style={{ borderBottom: '1px solid #1a2f44' }}><td style={{ padding: '12px 20px', color: '#8da2b5' }}>#{ped.id}</td><td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{ped.nombre_cliente}</td><td style={{ padding: '12px 20px', color: '#4caf50' }}>${parseFloat(ped.total_pagado).toFixed(2)}</td></tr>))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid #1a2f44', textAlign: 'right' }}>
              <button onClick={() => setDetalleDashboard(null)} style={{ backgroundColor: '#2196f3', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Reporte</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminPanel;