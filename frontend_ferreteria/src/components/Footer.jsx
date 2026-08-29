import React from 'react';

// Recibimos las funciones que necesita el Footer entre las llaves { }
function Footer({ irAInicio, seleccionarCategoria, setModalAdminAbierto }) {
  return (
    <footer style={{ backgroundColor: '#000', color: '#fff', padding: '40px 5%', borderTop: '2px solid #222' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ flex: '1', minWidth: '250px' }}>
          <img src="/logo.jpeg" alt="Logo Ferretería L E" onClick={irAInicio} style={{ height: '60px', maxWidth: '220px', objectFit: 'contain', marginBottom: '15px', cursor: 'pointer' }} />
          <p style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
            Más de 50,000 productos en herramientas, construcción, plomería y más. Los mejores precios con entrega a domicilio en Guayaquil.
          </p>
        </div>

        <div style={{ flex: '1', minWidth: '160px' }}>
          <h4 style={{ color: '#fcee21', fontSize: '16px', marginBottom: '15px', borderBottom: '2px solid #fcee21', paddingBottom: '8px', display: 'inline-block' }}>Categorías</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', fontSize: '13px', lineHeight: '2' }}>
            <li style={{ cursor: 'pointer' }} onClick={() => seleccionarCategoria('Herramientas')}>Herramientas</li>
            <li style={{ cursor: 'pointer' }} onClick={() => seleccionarCategoria('Construcción')}>Construcción</li>
            <li style={{ cursor: 'pointer' }} onClick={() => seleccionarCategoria('Electricidad')}>Electricidad</li>
            <li style={{ cursor: 'pointer' }} onClick={() => seleccionarCategoria('Plomería')}>Plomería</li>
            <li style={{ cursor: 'pointer' }} onClick={() => seleccionarCategoria('Pintura')}>Pintura</li>
            <li style={{ cursor: 'pointer' }} onClick={() => seleccionarCategoria('Automotriz')}>Automotriz</li>
          </ul>
        </div>

        <div style={{ flex: '1', minWidth: '160px' }}>
          <h4 style={{ color: '#fcee21', fontSize: '16px', marginBottom: '15px', borderBottom: '2px solid #fcee21', paddingBottom: '8px', display: 'inline-block' }}>Mi Cuenta</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', fontSize: '13px', lineHeight: '2' }}>
            <li style={{ cursor: 'pointer' }} onClick={() => setModalAdminAbierto(true)}>Panel de Admin</li>
            <li style={{ cursor: 'pointer' }}>Mis Compras</li>
            <li style={{ cursor: 'pointer' }}>Mis Favoritos</li>
          </ul>
        </div>

        <div style={{ flex: '1', minWidth: '160px' }}>
          <h4 style={{ color: '#fcee21', fontSize: '16px', marginBottom: '15px', borderBottom: '2px solid #fcee21', paddingBottom: '8px', display: 'inline-block' }}>Ayuda</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', fontSize: '13px', lineHeight: '2' }}>
            <li style={{ cursor: 'pointer' }}>Centro de Ayuda</li>
            <li style={{ cursor: 'pointer' }}>Políticas de Envío</li>
            <li style={{ cursor: 'pointer' }}>Contáctanos</li>
          </ul>
        </div>

      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid #222', marginTop: '30px', paddingTop: '20px', color: '#666', fontSize: '12px' }}>
        © 2026 Ferretería L E. Todos los derechos reservados. Desarrollado en Guayaquil, Ecuador.
      </div>
    </footer>
  );
}

export default Footer;