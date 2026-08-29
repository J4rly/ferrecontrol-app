import React, { useState } from 'react';

function Header({ 
  irAInicio, 
  busqueda, 
  setBusqueda, 
  setCategoriaActiva, 
  setOfertaActiva,
  usuarioLogueado, 
  cerrarSesion, 
  setModalAuthAbierto, 
  setModalAdminAbierto, 
  carrito, 
  seleccionarCategoria, 
  seleccionarOferta, 
  departamentos 
}) {
  // Mudamos este estado aquí, porque solo le sirve al encabezado
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 999 }}>
      
      {/* HEADER PRINCIPAL (BARRA AMARILLA) */}
      <div style={{ backgroundColor: '#fcee21', padding: '15px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', borderBottom: '5px solid #000' }}>
        <img src="/logo.jpeg" alt="Logo Ferretería L E" onClick={irAInicio} style={{ height: '75px', maxWidth: '300px', objectFit: 'contain', cursor: 'pointer' }} />
        
        <div style={{ flex: 1, maxWidth: '800px', display: 'flex' }}>
          <input 
            type="text" 
            placeholder="Busca productos, marcas y más..." 
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              if(e.target.value !== '') {
                setCategoriaActiva('Todas las categorías')
                setOfertaActiva(null)
              }
            }}
            style={{ width: '100%', padding: '14px 20px', borderRadius: '4px 0 0 4px', border: '2px solid #000', outline: 'none', fontSize: '15px', backgroundColor: '#fff' }} 
          />
          <button style={{ backgroundColor: '#000', color: '#fcee21', border: '2px solid #000', borderLeft: 'none', padding: '0 25px', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>🔍</button>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {usuarioLogueado ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>Hola, {usuarioLogueado.nombre_completo.split(' ')[0]}</span>
              <button onClick={cerrarSesion} style={{ background: '#000', color: '#fcee21', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Salir</button>
            </div>
          ) : (
            <button onClick={() => setModalAuthAbierto(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>👤 Acceder / Registrarse</button>
          )}

          <button onClick={() => setModalAdminAbierto(true)} style={{ background: '#000', color: '#fcee21', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>⚙️ Admin</button>

          <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#000', padding: '10px 20px', borderRadius: '4px', color: '#fcee21', fontWeight: 'bold' }}>
            <span style={{ fontSize: '18px' }}>🛒</span> Carrito
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#cc0000', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{carrito.length}</span>
          </div>
        </div>
      </div>

      {/* NAVBAR (BARRA NEGRA) */}
      <div style={{ backgroundColor: '#000', padding: '0 5%', display: 'flex', gap: '30px', fontSize: '14px', alignItems: 'center', color: '#fcee21', borderBottom: '3px solid #fcee21' }}>
        <div onMouseEnter={() => setMenuAbierto(true)} onMouseLeave={() => setMenuAbierto(false)} style={{ position: 'relative' }}>
          <div style={{ backgroundColor: '#fcee21', color: '#000', padding: '12px 20px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>☰</span> Categorías
          </div>
          {menuAbierto && (
            <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: '#fff', color: '#333', width: '280px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)', zIndex: 10, borderRadius: '0 0 8px 8px', overflow: 'hidden', border: '2px solid #000' }}>
              <div onClick={() => { seleccionarCategoria('Todas las categorías'); setMenuAbierto(false); }} style={{ padding: '12px 20px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{display: 'flex', gap: '15px', alignItems: 'center'}}><span>📋</span> Todas las categorías</span><span style={{ color: '#ccc' }}>&gt;</span>
              </div>
              {departamentos.map((cat) => (
                <div key={cat.id} onClick={() => { seleccionarCategoria(cat.nombre); setMenuAbierto(false); }} style={{ padding: '12px 20px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{display: 'flex', gap: '15px', alignItems: 'center'}}><span style={{ fontSize: '18px' }}>{cat.icono}</span> {cat.nombre}</span><span style={{ color: '#ccc' }}>&gt;</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <span onClick={() => seleccionarOferta('Todas las ofertas')} style={{ cursor: 'pointer', fontWeight: 'bold' }}>Ofertas</span>
        <span onClick={() => seleccionarOferta('Oferta Especial')} style={{ cursor: 'pointer', fontWeight: 'bold' }}>2x1</span>
        <span onClick={() => seleccionarCategoria('Todas las categorías')} style={{ cursor: 'pointer', color: '#fff' }}>Los favoritos</span>
      </div>
      
    </div>
  );
}

export default Header;