import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
// Usamos el logo que tengas en assets para la marca de agua
import watermarkLogo from '../assets/hero.png' 

function CatalogoPublico() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [productosDestacados, setProductosDestacados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Número actualizado de Inversiones Rubi
  const numeroWhatsApp = '50499999999' 

  // 1. CARGA DE DATOS OPTIMIZADA
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categorias'),
          api.get('/productos')
        ]);
        
        setCategorias(catRes.data);
        setProductos(prodRes.data);

        // Seleccionamos destacados y duplicamos el array para el efecto de carrusel infinito
        const destacados = prodRes.data.filter(p => p.destacado).length > 0 
          ? prodRes.data.filter(p => p.destacado)
          : [...prodRes.data].sort(() => 0.5 - Math.random()).slice(0, 6);
        
        setProductosDestacados([...destacados, ...destacados]); // Duplicado para loop infinito
        setError(null);
      } catch (err) {
        console.error("Error al conectar con Render:", err);
        setError("Error de conexión: Verifica que el servidor en Render esté activo.");
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  // 2. FILTRADO INTELIGENTE
  const productosFiltrados = useMemo(() => productos.filter(producto => {
    const matchCategory = !categoriaActiva || Number(producto.categoria_id) === Number(categoriaActiva.id)
    const term = searchTerm.toLowerCase()
    return matchCategory && (producto.nombre.toLowerCase().includes(term) || (producto.descripcion?.toLowerCase().includes(term)))
  }), [productos, categoriaActiva, searchTerm])

  const productosPorCategoria = useMemo(() => categorias.map(categoria => ({
    ...categoria,
    productos: productos.filter(p => Number(p.categoria_id) === Number(categoria.id))
  })), [categorias, productos])

  // PANTALLA DE CARGA CON EL RUBÍ PULSANTE
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-glassblack-theme' : 'bg-light-theme'}`}>
        <div className="loader-rubi mb-8"></div>
        <p className="text-rose-600 font-black tracking-widest animate-pulse font-montserrat uppercase">Inversiones Rubi</p>
        <p className="text-gray-500 text-xs mt-2 uppercase font-bold">Cargando el brillo del rubí...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-glassblack-theme' : 'bg-light-theme'}`}>
      
      {/* 3. MARCA DE AGUA DINÁMICA */}
      <div className="watermark-container">
        <img src={watermarkLogo} className="watermark-logo" alt="watermark" />
      </div>

      <header className={`sticky-header py-5 px-4 ${darkMode ? 'glass-panel' : 'light-panel shadow-md'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 text-rose-600 drop-shadow-[0_0_15px_rgba(225,29,72,0.8)]">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25l-9 4.5 3 10.5 6 4.5 6-4.5 3-10.5-9-4.5z" /></svg>
              </div>
              <div>
                <span className={`text-[10px] font-montserrat font-bold tracking-[0.3em] uppercase block ${darkMode ? 'text-gray-300' : 'text-rose-900'}`}>Inversiones</span>
                <h1 className="text-3xl font-black font-dancing leading-none ruby-title">Rubi</h1>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 px-4 rounded-xl font-bold text-xs transition-all border ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-rose-600 border-rose-200'}`}>
              {darkMode ? '🌙 NOCHE' : '🌟 LUZ'}
            </button>
          </div>
          <input
            type="text"
            placeholder="🔍 Buscar en Rubi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input w-full px-6 py-4 rounded-2xl outline-none text-base"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 4. SECCIÓN DESTACADOS CON CARRUSEL INFINITO */}
        {!searchTerm && !categoriaActiva && (
          <section className="mb-12 overflow-hidden">
             <h2 className="text-xs font-black tracking-widest uppercase mb-4 text-rose-600 font-montserrat">✨ Productos Destacados</h2>
             <div className="relative">
                <div className="carousel-track flex gap-4">
                  {productosDestacados.map((p, idx) => (
                    <div key={`${p.id}-${idx}`} className={`flex-shrink-0 w-72 p-3 rounded-2xl border ${darkMode ? 'glass-panel border-white/10' : 'light-panel border-rose-100'}`}>
                      <div className="flex gap-3 items-center">
                        <img src={p.imagen_url} className="w-16 h-16 rounded-lg object-cover bg-white" alt={p.nombre} />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black uppercase truncate font-montserrat">{p.nombre}</h3>
                          <span className="text-rose-600 font-black text-lg">L {Number(p.precio).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </section>
        )}

        {/* SELECTOR DE CATEGORÍAS */}
        <div className="mb-10 flex justify-center">
          <select
            onChange={(e) => setCategoriaActiva(categorias.find(c => c.id === Number(e.target.value)) || null)}
            className={`px-6 py-3 rounded-xl font-bold uppercase text-sm border outline-none ${darkMode ? 'bg-black text-white border-white/10' : 'bg-white text-slate-800'}`}
          >
            <option value="">🏁 Todas las Categorías</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
          </select>
        </div>

        {/* LISTADO DE PRODUCTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((p) => (
            <div key={p.id} className={`product-card flex flex-col h-full ${darkMode ? 'glass-panel' : 'light-panel'}`}>
              <div className="img-container aspect-square relative">
                <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] px-2 py-1 rounded font-black">DISPONIBLE</span>
                <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-black text-lg uppercase mb-2 font-montserrat">{p.nombre}</h3>
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{p.descripcion}</p>
                <div className="mt-auto">
                   <div className="bg-black/20 p-2 rounded-lg border-l-4 border-rose-600 mb-4">
                      <span className="text-2xl font-black text-rose-600">L {Number(p.precio).toFixed(2)}</span>
                   </div>
                   <a href={`https://wa.me/${numeroWhatsApp}?text=Hola Inversiones Rubi, me interesa: *${p.nombre}*`} 
                      target="_blank" rel="noopener noreferrer" 
                      className="btn-whatsapp w-full py-3 rounded-xl text-white font-black flex items-center justify-center gap-2">
                      💬 LO QUIERO
                   </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default CatalogoPublico