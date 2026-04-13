import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import watermarkLogo from '../assets/hero.png' 

function CatalogoPublico() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [productosDestacados, setProductosDestacados] = useState([])
  const [loading, setLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  
  // Número de WhatsApp actualizado según tu solicitud
  const numeroWhatsApp = '50497432867' 

  // Control del botón "Volver Arriba" al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        const destacadosBase = prodRes.data.filter(p => p.destacado).length > 0 
          ? prodRes.data.filter(p => p.destacado)
          : [...prodRes.data].sort(() => 0.5 - Math.random()).slice(0, 6);
        
        // Triple carga para asegurar que el carrusel infinito no tenga cortes
        setProductosDestacados([...destacadosBase, ...destacadosBase, ...destacadosBase]); 
      } catch (err) {
        console.error("Error al conectar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  const productosFiltrados = useMemo(() => productos.filter(producto => {
    const matchCategory = !categoriaActiva || Number(producto.categoria_id) === Number(categoriaActiva.id)
    const term = searchTerm.toLowerCase()
    return matchCategory && (producto.nombre.toLowerCase().includes(term) || (producto.descripcion?.toLowerCase().includes(term)))
  }), [productos, categoriaActiva, searchTerm])

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-rose-600 font-black tracking-widest animate-pulse uppercase italic">Inversiones Rubi</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${darkMode ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-zinc-900'}`}>
      
      {/* ESTILOS INTERNOS: CARRUSEL Y ANIMACIONES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-infinite-scroll {
          display: flex;
          width: max-content;
          animation: scroll 40s linear infinite;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />

      {/* MARCA DE AGUA */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
        <img src={watermarkLogo} className="w-[80%] max-w-2xl rotate-12" alt="" />
      </div>

      <header className={`sticky top-0 z-50 py-5 px-4 backdrop-blur-md ${darkMode ? 'bg-zinc-950/80 border-b border-white/5' : 'bg-white/80 border-b border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 text-rose-600">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25l-9 4.5 3 10.5 6 4.5 6-4.5 3-10.5-9-4.5z" /></svg>
              </div>
              <div>
                <span className={`text-[10px] font-bold tracking-[0.3em] uppercase block ${darkMode ? 'text-gray-400' : 'text-rose-900'}`}>Inversiones</span>
                <h1 className="text-3xl font-black leading-none italic">Rubi</h1>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 px-4 rounded-xl font-bold text-xs transition-all border ${darkMode ? 'bg-zinc-800 text-zinc-300 border-white/10' : 'bg-white text-rose-600 border-rose-200 shadow-sm'}`}>
              {darkMode ? '🌙 OSCURO' : '☀️ CLARO'}
            </button>
          </div>
          <input
            type="text"
            placeholder="🔍 ¿Qué estás buscando hoy?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-6 py-4 rounded-2xl outline-none text-base border-2 transition-all ${darkMode ? 'bg-zinc-900 border-white/5 focus:border-rose-600' : 'bg-white border-zinc-100 focus:border-rose-600 shadow-sm'}`}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        
        {/* CARRUSEL DE DESTACADOS */}
        {!searchTerm && !categoriaActiva && (
          <section className="mb-12 overflow-hidden">
             <h2 className="text-xs font-black tracking-widest uppercase mb-6 text-rose-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                Destacados de la semana
             </h2>
             <div className="relative w-full">
                <div className="animate-infinite-scroll gap-6">
                  {productosDestacados.map((p, idx) => (
                    <div key={`${p.id}-${idx}`} className={`flex-shrink-0 w-80 p-4 rounded-2xl border transition-all ${darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                           <img src={p.imagen_url} className="w-full h-full object-contain" alt={p.nombre} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black uppercase truncate">{p.nombre}</h3>
                          <div className="bg-rose-600/10 inline-block px-2 py-1 rounded-lg mt-1">
                             <span className="text-rose-600 font-black text-sm">L {p.precio}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </section>
        )}

        {/* SELECTOR DE CATEGORÍAS TIPO DESPLEGABLE (ACTUALIZADO) */}
        <div className="mb-12 flex flex-col items-center">
          <label className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-3 bg-rose-600/10 px-4 py-1 rounded-full">Explorar Categorías</label>
          <div className="relative w-full max-w-sm">
            <select
              onChange={(e) => {
                const selected = categorias.find(c => c.id === Number(e.target.value));
                setCategoriaActiva(selected || null);
              }}
              value={categoriaActiva?.id || ""}
              className={`w-full appearance-none px-6 py-4 rounded-2xl font-black uppercase text-sm border-2 outline-none transition-all cursor-pointer ${
                darkMode 
                ? 'bg-zinc-900 border-white/5 text-white focus:border-rose-600 shadow-xl shadow-black/40' 
                : 'bg-white border-gray-200 text-zinc-900 focus:border-rose-600 shadow-lg'
              }`}
            >
              <option value="">🏁 MOSTRAR TODO EL INVENTARIO</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-rose-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((p) => (
            <div key={p.id} className={`group flex flex-col h-full rounded-3xl overflow-hidden border transition-all hover:translate-y-[-8px] ${darkMode ? 'bg-zinc-900 border-white/5 hover:border-rose-600/50' : 'bg-white border-zinc-200 hover:border-rose-600/50 shadow-md'}`}>
              <div className="aspect-square relative overflow-hidden bg-white">
                <span className="absolute top-3 right-3 z-10 bg-green-600 text-white text-[10px] px-3 py-1 rounded-full font-black shadow-lg uppercase tracking-tighter">Disponible</span>
                <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-black text-lg uppercase mb-2 leading-tight tracking-tight">{p.nombre}</h3>
                <p className={`text-xs mb-6 line-clamp-2 font-medium leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{p.descripcion}</p>
                <div className="mt-auto">
                   <div className="bg-rose-600/10 p-4 rounded-2xl border-l-4 border-rose-600 mb-5 group-hover:bg-rose-600/20 transition-colors">
                      <p className="text-[10px] font-bold text-rose-600 uppercase mb-1 opacity-70">Precio Catálogo</p>
                      <span className="text-xl font-black text-rose-600">L {p.precio}</span>
                   </div>
                   <a href={`https://wa.me/${numeroWhatsApp}?text=Hola Inversiones Rubi, solicito información de: *${p.nombre}*`} 
                      target="_blank" rel="noopener noreferrer" 
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 active:scale-95">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c1.029.563 2.028.913 3.162.914.004 0 .007 0 .011 0 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.765-5.766-5.765-1.542 0-2.993.6-4.086 1.693-1.092 1.092-1.693 2.544-1.693 4.085 0 1.258.38 2.155.938 3.109l-.53 1.986 2.115-.537c.974.526 1.916.85 2.992.85h.01c2.81 0 5.097-2.287 5.098-5.097 0-2.81-2.287-5.097-5.098-5.097zM20.52 3.449c-2.274-2.273-5.297-3.524-8.513-3.525-6.632 0-12.03 5.398-12.033 12.031 0 2.12.553 4.189 1.601 6.005l-1.703 6.22 6.363-1.669c1.758.959 3.743 1.465 5.763 1.466h.005c6.633 0 12.032-5.398 12.035-12.032.001-3.212-1.249-6.233-3.524-8.508z" /></svg>
                      CONSULTAR PRECIO
                   </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* BOTÓN FLOTANTE VOLVER ARRIBA */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-4 bg-rose-600 text-white rounded-full shadow-2xl hover:bg-rose-700 transition-all z-50 active:scale-90 animate-bounce"
          title="Volver arriba"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7"></path>
          </svg>
        </button>
      )}
    </div>
  )
}

export default CatalogoPublico