import { useState, useEffect, useMemo, useRef } from 'react'
import api from '../services/api'
import logo1 from '../assets/logo1.png'
import logo2 from '../assets/logo2.png'
import logowas from '../assets/logowas.png'
import { FaWhatsapp, FaThLarge, FaTimes, FaShoppingCart } from 'react-icons/fa'

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
  const [categoriaActiva, setCategoriaActiva] = useState({ id: 'todos', nombre: 'Todos los productos' })
  const [searchTerm, setSearchTerm] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [darkMode, setDarkMode] = useState(true)
  const [loading, setLoading] = useState(true)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [imagenActivaModal, setImagenActivaModal] = useState(null)
  const [shuffleTick, setShuffleTick] = useState(0)
  const categoriasScrollRef = useRef(null)
  const desplazarCategorias = (direccion) => {
    categoriasScrollRef.current?.scrollBy({ left: direccion * 320, behavior: 'smooth' })
  }

  // Refresca la mezcla de "Destacados" cada rato solo, para que la portada
  // no se vea siempre igual aunque el visitante se quede un buen rato.
  useEffect(() => {
    const id = setInterval(() => setShuffleTick(t => t + 1), 25000)
    return () => clearInterval(id)
  }, [])

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
        } catch {
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

  // Mezcla productos recientes con algunos viejos al azar, en vez de puro
  // azar uniforme: así lo nuevo tiene más chance de aparecer sin que la
  // portada deje de mostrar cosas del catálogo viejo de vez en cuando.
  const mezclarNuevosYViejos = (lista, cantidad, proporcionNuevos = 0.7) => {
    const ordenados = [...lista].sort((a, b) => b.id - a.id);
    const cantidadNuevos = Math.round(cantidad * proporcionNuevos);
    const recientes = ordenados.slice(0, Math.max(cantidadNuevos, cantidad - (ordenados.length - cantidadNuevos)));
    const resto = ordenados.slice(recientes.length).sort(() => 0.5 - Math.random());
    const combinados = [...recientes, ...resto.slice(0, cantidad - recientes.length)];
    return combinados.sort(() => 0.5 - Math.random());
  };

  const productosDisponibles = useMemo(() => {
    if (productos.length === 0) return [];
    if (!config.categoria_excluida) return productos;
    return productos.filter(p => Number(p.categoria_id) !== Number(config.categoria_excluida));
  }, [productos, config.categoria_excluida]);

  const productosParaCarrusel = useMemo(() => {
    if (productosDisponibles.length === 0) return [];
    return mezclarNuevosYViejos(productosDisponibles, 20, 0.7);
  }, [productosDisponibles]);

  // "Destacados": mezcla de nuevos y viejos que se reordena sola cada rato
  // (shuffleTick) para que la portada se sienta viva sin recargar la página.
  const productosDestacados = useMemo(() => {
    if (productosDisponibles.length === 0) return [];
    return mezclarNuevosYViejos(productosDisponibles, 10, 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productosDisponibles, shuffleTick]);

  // Vista de "inicio": sin búsqueda activa y sin categoría específica seleccionada.
  const esVistaInicio = !searchTerm && (!categoriaActiva || categoriaActiva.id === 'todos')

  // Productos agregados más recientemente (mayor id primero), para la franja "Recién Llegados".
  const productosRecientes = useMemo(() => {
    return [...productosDisponibles].sort((a, b) => b.id - a.id).slice(0, 10);
  }, [productosDisponibles]);

  // Productos agrupados por categoría, solo para la vista de inicio (secciones tipo tienda).
  const productosPorCategoria = useMemo(() => {
    if (!esVistaInicio || categorias.length === 0 || productosDisponibles.length === 0) return null;
    return categorias
      .map(cat => ({
        id: cat.id,
        nombre: cat.nombre,
        items: productosDisponibles.filter(p => Number(p.categoria_id) === Number(cat.id)),
      }))
      .filter(cat => cat.items.length > 0);
  }, [esVistaInicio, categorias, productosDisponibles]);

  const PRODUCTOS_POR_PAGINA = 35

  useEffect(() => {
    setPaginaActual(1)
  }, [searchTerm, categoriaActiva])

  const productosFiltrados = useMemo(() => {
    const term = searchTerm.toLowerCase()
    const filtrados = productos.filter(producto => {
      const matchCategory = !categoriaActiva || categoriaActiva.id === 'todos' || Number(producto.categoria_id) === Number(categoriaActiva.id)
      return matchCategory && (producto.nombre.toLowerCase().includes(term) || (producto.descripcion?.toLowerCase().includes(term)))
    })
    const expandidos = filtrados.flatMap(producto => {
      const tarjetas = [producto]
      if (producto.imagenes_extra && producto.imagenes_extra.length > 0) {
        producto.imagenes_extra.forEach((imgObj, idx) => {
          tarjetas.push({ ...producto, imagen_url: imgObj.imagen_url, _extra_key: `${producto.id}_extra_${idx}` })
        })
      }
      return tarjetas
    })
    return expandidos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [productos, categoriaActiva, searchTerm])

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA))

  const productosPaginados = useMemo(() => {
    const start = (paginaActual - 1) * PRODUCTOS_POR_PAGINA
    return productosFiltrados.slice(start, start + PRODUCTOS_POR_PAGINA)
  }, [productosFiltrados, paginaActual])

  const gruposPorLetra = useMemo(() => {
    const grupos = Object.entries(
      productosPaginados.reduce((acc, p) => {
        const letra = p.nombre.charAt(0).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (!acc[letra]) acc[letra] = []
        acc[letra].push(p)
        return acc
      }, {})
    ).sort(([a], [b]) => a.localeCompare(b, 'es'))
    return grupos
  }, [productosPaginados])

  const paginasVisibles = useMemo(() => {
    const delta = 2
    const paginas = []
    const inicio = Math.max(1, paginaActual - delta)
    const fin = Math.min(totalPaginas, paginaActual + delta)

    if (inicio > 1) paginas.push(1)
    if (inicio > 2) paginas.push('...')
    for (let page = inicio; page <= fin; page += 1) paginas.push(page)
    if (fin < totalPaginas - 1) paginas.push('...')
    if (fin < totalPaginas) paginas.push(totalPaginas)

    return paginas
  }, [paginaActual, totalPaginas])

  const renderPaginacion = () => (
    <div className="flex flex-wrap items-center justify-center gap-2 py-6">
      <button
        type="button"
        disabled={paginaActual === 1}
        onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
        className="px-4 py-2 rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-white/10 bg-zinc-900 text-white hover:bg-rose-600"
      >
        Anterior
      </button>

      {paginasVisibles.map((page, index) => (
        typeof page === 'number' ? (
          <button
            key={page}
            type="button"
            onClick={() => setPaginaActual(page)}
            className={`min-w-[38px] px-3 py-2 rounded-full border transition-colors ${page === paginaActual ? 'bg-rose-600 text-white border-rose-600' : 'border-white/10 bg-zinc-900 text-white hover:bg-zinc-800'}`}
          >
            {page}
          </button>
        ) : (
          <span key={`elipsis-${index}`} className="px-3 py-2 text-white/50">...</span>
        )
      ))}

      <button
        type="button"
        disabled={paginaActual === totalPaginas}
        onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
        className="px-4 py-2 rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-white/10 bg-zinc-900 text-white hover:bg-rose-600"
      >
        Siguiente
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-5 ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
        <FaShoppingCart className="text-rose-600 animate-bounce" size={48} />
        <div className="w-48 h-1.5 rounded-full overflow-hidden bg-rose-600/10">
          <div className="h-full w-1/3 bg-rose-600 rounded-full animate-[cart-loading-bar_1.3s_ease-in-out_infinite]"></div>
        </div>
        <p className="text-rose-600 font-black tracking-widest animate-pulse uppercase italic text-xs">Inversiones Rubi</p>
      </div>
    );
  }

  const darkglassStyle = darkMode 
    ? "bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-2xl"
    : "bg-white/70 backdrop-blur-md border border-zinc-200 shadow-lg";

  const ProductoCard = ({ p }) => (
    <div className={`group flex flex-col rounded-2xl md:rounded-[2.5rem] overflow-hidden border transition-all duration-300 h-full ${darkglassStyle} ${darkMode ? 'hover:border-rose-600/30' : ''}`}>
      <div className="cursor-pointer" onClick={() => { setProductoSeleccionado(p); setImagenActivaModal(p.imagen_url); }}>
        <div className="aspect-square relative overflow-hidden bg-white p-0 md:p-1.5 flex items-center justify-center">
          <img src={p.imagen_url} alt={p.nombre} loading="lazy" decoding="async" className="max-w-full max-h-full object-contain scale-110 md:scale-100 md:group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
             <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm font-bold uppercase tracking-widest">Ver Detalles</span>
          </div>
        </div>
        <div className="p-2 md:p-5 pb-1 md:pb-2">
          <h3 className="font-black text-[9px] md:text-sm uppercase mb-0.5 md:mb-1 tracking-tight line-clamp-2">{p.nombre}</h3>
          {p.descripcion && <p className={`text-[8px] md:text-[10px] line-clamp-2 opacity-60 leading-relaxed font-medium hidden md:block`}>{p.descripcion}</p>}
        </div>
      </div>
      <div className="p-2 md:p-5 pt-0 mt-auto flex flex-col">
           <div className="bg-rose-600/10 p-1.5 md:p-3 rounded-lg md:rounded-xl border-l-4 border-rose-600 my-1.5 md:my-4">
              <span className="text-[10px] md:text-base font-black text-rose-600">L {p.precio}</span>
           </div>
           <a href={`https://wa.me/${config.whatsapp?.replace(/\D/g, '')}?text=Hola Inversiones Rubi, consulto por: *${p.nombre}*%0APrecio: L ${p.precio}%0A${encodeURIComponent(p.imagen_url)}`} 
              target="_blank" rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg md:rounded-xl font-black flex items-center justify-center gap-1 md:gap-2 transition-all shadow-lg active:scale-95 text-[8px] md:text-[10px] uppercase tracking-widest">
              <FaWhatsapp size={10} className="md:hidden" /><FaWhatsapp size={14} className="hidden md:block" /> <span className="hidden md:inline">CONSULTAR</span><span className="md:hidden">WA</span>
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
          loading="lazy"
        />
      </div>

      <header className={`sticky top-0 z-[100] py-3 px-4 ${darkglassStyle}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setCategoriaActiva({ id: 'todos', nombre: 'Todos los productos' }); setSearchTerm('');}}>
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
        <div className="mb-8 -mx-4 px-4 md:mx-0 md:px-0 relative flex items-center gap-2">
           <button
             type="button"
             onClick={() => desplazarCategorias(-1)}
             aria-label="Categorías anteriores"
             className={`hidden md:flex shrink-0 items-center justify-center w-9 h-9 rounded-full border transition-all active:scale-90 ${darkMode ? 'bg-zinc-900 border-white/10 text-white hover:border-rose-600/50' : 'bg-white border-zinc-200 text-zinc-900 hover:border-rose-300'}`}
           >
             ‹
           </button>

           <div ref={categoriasScrollRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 snap-x scroll-smooth">
              <button
                type="button"
                onClick={() => { setCategoriaActiva({ id: 'todos', nombre: 'Todos los productos' }); setSearchTerm(''); }}
                className={`shrink-0 snap-start px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                  (categoriaActiva?.id === 'todos')
                    ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : darkMode ? 'bg-zinc-900 border-white/10 text-white hover:border-rose-600/50' : 'bg-white border-zinc-200 text-zinc-900 hover:border-rose-300'
                }`}
              >
                📦 Todos
              </button>
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setCategoriaActiva(cat); setSearchTerm(''); }}
                  className={`shrink-0 snap-start px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                    Number(categoriaActiva?.id) === Number(cat.id)
                      ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : darkMode ? 'bg-zinc-900 border-white/10 text-white hover:border-rose-600/50' : 'bg-white border-zinc-200 text-zinc-900 hover:border-rose-300'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
           </div>

           <button
             type="button"
             onClick={() => desplazarCategorias(1)}
             aria-label="Más categorías"
             className={`hidden md:flex shrink-0 items-center justify-center w-9 h-9 rounded-full border transition-all active:scale-90 ${darkMode ? 'bg-zinc-900 border-white/10 text-white hover:border-rose-600/50' : 'bg-white border-zinc-200 text-zinc-900 hover:border-rose-300'}`}
           >
             ›
           </button>
        </div>

        {!searchTerm && (!categoriaActiva || categoriaActiva.id === 'todos') && productosParaCarrusel.length > 0 && (
          /* MEJORA: Altura de franja reducida en PC */
          <div className="mb-8 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-black">
            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              effect="fade"
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              className="h-[230px] md:h-[322px] w-full"
            >
              {productosParaCarrusel.map((p) => (
                <SwiperSlide key={p.id}>
                  <div className="w-full h-full relative flex items-center bg-zinc-900 cursor-pointer" onClick={() => { setProductoSeleccionado(p); setImagenActivaModal(p.imagen_url); }}>
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

        {esVistaInicio && productosRecientes.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-4 mb-6 px-2">
              <h2 className="text-lg md:text-3xl font-black uppercase tracking-tighter italic border-l-8 border-rose-600 pl-4">
                🆕 Recién Llegados
              </h2>
            </div>
            <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-10 overflow-x-auto no-scrollbar pb-4 px-2 snap-x">
              {productosRecientes.map(p => (
                <div key={`reciente-${p.id}`} className="snap-start min-w-[180px] md:min-w-0">
                  <ProductoCard p={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {esVistaInicio && productosDestacados.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between gap-4 mb-6 px-2">
              <h2 className="text-lg md:text-3xl font-black uppercase tracking-tighter italic border-l-8 border-rose-600 pl-4">
                ✨ Destacados para vos
              </h2>
              <button
                onClick={() => setShuffleTick(t => t + 1)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all active:scale-90 ${darkMode ? 'border-white/10 bg-zinc-900 hover:bg-rose-600 hover:border-rose-600' : 'border-zinc-200 bg-white hover:bg-rose-600 hover:text-white'}`}
              >
                🔄 Ver otros
              </button>
            </div>
            <div key={shuffleTick} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-10 px-2 animate-in fade-in duration-500">
              {productosDestacados.map(p => (
                <ProductoCard key={`destacado-${p.id}`} p={p} />
              ))}
            </div>
          </section>
        )}

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
                  {cat.items.slice(0, 5).map(p => (
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
                  {categoriaActiva ? categoriaActiva.nombre : searchTerm ? `Buscando: ${searchTerm}` : 'Todos los productos'}
                </h2>
                {(searchTerm || (categoriaActiva && categoriaActiva.id !== 'todos')) && (
                  <button 
                    onClick={() => {setCategoriaActiva({ id: 'todos', nombre: 'Todos los productos' }); setSearchTerm('');}}
                    className="text-[10px] font-black text-white uppercase tracking-widest bg-zinc-800 hover:bg-rose-600 px-6 py-3 rounded-xl transition-colors shadow-lg"
                  >
                    Volver al inicio
                  </button>
                )}
             </div>
             {(!searchTerm && (!categoriaActiva || categoriaActiva.id === 'todos')) ? (
               <div className="relative">
                 {/* BARRA DE LETRAS LATERAL */}
                 <div
                   className="fixed right-1 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-0 md:hidden select-none"
                   onTouchMove={(e) => {
                     e.preventDefault()
                     const touch = e.touches[0]
                     const el = document.elementFromPoint(touch.clientX, touch.clientY)
                     const letra = el?.dataset?.letra
                     if (letra) {
                       const target = document.getElementById(`letra-${letra}`)
                       if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                     }
                   }}
                 >
                   {gruposPorLetra.map(([l]) => (
                     <button
                       key={l}
                       data-letra={l}
                       onTouchStart={() => {
                         const target = document.getElementById(`letra-${l}`)
                         if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                       }}
                       className={`w-5 h-5 flex items-center justify-center text-[9px] font-black rounded-full transition-colors ${darkMode ? 'text-white/40 active:text-rose-500' : 'text-zinc-400 active:text-rose-500'}`}
                     >
                       {l}
                     </button>
                   ))}
                 </div>
                 {/* GRUPOS CON SEPARADORES */}
                 <div className="px-2 space-y-10 pr-6 md:pr-2">
                   {gruposPorLetra.map(([letra, items]) => (
                     <div key={letra} id={`letra-${letra}`}>
                       <div className="flex items-center gap-4 mb-5">
                         <span className={`text-4xl md:text-6xl font-black italic leading-none ${darkMode ? 'text-white/10' : 'text-zinc-200'}`}>{letra}</span>
                         <div className={`flex-1 h-px ${darkMode ? 'bg-white/5' : 'bg-zinc-200'}`}></div>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-10">
                         {items.map((p) => (
                           <ProductoCard key={p._extra_key || p.id} p={p} />
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
               // Vista sin separadores (búsqueda o categoría específica)
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-10 px-2">
                 {productosPaginados.map((p) => (
                   <ProductoCard key={p._extra_key || p.id} p={p} />
                 ))}
               </div>
             )}
             {(productosFiltrados.length === 0) && (
               <div className="text-center py-32 opacity-20 font-black uppercase tracking-[0.5em] text-xl">Sin resultados</div>
             )}
             {productosFiltrados.length > 0 && totalPaginas > 1 && renderPaginacion()}
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
                 onSlideChange={(swiper) => {
                   const todasLasImagenes = [productoSeleccionado.imagen_url, ...(productoSeleccionado.imagenes_extra?.map(i => i.imagen_url) || [])]
                   setImagenActivaModal(todasLasImagenes[swiper.activeIndex] || productoSeleccionado.imagen_url)
                 }}
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
               {productoSeleccionado.descripcion && (
                 <>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 border-b border-white/10 pb-2">Descripción del Artículo</h4>
                   <p className={`text-xs md:text-sm leading-relaxed mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                     {productoSeleccionado.descripcion}
                   </p>
                 </>
               )}
               <a href={`https://wa.me/${config.whatsapp?.replace(/\D/g, '')}?text=Hola Inversiones Rubi, consulto por este producto que vi en su catálogo:%0A*${productoSeleccionado.nombre}*%0APrecio: L ${productoSeleccionado.precio}%0A${encodeURIComponent(imagenActivaModal || productoSeleccionado.imagen_url)}`} 
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