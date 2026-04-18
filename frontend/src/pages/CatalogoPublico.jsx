import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import logo1 from '../assets/logo1.png'
import logo2 from '../assets/logo2.png'
import logowas from '../assets/logowas.png'
import { FaWhatsapp, FaChevronDown, FaThLarge, FaTimes } from 'react-icons/fa'

// LIBRERÍAS PARA EL CARRUSEL
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules'

// ESTILOS OBLIGATORIOS DE SWIPER
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'

function CatalogoPublico() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [config, setConfig] = useState({ whatsapp: '', categoria_excluida: null })
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [loading, setLoading] = useState(true)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

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

  const productosParaCarrusel = useMemo(() => {
    if (productos.length === 0) return [];
    let filtrados = productos;
    if (config.categoria_excluida) {
      filtrados = productos.filter(p => Number(p.categoria_id) !== Number(config.categoria_excluida));
    }
    return [...filtrados].sort(() => 0.5 - Math.random()).slice(0, 20);
  }, [productos, config.categoria_excluida]);

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
    <div className={`group flex flex-col rounded-[2.5rem] overflow-hidden border transition-all duration-300 h-full ${darkMode ? 'bg-zinc-900 border-white/5 hover:border-rose-600/30' : 'bg-white border-zinc-200 shadow-md'}`}>
      <div className="cursor-pointer" onClick={() => setProductoSeleccionado(p)}>
        <div className="aspect-square relative overflow-hidden bg-white p-2 md:p-4 flex items-center justify-center">
          <img src={p.imagen_url} alt={p.nombre} loading="lazy" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
             <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm font-bold uppercase tracking-widest">Ver Detalles</span>
          </div>
        </div>
        <div className="p-4 md:p-5 pb-2">
          <h3 className="font-black text-[11px] md:text-sm uppercase mb-1 tracking-tight line-clamp-1">{p.nombre}</h3>
          <p className={`text-[10px] line-clamp-2 opacity-60 leading-relaxed font-medium`}>{p.descripcion}</p>
        </div>
      </div>
      <div className="p-4 md:p-5 pt-0 mt-auto flex flex-col">
           <div className="bg-rose-600/10 p-2 md:p-3 rounded-xl border-l-4 border-rose-600 my-3 md:my-4">
              <span className="text-xs md:text-base font-black text-rose-600">L {p.precio}</span>
           </div>
           <a href={`https://wa.me/${config.whatsapp?.replace(/\D/g, '')}?text=Hola Inversiones Rubi, consulto por: *${p.nombre}*`} 
              target="_blank" rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest">
              <FaWhatsapp size={14} /> CONSULTAR
           </a>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden relative ${darkMode ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-zinc-900'}`}>
      
      {/* MEJORA: Imagen de fondo emparejada y expandida */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.07] flex items-center justify-center z-0">
        <img 
          src={logo2} 
          className="w-full h-full object-contain md:object-cover scale-110 md:scale-100 rotate-[-10deg] brightness-125 transition-all" 
          alt="" 
        />
      </div>

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
        {!searchTerm && !categoriaActiva && productosParaCarrusel.length > 0 && (
          /* MEJORA: Altura de franja reducida en PC */
          <div className="mb-8 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-black">
            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              effect="fade"
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              className="h-[250px] md:h-[350px] w-full"
            >
              {productosParaCarrusel.map((p) => (
                <SwiperSlide key={p.id}>
                  <div className="w-full h-full relative flex items-center bg-zinc-900 cursor-pointer" onClick={() => setProductoSeleccionado(p)}>
                    <img src={p.imagen_url} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl" alt="" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
                    <div className="relative z-20 flex w-full max-w-5xl mx-auto px-6 md:px-12 items-center gap-4 md:gap-10 h-full">
                      <div className="w-1/2 md:w-1/3 h-full flex items-center justify-center drop-shadow-2xl p-2 md:p-6">
                         <img src={p.imagen_url} className="max-h-full max-w-full object-contain rounded-xl" alt={p.nombre} loading="lazy" />
                      </div>
                      <div className="w-1/2 md:w-2/3 flex flex-col items-start">
                         <span className="bg-rose-600 text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-2">Nuevo Ingreso</span>
                         <h2 className="text-sm md:text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg line-clamp-2 leading-tight">
                           {p.nombre}
                         </h2>
                         <p className="text-rose-400 font-bold text-xs md:text-lg tracking-widest uppercase mt-1 md:mt-2">L {p.precio}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        <div className="mb-8 flex justify-center md:justify-start">
           <div className="relative group w-full md:w-72">
              <select 
                value={categoriaActiva?.id || ""}
                onChange={(e) => {
                  const cat = categorias.find(c => Number(c.id) === Number(e.target.value));
                  setCategoriaActiva(cat || null);
                  setSearchTerm(''); 
                }}
                className={`w-full appearance-none px-6 py-4 rounded-2xl outline-none text-[11px] font-black uppercase tracking-widest border transition-all cursor-pointer shadow-xl ${darkMode ? 'bg-zinc-900 border-white/10 focus:border-rose-600 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
              >
                <option value="">📂 Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-rose-600" />
           </div>
        </div>

        {productosPorCategoria ? (
          <div className="space-y-16 md:space-y-24">
            {productosPorCategoria.map(cat => (
              <section key={cat.id} className="animate-in fade-in duration-700">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h2 className="text-lg md:text-4xl font-black uppercase tracking-tighter italic border-l-8 border-rose-600 pl-4">
                    {cat.nombre}
                  </h2>
                  <button 
                    onClick={() => setCategoriaActiva(cat)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-90 shadow-xl shadow-rose-600/30"
                  >
                    <FaThLarge /> MÁS
                  </button>
                </div>
                <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-10 overflow-x-auto no-scrollbar pb-8 px-2 snap-x">
                  {cat.items.slice(0, 10).map(p => (
                    <div key={p.id} className="snap-start min-w-[180px] md:min-w-0">
                      <ProductoCard p={p} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
             <div className="flex items-center justify-between mb-10 px-2 border-b border-white/5 pb-6">
                <h2 className="text-xl md:text-5xl font-black uppercase italic border-l-8 border-rose-600 pl-5">
                  {categoriaActiva ? categoriaActiva.nombre : `Buscando: ${searchTerm}`}
                </h2>
                <button 
                  onClick={() => {setCategoriaActiva(null); setSearchTerm('');}}
                  className="text-[10px] font-black text-white uppercase tracking-widest bg-zinc-800 hover:bg-rose-600 px-6 py-3 rounded-xl transition-colors shadow-lg"
                >
                  Volver al inicio
                </button>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-10 px-2">
               {productosFiltrados.map((p) => (
                 <ProductoCard key={p.id} p={p} />
               ))}
             </div>
             {productosFiltrados.length === 0 && (
               <div className="text-center py-32 opacity-20 font-black uppercase tracking-[0.5em] text-xl">Sin resultados</div>
             )}
          </div>
        )}

        <footer className="mt-32 py-16 border-t border-white/5 flex flex-col items-center">
            <div className="flex flex-col items-center gap-4 group">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 group-hover:text-rose-600 transition-colors">Powered by</span>
                <img src={logowas} alt="WASystem" className="h-10 w-auto grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" loading="lazy" />
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-10 italic text-center">
              © 2026 Inversiones Rubi • San Esteban, Olancho | SIRVIENDO DESDE 1987.
            </p>
        </footer>
      </main>

      {productoSeleccionado && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className={`relative w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'} flex flex-col max-h-[90vh]`}>
            <button 
              onClick={() => setProductoSeleccionado(null)}
              className="absolute top-4 right-4 z-[210] p-3 bg-black/50 text-white rounded-full hover:bg-rose-600 transition-colors backdrop-blur-md"
            >
              <FaTimes size={16} />
            </button>
            <div className="bg-white relative w-full h-64 md:h-80 flex-shrink-0">
               <Swiper
                 modules={[Pagination, Navigation]}
                 pagination={{ clickable: true }}
                 navigation={true}
                 className="w-full h-full modal-swiper"
               >
                  <SwiperSlide>
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img src={productoSeleccionado.imagen_url} alt="Principal" className="max-w-full max-h-full object-contain drop-shadow-md" loading="lazy" />
                    </div>
                  </SwiperSlide>
                  {productoSeleccionado.imagenes_extra && productoSeleccionado.imagenes_extra.map((imgObj, index) => (
                    <SwiperSlide key={index}>
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <img src={imgObj.imagen_url} alt={`Ángulo ${index}`} className="max-w-full max-h-full object-contain drop-shadow-md" loading="lazy" />
                      </div>
                    </SwiperSlide>
                  ))}
               </Swiper>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto flex-grow no-scrollbar">
               <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2 leading-tight">
                 {productoSeleccionado.nombre}
               </h2>
               <div className="bg-rose-600/10 p-3 inline-block rounded-xl border-l-4 border-rose-600 mb-6">
                  <span className="text-lg md:text-xl font-black text-rose-600">L {productoSeleccionado.precio}</span>
               </div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 border-b border-white/10 pb-2">Descripción del Artículo</h4>
               <p className={`text-xs md:text-sm leading-relaxed mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                 {productoSeleccionado.descripcion || "No hay descripción detallada disponible para este producto."}
               </p>
               <a href={`https://wa.me/${config.whatsapp?.replace(/\D/g, '')}?text=Hola Inversiones Rubi, consulto por este producto que vi en su catálogo:%0A*${productoSeleccionado.nombre}*%0APrecio: L ${productoSeleccionado.precio}`} 
                  target="_blank" rel="noopener noreferrer" 
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-900/20 active:scale-95 text-xs md:text-sm uppercase tracking-widest">
                  <FaWhatsapp size={20} /> ENVIAR MENSAJE AL VENDEDOR
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CatalogoPublico;