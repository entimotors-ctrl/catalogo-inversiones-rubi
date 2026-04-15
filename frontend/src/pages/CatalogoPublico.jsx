import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import logo1 from '../assets/logo1.png'
import logo2 from '../assets/logo2.png'
import logowas from '../assets/logowas.png'
import { FaWhatsapp, FaChevronDown, FaThLarge } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'

// Estilos de Swiper (Asegúrate de tener instalada la librería: npm install swiper)
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

function CatalogoPublico() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [config, setConfig] = useState({ whatsapp: '' })
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(true)
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

      } catch (err) { 
        console.error("Error crítico:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchDatos();
  }, []);

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
        <p className="text-rose-600 font-black tracking-widest animate-pulse uppercase italic text-xs">Inversiones Rubi</p>
      </div>
    );
  }

  const darkglassStyle = darkMode 
    ? "bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-2xl"
    : "bg-white/70 backdrop-blur-md border border-zinc-200 shadow-lg";

  const ProductoCard = ({ p }) => (
    <div className={`group flex flex-col rounded-[2.5rem] overflow-hidden border transition-all duration-300 hover:scale-[1.02] flex-shrink-0 w-[210px] md:w-full ${darkMode ? 'bg-zinc-900 border-white/5 hover:border-rose-600/30' : 'bg-white border-zinc-200 shadow-md'}`}>
      <div className="aspect-square relative overflow-hidden bg-white p-4">
        <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-black text-xs md:text-sm uppercase mb-1 tracking-tight line-clamp-1">{p.nombre}</h3>
        <p className={`text-[10px] mb-4 line-clamp-2 opacity-60 leading-relaxed font-medium`}>{p.descripcion}</p>
        <div className="mt-auto">
           <div className="bg-rose-600/10 p-2 md:p-3 rounded-xl border-l-4 border-rose-600 mb-4">
              <span className="text-sm md:text-base font-black text-rose-600">L {p.precio}</span>
           </div>
           <a href={`https://wa.me/${config.whatsapp?.replace(/\D/g, '')}?text=Hola Inversiones Rubi, consulto por: *${p.nombre}*`} 
              target="_blank" rel="noopener noreferrer" 
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest">
              <FaWhatsapp size={14} /> CONSULTAR
           </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden relative ${darkMode ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-zinc-900'}`}>
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.09] flex items-center justify-center overflow-hidden z-0">
        <img src={logo2} className="w-[110%] max-w-7xl rotate-[-15deg] object-contain brightness-125" alt="" />
      </div>

      {/* HEADER */}
      <header className={`sticky top-0 z-[100] py-3 px-4 ${darkglassStyle}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setCategoriaActiva(null); setSearchTerm('');}}>
             <img src={logo1} alt="Inversiones Rubi" className="h-10 md:h-14 w-auto object-contain drop-shadow-2xl" />
          </div>
          <div className="flex-1 max-w-xl relative">
            <input
              type="text" placeholder="¿Qué buscas?" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-5 py-2.5 rounded-full outline-none text-xs border transition-all ${darkMode ? 'bg-black/40 border-white/10 focus:border-rose-600' : 'bg-white border-zinc-200 focus:border-rose-600'}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-full border transition-all ${darkMode ? 'bg-zinc-800 text-yellow-500 border-white/10' : 'bg-white text-rose-600 border-rose-200'}`}>
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 relative z-10">
        
        {/* 1. CARRUSEL DE ANIMACIONES (Debajo de búsqueda) */}
        {!searchTerm && !categoriaActiva && (
          <div className="mb-8 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              effect="fade"
              autoplay={{ delay: 4000 }}
              pagination={{ clickable: true }}
              className="h-[180px] md:h-[400px]"
            >
              {/* Aquí puedes mapear imágenes de una carpeta o de config */}
              {[1, 2, 3].map((idx) => (
                <SwiperSlide key={idx}>
                  <div className="w-full h-full bg-gradient-to-r from-rose-900 to-zinc-900 flex items-center justify-center relative">
                    <img src={logo1} className="h-2/3 object-contain opacity-20 absolute" alt="" />
                    <div className="relative text-center z-10">
                       <h2 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Nuevos Ingresos</h2>
                       <p className="text-rose-500 font-bold text-xs md:text-lg tracking-widest uppercase">Explora lo mejor de Rubi</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* 2. DESPLEGABLE DE CATEGORÍAS */}
        <div className="mb-8 flex items-center gap-3">
           <div className="relative group w-full md:w-64">
              <select 
                onChange={(e) => {
                  const cat = categorias.find(c => c.id == e.target.value);
                  setCategoriaActiva(cat || null);
                }}
                className={`w-full appearance-none px-6 py-3 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${darkMode ? 'bg-zinc-900 border-white/10 focus:border-rose-600' : 'bg-white border-zinc-200'}`}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
           </div>
        </div>

        {productosPorCategoria ? (
          <div className="space-y-12 md:space-y-20">
            {productosPorCategoria.map(cat => (
              <section key={cat.id}>
                <div className="flex justify-between items-center mb-6 px-2">
                  <h2 className="text-base md:text-3xl font-black uppercase tracking-tighter italic border-l-8 border-rose-600 pl-4">
                    {cat.nombre}
                  </h2>
                  
                  {/* 3. BOTÓN MÁS (Netflix Style) */}
                  <button 
                    onClick={() => setCategoriaActiva(cat)}
                    className="flex items-center gap-2 px-5 py-2 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20"
                  >
                    <FaThLarge /> MÁS
                  </button>
                </div>
                
                <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-6 px-2 snap-x">
                  {cat.items.slice(0, 10).map(p => (
                    <div key={p.id} className="snap-start">
                      <ProductoCard p={p} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-xl md:text-3xl font-black uppercase italic border-l-8 border-rose-600 pl-4">
                  {categoriaActiva ? categoriaActiva.nombre : 'Resultados'}
                </h2>
                <button 
                  onClick={() => {setCategoriaActiva(null); setSearchTerm('');}}
                  className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-600/10 px-4 py-2 rounded-lg"
                >
                  Regresar
                </button>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
               {productosFiltrados.map((p) => (
                 <ProductoCard key={p.id} p={p} />
               ))}
             </div>
             {productosFiltrados.length === 0 && (
               <div className="text-center py-20 opacity-40 font-black uppercase tracking-[0.3em]">No se encontraron productos</div>
             )}
          </div>
        )}

        <footer className="mt-20 py-10 border-t border-white/5 flex flex-col items-center">
            <div className="flex flex-col items-center gap-3 group">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-rose-600 transition-colors">Desarrollado por</span>
                <img src={logowas} alt="WASystem" className="h-8 w-auto drop-shadow-md transition-transform group-hover:scale-110" />
            </div>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-8 italic text-center">
              © 2026 Inversiones Rubi - San Esteban, Olancho
            </p>
        </footer>
      </main>
    </div>
  )
}

export default CatalogoPublico