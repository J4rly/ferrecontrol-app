import React, { useState } from 'react';

export default function Header({ 
  irAInicio, 
  busqueda, 
  setBusqueda, 
  setCategoriaActiva, 
  setOfertaActiva, 
  usuarioLogueado, 
  cerrarSesion, 
  setModalAuthAbierto, 
  setModalAdminAbierto, 
  setModalCuentaAbierto,
  setModalComprasAbierto,
  carrito, 
  seleccionarCategoria, 
  seleccionarOferta, 
  seleccionarFavoritos, 
  departamentos 
}) {
  const [mostrarMenuCategorias, setMostrarMenuCategorias] = useState(false);
  const totalItemsCarrito = carrito.reduce((t, item) => t + item.cantidad, 0);

  return (
    <header style={{ backgroundColor: '#fcee21', borderBottom: '4px solid #000', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 5%', flexWrap: 'wrap', gap: '15px' }}>
        
        {/* LOGO REAL EN FORMATO JPEG (Doble clic abre el panel admin en secreto) */}
        <div 
          onClick={irAInicio} 
          onDoubleClick={() => setModalAdminAbierto(true)}
          title="Ferretería L E"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img 
            src="/logo.jpeg" 
            alt="Ferretería L E" 
            style={{ height: '55px', objectFit: 'contain', backgroundColor: '#fcee21', padding: '2px', borderRadius: '4px' }} 
          />
        </div>

        {/* BUSCADOR */}
        <div style={{ display: 'flex', flex: '1', maxWidth: '500px', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Busca productos, marcas..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: '100%', padding: '12px 15px', borderRadius: '4px 0 0 4px', border: '2px solid #000', borderRight: 'none', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ backgroundColor: '#000', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 4px 4px 0', border: '2px solid #000', cursor: 'pointer' }}>
            <span style={{ fontSize: '18px' }}>🔍</span>
          </div>
        </div>

        {/* CONTROLES DE USUARIO Y CARRITO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {usuarioLogueado ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', padding: '6px 10px', borderRadius: '4px', border: '2px solid #000' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>👤 {usuarioLogueado.nombre_completo.split(' ')[0]}</span>
              
              {/* Botón para ver Mis Compras */}
              <button 
                onClick={() => setModalComprasAbierto(true)}
                title="Historial de Compras"
                style={{ background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', fontSize: '12px' }}
              >
                🛍️
              </button>

              {/* Botón de Configuración */}
              <button 
                onClick={() => setModalCuentaAbierto(true)}
                title="Configurar Cuenta"
                style={{ background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', fontSize: '12px' }}
              >
                ⚙️
              </button>

              <button onClick={cerrarSesion} style={{ background: 'none', border: 'none', color: '#cc0000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', marginLeft: '2px' }}>Salir</button>
            </div>
          ) : (
            <button 
              onClick={() => setModalAuthAbierto(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#000', border: '2px solid #000', padding: '10px 18px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              👤 Acceder / Registrarse
            </button>
          )}

          <div 
            onClick={() => {
              const resumen = document.getElementById('resumen-compra-movil');
              if(resumen) resumen.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#000', color: '#fcee21', border: '2px solid #000', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', position: 'relative' }}
          >
            <span>🛒</span> Carrito
            {totalItemsCarrito > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#cc0000', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '2px solid #fff' }}>
                {totalItemsCarrito}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* MENÚ INFERIOR DE CATEGORÍAS */}
      <div style={{ backgroundColor: '#000', color: '#fff', padding: '10px 5%', display: 'flex', alignItems: 'center', gap: '30px', position: 'relative', fontSize: '14px', fontWeight: 'bold' }}>
        <div 
          onClick={() => setMostrarMenuCategorias(!mostrarMenuCategorias)}
          style={{ backgroundColor: '#fcee21', color: '#000', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>☰</span> Categorías <span>▾</span>
        </div>

        <div style={{ display: 'flex', gap: '25px', cursor: 'pointer', flexWrap: 'wrap' }}>
          <span onClick={() => seleccionarOferta('Todas las ofertas')} style={{ color: '#fcee21' }}>Ofertas</span>
          <span onClick={() => seleccionarOferta('2x1')} style={{ color: '#ff6b6b' }}>2x1</span>
          <span onClick={seleccionarFavoritos} style={{ color: '#ff80bf' }}>Los favoritos</span>
        </div>

        {/* MENÚ DESPLEGABLE CON SCROLL VERTICAL HABILITADO */}
        {mostrarMenuCategorias && (
          <div style={{ position: 'absolute', top: '100%', left: '5%', backgroundColor: '#fff', color: '#000', borderRadius: '6px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', width: '260px', maxHeight: '350px', overflowY: 'auto', border: '2px solid #000', zIndex: 1100, padding: '10px 0' }}>
            {departamentos.map(dep => (
              <div 
                key={dep.id} 
                onClick={() => { seleccionarCategoria(dep.nombre); setMostrarMenuCategorias(false); }}
                style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderBottom: '1px solid #f0f0f0' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f4f4f4'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}
              >
                <span>{dep.icono}</span> {dep.nombre}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}