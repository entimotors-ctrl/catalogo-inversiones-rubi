import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
// Importación de los activos
import logo1 from '../assets/logo1.png'
import logo2 from '../assets/logo2.png'
import logowas from '../assets/logowas.png'
// Iconos necesarios
import { FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'

function CatalogoPublico() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [config, setConfig] = useState({ facebook: '', instagram: '', tiktok: '', whatsapp: '' })
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [productosDestacados, setProductosDestacados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categorias').catch(() => ({ data: [] })),
          api.get('/productos').catch(() => ({ data: [] }))
        ]);
        
        setCategorias(catRes.data);
        setProductos(prodRes.data);

        try {
          const configRes = await api.get('/configuracion');
          if (configRes.data) setConfig(configRes.data);
        } catch (configErr) {
          console.warn("Cargando configuración...");
        }

        if (prodRes.data.length > 0) {
          const destacadosBase = prodRes.data.filter(p => p.destacado).length > 0 
            ? prodRes.data.filter(p => p.destacado)
            : [...prodRes.data].sort(() => 0.5 - Math.random()).slice(0, 6);
          
          setProductosDestacados([...destacadosBase, ...destacadosBase, ...destacadosBase]); 
        }
      } catch (err) {
        console.error("Error crítico:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  // Lógica para agrupar productos por categoría cuando no hay filtro activo
  const productosPorCategoria = useMemo(() => {
    if (categoriaActiva || searchTerm) return null;
    
    return categorias.map(cat => ({
      ...cat,
      items: productos.filter(p => Number(p.categoria_id) === Number(cat.id))
    })).filter(cat => cat.items.length > 0);
  }, [categorias, productos, categoriaActiva, searchTerm]);

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

  const darkglassStyle = darkMode 
    ? "bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-2xl"
    : "bg-white/70 backdrop-blur-md border border-zinc-200 shadow-lg";

  // Componente de Tarjeta para evitar repetición
  const ProductoCard = ({ p }) => (
    <div className={`group flex flex-col rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border transition-all duration-300 hover:scale-[1.02] flex-shrink-0 w-[260px] md:w-auto ${darkMode ? 'bg-zinc-900 border-white/5 hover:border-rose-600/30' : 'bg-white border-zinc-200 shadow-md'}`}>
      <div className="aspect-square relative overflow-hidden bg-white p-4 md:p-6">
        <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="p-5 md:p-8 flex flex-col flex-grow">
        <h3 className="font-black text-sm md:text-lg uppercase mb-1 md:mb-2 tracking-tight line-clamp-1">{p.nombre}</h3>
        <p className={`text-[10px] md:text-xs mb-4 md:mb-6 line-clamp-2 opacity-60 leading-relaxed font-medium`}>{p.descripcion}</p>
        <div className="mt-auto">
           <div className="bg-rose-600/10 p-2 md:p-4 rounded-xl md:rounded-2xl border-l-4 border-rose-600 mb-4 md:mb-6">
              <span className="text-base md:text-xl font-black text-rose-600">L {p.precio}</span>
           </div>
           <a href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=Hola Inversiones Rubi, consulto por: *${p.nombre}*`} 
              target="_blank" rel="noopener noreferrer" 
              className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-[10px] uppercase tracking-widest">
              <FaWhatsapp size={14} /> CONSULTAR
           </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden relative ${darkMode ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-zinc-900'}`}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        .animate-infinite-scroll { display: flex; width: max-content; animation: scroll 40s linear infinite; }
        .animate-infinite-scroll:hover { animation-play-state: paused; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* 1. LOGO2 DE FONDO */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.09] flex items-center justify-center overflow-hidden z-0">
        <img src={logo2} className="w-[110%] max-w-7xl rotate-[-15deg] object-contain brightness-125" alt="" />
      </div>

      {/* HEADER */}
      <header className={`sticky top-0 z-50 py-4 px-4 ${darkglassStyle}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <img src={logo1} alt="Inversiones Rubi" className="h-12 md:h-16 w-auto object-contain drop-shadow-2xl" />
          </div>

          <div className="flex-1 max-w-xl relative">
            <input
              type="text"
              placeholder="¿Qué buscas hoy?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-5 py-2.5 md:px-6 md:py-3 rounded-full outline-none text-xs md:text-sm border transition-all ${darkMode ? 'bg-black/20 border-white/10 focus:border-rose-600' : 'bg-white border-zinc-200 focus:border-rose-600'}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <a href="https://maps.google.com/?q=San+Esteban,Olancho" target="_blank" rel="noreferrer"
              className={`p-2.5 md:p-3 rounded-full border transition-all ${darkMode ? 'bg-zinc-800 text-rose-500 border-white/10' : 'bg-white text-rose-600 border-rose-200'}`}>
              <FaMapMarkerAlt />
            </a>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 md:p-3 rounded-full border transition-all ${darkMode ? 'bg-zinc-800 text-yellow-500 border-white/10' : 'bg-white text-rose-600 border-rose-200'}`}>
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        
        {/* CARRUSEL DE DESTACADOS */}
        {productosDestacados.length > 0 && !searchTerm && !categoriaActiva && (
          <section className="mb-12 overflow-hidden">
             <h2 className="text-[10px] font-black tracking-[0.3em] uppercase mb-6 text-rose-600 flex items-center gap-2 justify-center">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                Destacados Premium
             </h2>
             <div className="relative w-full">
                <div className="animate-infinite-scroll gap-6">
                  {productosDestacados.map((p, idx) => (
                    <div key={`${p.id}-${idx}`} className={`flex-shrink-0 w-64 md:w-72 p-4 rounded-3xl border transition-all ${darkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-white p-1 border border-zinc-100 flex-shrink-0">
                           <img src={p.imagen_url} className="w-full h-full object-contain" alt={p.nombre} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[10px] md:text-xs font-black uppercase truncate">{p.nombre}</h3>
                          <span className="text-rose-600 font-black text-xs md:text-sm">L {p.precio}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </section>
        )}

        {/* SELECTOR CATEGORÍAS */}
        <div className="mb-12 flex flex-col items-center">
          <div className="relative w-full max-w-xs">
            <select
              onChange={(e) => {
                const selected = categorias.find(c => c.id === Number(e.target.value));
                setCategoriaActiva(selected || null);
              }}
              value={categoriaActiva?.id || ""}
              className={`w-full px-6 py-4 rounded-2xl font-black uppercase text-xs border-2 outline-none text-center appearance-none cursor-pointer ${darkMode ? 'bg-zinc-900 border-white/5 focus:border-rose-600' : 'bg-white border-zinc-100 focus:border-rose-600'}`}
            >
              <option value="">✨ TODO EL CATÁLOGO</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL: O CARRUSELES POR CAT O GRILLA FILTRADA */}
        {productosPorCategoria ? (
          <div className="space-y-16">
            {productosPorCategoria.map(cat => (
              <section key={cat.id} className="relative">
                <div className="flex justify-between items-end mb-6 px-2">
                  <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic border-l-4 border-rose-600 pl-4">
                    {cat.nombre}
                  </h2>
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Desliza →</span>
                </div>
                
                {/* Carrusel horizontal para móvil y escritorio */}
                <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-8 px-2 snap-x">
                  {cat.items.map(p => (
                    <div key={p.id} className="snap-start">
                      <ProductoCard p={p} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {productosFiltrados.map((p) => (
              <ProductoCard key={p.id} p={p} />
            ))}
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-20 py-10 border-t border-white/5 flex flex-col items-center">
            <div className="flex flex-col items-center gap-3 group">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-rose-600 transition-colors">
                  Desarrollado por
                </span>
                <img src={logowas} alt="WASystem" className="h-10 w-auto drop-shadow-md transition-transform group-hover:scale-110" />
            </div>
            <p className="text-[8px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-8 italic text-center">
              © 2026 Inversiones Rubi - San Esteban, Olancho
            </p>
        </footer>
      </main>
    </div>
  )
}

export default CatalogoPublico