import { useState, useEffect } from 'react'
import api from '../services/api'

function CatalogoPublico() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(true) // Forzamos el modo oscuro para el Glassblack
  const numeroWhatsApp = "50499999999"

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categorias')
        setCategorias(response.data)
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }

    const fetchProductos = async () => {
      try {
        const response = await api.get('/productos')
        setProductos(response.data)
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }

    fetchCategorias()
    fetchProductos()
  }, [])

  const productosFiltrados = productos.filter(producto => {
    const matchCategory = !categoriaActiva || Number(producto.categoria_id) === Number(categoriaActiva.id)
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchCategory && matchSearch
  })

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-glassblack-theme text-white' : 'bg-gray-100 text-black'}`}>
      
      {/* HEADER GLASSBLACK */}
      <header className={`sticky-header py-6 px-4 ${darkMode ? 'glass-panel' : 'bg-white shadow-md'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Top Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]">💎</div>
              <div>
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase font-montserrat">
                  INVERSIONES <span className="text-red-600">RUBI</span>
                </h1>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Catálogo Premium</p>
              </div>
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 px-4 rounded-lg font-bold text-xs transition-all border ${
                darkMode
                  ? 'bg-black/50 border-white/10 text-gray-300 hover:border-red-600 hover:text-white'
                  : 'bg-white border-gray-300 text-black hover:border-red-600'
              }`}
            >
              {darkMode ? 'MODO CRISTAL 💎' : 'MODO CLARO ☀️'}
            </button>
          </div>
          
          {/* Buscador Prominente */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-3xl">
              <input
                type="text"
                placeholder="🔍 Buscar en Inversiones Rubi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input w-full px-6 py-4 rounded-xl outline-none text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-400 font-black text-xl"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR GLASSBLACK */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className={`sticky top-40 p-6 rounded-xl shadow-2xl border-l-4 border-l-red-600 ${
              darkMode ? 'glass-panel' : 'bg-white border-gray-200'
            }`}>
              <h2 className="text-xl font-black mb-6 uppercase tracking-wider border-b border-white/10 pb-3 font-montserrat">
                Categorías
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setCategoriaActiva(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg uppercase font-bold text-sm transition-all flex items-center justify-between border border-transparent ${
                    categoriaActiva === null
                      ? 'bg-red-600 text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)] translate-x-2'
                      : darkMode
                      ? 'text-gray-400 hover:bg-white/5 hover:border-white/10 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <span>🏁 Todas</span>
                  {categoriaActiva === null && <span>»</span>}
                </button>
                
                {categorias?.map((categoria) => {
                  const isActive = categoriaActiva && Number(categoriaActiva.id) === Number(categoria.id)
                  return (
                    <button
                      key={categoria.id}
                      onClick={() => setCategoriaActiva(categoria)}
                      className={`w-full text-left px-4 py-3 rounded-lg uppercase font-bold text-sm transition-all flex items-center justify-between border border-transparent ${
                        isActive
                          ? 'bg-red-600 text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)] translate-x-2'
                          : darkMode
                          ? 'text-gray-400 hover:bg-white/5 hover:border-white/10 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      <span>{categoria.nombre}</span>
                      {isActive && <span>»</span>}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* GRID DE PRODUCTOS */}
          <main className="flex-1">
            {/* Título de Resultados */}
            <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-3xl font-black uppercase italic font-montserrat">
                  {categoriaActiva ? categoriaActiva.nombre : 'CATÁLOGO COMPLETO'}
                </h2>
                <p className="text-sm mt-1 font-bold text-red-500">
                  {productosFiltrados.length} RESULTADOS ENCONTRADOS
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {productosFiltrados?.map((producto, index) => (
                <div
                  key={producto.id}
                  className={`product-card animate-enter flex flex-col h-full ${
                    darkMode ? 'glass-panel' : 'bg-white border-gray-200'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Badge de Disponibilidad */}
                  <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-lg rounded-full border border-white/20">
                    <div>DISPONIBLE</div>
                  </div>

                  {/* Imagen */}
                  <div className="img-container aspect-square flex items-center justify-center">
                    {producto.imagen_url ? (
                      <img 
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl opacity-20">📷</span>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-black text-xl mb-2 uppercase line-clamp-2 font-montserrat">
                      {producto.nombre}
                    </h3>
                    
                    <p className={`text-sm mb-6 line-clamp-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {producto.descripcion}
                    </p>

                    <div className="mt-auto">
                      <div className={`mb-5 p-3 rounded-lg border-l-4 border-red-600 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">PRECIO NETO</span>
                        <span className="text-3xl font-black text-red-600 font-montserrat drop-shadow-[0_0_8px_rgba(230,0,0,0.3)]">
                          L {Number(producto.precio).toFixed(2)}
                        </span>
                      </div>

                      {/* Botón WhatsApp modificado para Inversiones Rubi */}
                      <a
                        href={`https://wa.me/${numeroWhatsApp}?text=Hola Inversiones Rubi, me interesa el producto: *${producto.nombre}* - Precio: L${producto.precio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp w-full text-white font-black py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                      >
                        <span className="text-xl">💬</span>
                        LO QUIERO
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vacío */}
            {productosFiltrados.length === 0 && (
              <div className={`text-center py-20 border border-dashed rounded-xl ${
                darkMode ? 'glass-panel border-white/20' : 'bg-white border-gray-300'
              }`}>
                <div className="text-6xl mb-4">💎</div>
                <h3 className="text-2xl font-black uppercase font-montserrat">SIN RESULTADOS</h3>
                <p className="text-gray-400 mt-2 font-bold">Intenta buscar otro producto o categoría.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default CatalogoPublico