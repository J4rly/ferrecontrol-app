import React from 'react';

function SeccionInicio({ departamentos, seleccionarCategoria, seleccionarOferta }) {
  return (
    <>
      {/* --- HERO BANNER CON PANEL.JPG EN FORMATO VERTICAL --- */}
      <div style={{ width: '100%', backgroundColor: '#fff', borderBottom: '3px solid #fcee21', padding: '40px 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <img src="/panel.jpg" alt="Marcas Aliadas" style={{ width: '100%', maxWidth: '900px', objectFit: 'contain', marginBottom: '30px' }} />
        
        <h2 style={{ fontSize: '42px', margin: '0 0 15px 0', color: '#000', fontWeight: '900', lineHeight: '1.1' }}>
          El mayor surtido ferretero
        </h2>
        <p style={{ fontSize: '20px', margin: '0 0 25px 0', color: '#555', maxWidth: '800px', lineHeight: '1.5' }}>
          Encuentra todo lo que necesitas para tu proyecto en Guayaquil, con el respaldo de las mejores marcas del mercado.
        </p>
        <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} style={{ padding: '15px 30px', backgroundColor: '#000', color: '#fcee21', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Explorar Productos
        </button>
      </div>

      {/* --- CATEGORÍAS VISUALES CIRCULARES --- */}
      <div style={{ backgroundColor: '#fff', padding: '40px 5%', borderBottom: '2px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Categorías</h2>
          <span onClick={() => seleccionarCategoria('Todas las categorías')} style={{ color: '#0066cc', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Ver todos</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '20px', textAlign: 'center' }}>
          {departamentos.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => seleccionarCategoria(cat.nombre)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', border: '2px solid #f2f2f2' }}>
                {cat.icono}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#333' }}>{cat.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- SECCIÓN DE OFERTAS EXCLUSIVAS --- */}
      <div style={{ backgroundColor: '#000', padding: '30px 5%', color: '#fff', borderBottom: '3px solid #fcee21' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#fcee21' }}>Descubre nuestras ofertas exclusivas</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>Productos seleccionados con descuentos especiales por tiempo limitado</p>
          </div>
          <button onClick={() => seleccionarOferta('Todas las ofertas')} style={{ backgroundColor: '#fcee21', color: '#000', border: 'none', padding: '12px 25px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
            Ver todas las ofertas
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: '#fcee21', padding: '25px', borderRadius: '12px', color: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: 'rgba(0,0,0,0.1)', padding: '3px 8px', borderRadius: '4px' }}>Oferta Especial</span>
              <h3 style={{ fontSize: '22px', margin: '12px 0 0 0', fontWeight: 'bold' }}>Lleva doble por el precio de uno</h3>
            </div>
            <button onClick={() => seleccionarOferta('Oferta Especial')} style={{ alignSelf: 'flex-start', backgroundColor: '#000', color: '#fcee21', border: 'none', padding: '8px 18px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '15px' }}>Ver ofertas ➔</button>
          </div>

          <div style={{ backgroundColor: '#222', padding: '25px', borderRadius: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px', border: '1px solid #444' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: '#fcee21', color: '#000', padding: '3px 8px', borderRadius: '4px' }}>Descuento Masivo</span>
              <h3 style={{ fontSize: '22px', margin: '12px 0 0 0', fontWeight: 'bold' }}>Hasta 50% OFF en miles de artículos</h3>
            </div>
            <button onClick={() => seleccionarOferta('Descuento Masivo')} style={{ alignSelf: 'flex-start', backgroundColor: '#fcee21', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '15px' }}>Ver ofertas ➔</button>
          </div>

          <div style={{ backgroundColor: '#333', padding: '25px', borderRadius: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px', border: '1px solid #555' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: '#fff', color: '#000', padding: '3px 8px', borderRadius: '4px' }}>Temporada</span>
              <h3 style={{ fontSize: '22px', margin: '12px 0 0 0', fontWeight: 'bold' }}>Todo lo que necesitas para tu obra</h3>
            </div>
            <button onClick={() => seleccionarOferta('Temporada')} style={{ alignSelf: 'flex-start', backgroundColor: '#fcee21', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '15px' }}>Explorar ➔</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SeccionInicio;