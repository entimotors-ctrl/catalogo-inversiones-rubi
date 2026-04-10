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
  const [error, setError] = useState(null)
  const numeroWhatsApp = '50499999999'

  useEffect(() => {
    let isMounted = true
    let timeoutId

    const fetchDatos = async () => {
      console.log('Iniciando carga de datos...')
      setLoading(true)

      // Timeout de 10 segundos para evitar que se quede cargando
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.log('Timeout alcanzado, forzando salida del loading')
          setLoading(false)
          setError('Tiempo de espera agotado. Verifica tu conexión a internet.')
        }
      }, 10000)

      try {
        console.log('Haciendo petición a APIs...')
        const [categoriasRes, productosRes] = await Promise.all([
          api.get('/categorias'),
          api.get('/productos')
        ])

        console.log('Datos recibidos:', { categorias: categoriasRes.data.length, productos: productosRes.data.length })

        if (!isMounted) return

        setCategorias(categoriasRes.data)
        setProductos(productosRes.data)

        const shuffled = [...productosRes.data].sort(() => 0.5 - Math.random())
        setProductosDestacados(shuffled.slice(0, 6))
        setError(null)
        console.log('Carga completada exitosamente')
      } catch (fetchError) {
        console.error('Error cargando datos:', fetchError)
        if (isMounted) {
          setError(`Error de conexión: ${fetchError.message}`)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          clearTimeout(timeoutId)
        }
      }
    }

    fetchDatos()
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    const carousel = document.querySelector('.destacados-carousel')
    if (!carousel) return

    let paused = false
    const handleMouseEnter = () => { paused = true }
    const handleMouseLeave = () => { paused = false }
    const handleTouchStart = () => { paused = true }
    const handleTouchEnd = () => { paused = false }

    carousel.addEventListener('mouseenter', handleMouseEnter)
    carousel.addEventListener('mouseleave', handleMouseLeave)
    carousel.addEventListener('touchstart', handleTouchStart)
    carousel.addEventListener('touchend', handleTouchEnd)

    const intervalId = window.setInterval(() => {
      if (paused) return
      if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1) {
        carousel.scrollLeft = 0
      } else {
        carousel.scrollLeft += 1
      }
    }, 16)

    return () => {
      carousel.removeEventListener('mouseenter', handleMouseEnter)
      carousel.removeEventListener('mouseleave', handleMouseLeave)
      carousel.removeEventListener('touchstart', handleTouchStart)
      carousel.removeEventListener('touchend', handleTouchEnd)
      window.clearInterval(intervalId)
    }
  }, [productosDestacados])

  const productosFiltrados = useMemo(() => productos.filter(producto => {
    const matchCategory = !categoriaActiva || Number(producto.categoria_id) === Number(categoriaActiva.id)
    const term = searchTerm.toLowerCase()
    const matchSearch = producto.nombre.toLowerCase().includes(term) ||
                       (producto.descripcion && producto.descripcion.toLowerCase().includes(term))
    return matchCategory && matchSearch
  }), [productos, categoriaActiva, searchTerm])

  const productosPorCategoria = useMemo(() => categorias.map(categoria => ({
    ...categoria,
    productos: productos.filter(p => Number(p.categoria_id) === Number(categoria.id))
  })), [categorias, productos])

  if (loading) {
    return (
      <div className={`watermark-background min-h-screen transition-colors duration-500 ${darkMode ? 'bg-glassblack-theme' : 'bg-light-theme'}`} style={{ '--watermark-image': `url(${watermarkLogo})` }}>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="mb-10 flex flex-col gap-4">
            <div className="h-16 w-64 rounded-3xl bg-white/10 animate-pulse"></div>
            <div className="h-12 w-full rounded-3xl bg-white/10 animate-pulse"></div>
          </div>
          <div className="glass-panel p-10 rounded-3xl border border-white/10 text-center text-white/70">
            <div className="loader-ring mb-6"></div>
            <p className="font-bold uppercase tracking-widest">Cargando catálogo...</p>
            <p className="text-sm text-gray-400 mt-3">Un segundo, estamos trayendo los mejores productos para ti.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`watermark-background min-h-screen transition-colors duration-500 ${darkMode ? 'bg-glassblack-theme' : 'bg-light-theme'}`} style={{ '--watermark-image': `url(${watermarkLogo})` }}>
      <header className={`sticky-header py-5 px-4 ${darkMode ? 'glass-panel' : 'light-panel shadow-md'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 text-rose-600 drop-shadow-[0_0_15px_rgba(225,29,72,0.8)] animate-pulse">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.25l-9 4.5 3 10.5 6 4.5 6-4.5 3-10.5-9-4.5z" />
                  <path fillOpacity="0.3" d="M12 2.25l-9 4.5 9 4.5 9-4.5-9-4.5z" />
                  <path fillOpacity="0.5" d="M3 6.75l3 10.5 6 4.5v-15l-9-4.5z" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <span className={`text-[10px] sm:text-xs font-montserrat font-bold tracking-[0.3em] uppercase leading-none mb-1 ${darkMode ? 'text-gray-300' : 'text-rose-900'}`}>
                  Inversiones
                </span>
                <h1 className="text-3xl sm:text-4xl font-black font-dancing leading-none ruby-title">
                  Rubi
                </h1>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 px-4 rounded-xl font-bold text-xs transition-all border shadow-md flex-shrink-0 ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700'}`}
            >
              {darkMode ? '🌙 NOCHE' : '🌟 LUZ'}
            </button>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-3xl">
              <input
                type="text"
                placeholder="🔍 Buscar en el catálogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input w-full px-6 py-4 rounded-xl outline-none text-base"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-600 hover:text-rose-400 font-black text-xl">
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className={`mb-6 p-6 rounded-3xl border ${darkMode ? 'glass-panel border-red-500/20' : 'light-panel border-red-300'}`}>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-300">Error de conexión</p>
            <p className="mt-2 text-base text-gray-200">{error}</p>
          </div>
        )}

        <div className="mb-10 flex justify-center">
          <select
            value={categoriaActiva ? categoriaActiva.id : ''}
            onChange={(e) => {
              const catId = e.target.value
              setCategoriaActiva(categorias.find(c => c.id === Number(catId)) || null)
            }}
            className={`px-6 py-3 rounded-xl font-bold uppercase text-sm transition-all outline-none border shadow-sm ${darkMode ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-rose-200 text-slate-800'}`}
          >
            <option value="">🏁 TODAS LAS CATEGORÍAS</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {!searchTerm && productosDestacados.length > 0 && (
          <section className="py-6 px-4 destacados-watermark">
            <div className="max-w-7xl mx-auto relative">
              <h2 className={`text-sm font-black tracking-widest uppercase mb-4 font-montserrat flex items-center gap-2 ${darkMode ? 'text-rose-500' : 'text-rose-700'}`}>
                <span>✨</span> Destacados
              </h2>

              <div className="carousel-auto destacados-carousel overflow-x-auto hide-scrollbar flex gap-4 pb-2">
                {productosDestacados.map((producto) => (
                  <div key={`dest-${producto.id}`} className={`flex-shrink-0 w-80 h-28 flex items-center gap-4 p-3 rounded-xl border ${darkMode ? 'glass-panel border-white/10' : 'light-panel border-rose-200'}`}>
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                      {producto.imagen_url ? (
                        <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl opacity-20">📷</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-black text-sm mb-1 uppercase line-clamp-1 font-montserrat ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {producto.nombre}
                      </h3>
                      <span className="text-lg font-black text-rose-600 font-montserrat block mb-2">
                        L {Number(producto.precio).toFixed(2)}
                      </span>
                      <a href={`https://wa.me/${numeroWhatsApp}?text=Hola, me interesa: *${producto.nombre}*`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-rose-600 text-white px-3 py-1.5 rounded-md font-bold uppercase tracking-wider hover:bg-rose-700 transition-colors">
                        VER MÁS
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {categoriaActiva === null && !searchTerm ? (
          productosPorCategoria.filter(cat => cat.productos.length > 0).map((categoria) => (
            <div key={categoria.id} className="mb-12">
              <h2 className={`text-2xl font-black uppercase mb-6 font-montserrat border-b pb-2 ${darkMode ? 'border-rose-600/50 text-white' : 'border-rose-300 text-slate-800'}`}>
                {categoria.nombre}
              </h2>
              <div className="carousel-auto overflow-x-auto hide-scrollbar flex gap-6 pb-6">
                {categoria.productos.map((producto) => (
                  <div key={producto.id} className={`product-card flex-shrink-0 w-72 h-full flex flex-col ${darkMode ? 'glass-panel' : 'light-panel'}`}>
                    <div className="absolute top-3 right-3 z-10 bg-rose-600 text-white px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded border border-white/20">DISPONIBLE</div>
                    <div className="img-container aspect-square flex items-center justify-center">
                      {producto.imagen_url ? <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" /> : <span className="text-4xl opacity-20">📷</span>}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className={`font-black text-lg mb-2 uppercase line-clamp-2 font-montserrat ${darkMode ? 'text-white' : 'text-slate-800'}`}>{producto.nombre}</h3>
                      <p className={`text-xs mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{producto.descripcion}</p>
                      <div className="mt-auto">
                        <div className={`mb-4 p-2 rounded-lg border-l-4 border-rose-600 ${darkMode ? 'bg-black/40' : 'bg-rose-50'}`}>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${darkMode ? 'text-gray-500' : 'text-rose-400'}`}>PRECIO NETO</span>
                          <span className="text-2xl font-black text-rose-600 font-montserrat">L {Number(producto.precio).toFixed(2)}</span>
                        </div>
                        <a href={`https://wa.me/${numeroWhatsApp}?text=Hola Inversiones Rubi, me interesa: *${producto.nombre}*`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg text-sm">
                          <span className="text-lg">💬</span> LO QUIERO
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div>
            <div className="mb-8 border-b border-rose-600/30 pb-4">
              <h2 className={`text-2xl font-black uppercase italic font-montserrat ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {searchTerm ? 'Resultados de Búsqueda' : categoriaActiva?.nombre}
              </h2>
              <p className="text-sm mt-1 font-bold text-rose-500">{productosFiltrados.length} RESULTADOS</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosFiltrados.map((producto) => (
                <div key={producto.id} className={`product-card flex flex-col h-full animate-enter ${darkMode ? 'glass-panel' : 'light-panel'}`}>
                  <div className="absolute top-3 right-3 z-10 bg-rose-600 text-white px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded border border-white/20">DISPONIBLE</div>
                  <div className="img-container aspect-square flex items-center justify-center">
                    {producto.imagen_url ? <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" /> : <span className="text-4xl opacity-20">📷</span>}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className={`font-black text-lg mb-2 uppercase line-clamp-2 font-montserrat ${darkMode ? 'text-white' : 'text-slate-800'}`}>{producto.nombre}</h3>
                    <p className={`text-xs mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{producto.descripcion}</p>
                    <div className="mt-auto">
                      <div className={`mb-4 p-2 rounded-lg border-l-4 border-rose-600 ${darkMode ? 'bg-black/40' : 'bg-rose-50'}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${darkMode ? 'text-gray-500' : 'text-rose-400'}`}>PRECIO NETO</span>
                        <span className="text-2xl font-black text-rose-600 font-montserrat">L {Number(producto.precio).toFixed(2)}</span>
                      </div>
                      <a href={`https://wa.me/${numeroWhatsApp}?text=Hola Inversiones Rubi, me interesa: *${producto.nombre}*`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg text-sm">
                        <span className="text-lg">💬</span> LO QUIERO
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {productosFiltrados.length === 0 && (
          <div className={`text-center py-20 border border-dashed rounded-xl ${darkMode ? 'glass-panel border-white/20' : 'light-panel border-rose-300'}`}>
            <div className="w-16 h-16 mx-auto text-rose-600 mb-4 opacity-50">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25l-9 4.5 3 10.5 6 4.5 6-4.5 3-10.5-9-4.5z" /></svg>
            </div>
            <h3 className={`text-2xl font-black uppercase font-montserrat ${darkMode ? 'text-white' : 'text-slate-800'}`}>SIN RESULTADOS</h3>
            <p className="text-gray-400 mt-2 font-bold">Intenta buscar otro producto o categoría.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CatalogoPublico
