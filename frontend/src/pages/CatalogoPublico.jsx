import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import watermarkLogo from '../assets/hero.png' 

function CatalogoPublico() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [config, setConfig] = useState({ facebook: '', instagram: '', tiktok: '', whatsapp: '50497432867' })
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [productosDestacados, setProductosDestacados] = useState([])
  const [loading, setLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        
        // Paso 1: Cargar categorías y productos (lo esencial)
        // Usamos peticiones separadas o manejamos errores individuales para que uno no bloquee al otro
        const [catRes, prodRes] = await Promise.all([
          api.get('/categorias').catch(err => ({ data: [] })),
          api.get('/productos').catch(err => ({ data: [] }))
        ]);
        
        setCategorias(catRes.data);
        setProductos(prodRes.data);

        // Paso 2: Cargar configuración (opcional)
        // Si falla, el catálogo seguirá funcionando con los valores por defecto del useState
        try {
          const configRes = await api.get('/configuracion');
          if (configRes.data) setConfig(configRes.data);
        } catch (configErr) {
          console.warn("Aviso: No se pudo cargar la configuración, usando valores por defecto.");
        }

        // Paso 3: Lógica de destacados
        if (prodRes.data.length > 0) {
          const destacadosBase = prodRes.data.filter(p => p.destacado).length > 0 
            ? prodRes.data.filter(p => p.destacado)
            : [...prodRes.data].sort(() => 0.5 - Math.random()).slice(0, 6);
          
          setProductosDestacados([...destacadosBase, ...destacadosBase, ...destacadosBase]); 
        }
      } catch (err) {
        console.error("Error crítico en la carga de datos:", err);
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
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        .animate-infinite-scroll { display: flex; width: max-content; animation: scroll 40s linear infinite; }
        .animate-infinite-scroll:hover { animation-play-state: paused; }
      `}} />

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
        {productosDestacados.length > 0 && !searchTerm && !categoriaActiva && (
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

        {/* SELECTOR DE CATEGORÍAS */}
        <div className="mb-12 flex flex-col items-center">
          <label className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-3 bg-rose-600/10 px-4 py-1 rounded-full">Explorar Categorías</label>
          <div className="relative w-full max-w-sm">
            <select
              onChange={(e) => {
                const selected = categorias.find(c => c.id === Number(e.target.value));
                setCategoriaActiva(selected || null);
              }}
              value={categoriaActiva?.id || ""}
              className={`w-full appearance-none px-6 py-4 rounded-2xl font-black uppercase text-sm border-2 outline-none transition-all cursor-pointer ${darkMode ? 'bg-zinc-900 border-white/5 text-white focus:border-rose-600 shadow-xl shadow-black/40' : 'bg-white border-gray-200 text-zinc-900 focus:border-rose-600 shadow-lg'}`}
            >
              <option value="">🏁 MOSTRAR TODO EL INVENTARIO</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        {productosFiltrados.length > 0 ? (
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
                     <a href={`https://wa.me/${config.whatsapp}?text=Hola Inversiones Rubi, solicito información de: *${p.nombre}*`} 
                        target="_blank" rel="noopener noreferrer" 
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 active:scale-95">
                        CONSULTAR PRECIO
                     </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-50">
            <p className="font-bold uppercase tracking-widest">No se encontraron productos en esta sección.</p>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-20 py-12 border-t border-white/5 flex flex-col items-center">
            <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-500 mb-8">Síguenos en nuestras redes</h3>
            <div className="flex gap-8 items-center">
                {config.facebook && (
                  <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 hover:border-blue-600 hover:text-blue-600 transition-all">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                  </a>
                )}
                {config.instagram && (
                  <a href={config.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 hover:border-pink-500 hover:text-pink-500 transition-all">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                {config.tiktok && (
                  <a href={config.tiktok} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 hover:border-cyan-400 hover:text-cyan-400 transition-all">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.47-.88-.64-1.61-1.47-2.11-2.43v10.3c0 5.17-4.22 9.38-9.39 9.38S1.44 21.6 1.44 16.42s4.22-9.38 9.39-9.38c.63 0 1.26.06 1.88.19v4.1c-1.85-.56-3.89-.04-5.26 1.32-1.37 1.36-1.83 3.44-1.18 5.25.64 1.81 2.37 3 4.29 3 2.58 0 4.67-2.09 4.67-4.67V.02z"/></svg>
                  </a>
                )}
            </div>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-10 italic">© 2026 Inversiones Rubi - Calidad y Confianza</p>
        </footer>
      </main>

      {/* BOTÓN VOLVER ARRIBA */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-4 bg-rose-600 text-white rounded-full shadow-2xl hover:bg-rose-700 transition-all z-50 animate-bounce"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7"></path></svg>
        </button>
      )}
    </div>
  )
}

export default CatalogoPublico