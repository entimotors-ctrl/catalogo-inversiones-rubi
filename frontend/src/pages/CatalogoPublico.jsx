import { useState, useEffect } from 'react'
import api from '../services/api'

function CatalogoPublico() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)
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
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header Profesional Tipo PriceSmart */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#002855] to-[#004080] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Fila Superior: Logo + Botón Dark */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-white">📦</div>
              <div>
                <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>
                  CLUB DE COMPRAS
                </h1>
                <p className="text-xs text-blue-100 font-medium">Tu tienda digital de confianza</p>
              </div>
            </div>
            
            {/* Botón Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full transition-all duration-300 shadow-md ${
                darkMode
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 hover:shadow-lg'
                  : 'bg-white text-[#002855] hover:bg-blue-50 hover:shadow-lg'
              }`}
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          {/* Buscador Grande y Prominente */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="🔍 Buscar productos por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 rounded-full border-2 border-white bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-white transition-all shadow-md font-medium"
                style={{ fontFamily: 'Inter, Roboto, sans-serif', fontSize: '16px' }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 py-12 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar de Categorías - Estilo PriceSmart */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className={`sticky top-32 rounded-2xl border-2 shadow-md p-8 transition-all duration-300 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-black mb-6 transition-colors duration-300 pb-4 border-b-2 ${
                darkMode ? 'text-purple-300 border-purple-600' : 'text-[#002855] border-blue-200'
              }`} style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px' }}>
                CATEGORÍAS
              </h2>
              <nav className="space-y-3">
                <button
                  onClick={() => setCategoriaActiva(null)}
                  className={`w-full text-left px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
                    categoriaActiva === null
                      ? 'bg-[#002855] text-white shadow-lg scale-105'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.3px' }}
                >
                  <span className="text-lg">📦</span>
                  <span>{categoriaActiva === null ? '✓ Todos' : 'Todos'}</span>
                </button>
                {categorias?.map((categoria, idx) => {
                  const isActive = categoriaActiva && Number(categoriaActiva.id) === Number(categoria.id)
                  const icons = ['🔨', '🏠', '🚗', '⚙️', '🛠️']
                  const icon = icons[idx % icons.length]
                  return (
                    <button
                      key={categoria.id}
                      onClick={() => setCategoriaActiva(categoria)}
                      className={`w-full text-left px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 transform ${
                        isActive
                          ? 'bg-gradient-to-r from-[#002855] to-[#004080] text-white shadow-lg scale-105'
                          : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                          : 'text-gray-700 hover:bg-blue-50 hover:translate-x-1'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.3px' }}
                    >
                      <span className="text-lg">{icon}</span>
                      <span>{isActive ? '✓ ' : ''}{categoria.nombre}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Grid de Productos - Estilo PriceSmart */}
          <main className="flex-1">
            {/* Header de Productos */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-black transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-[#002855]'
                  }`} style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>
                    {categoriaActiva ? `${categoriaActiva.nombre.toUpperCase()}` : 'TODOS LOS PRODUCTOS'}
                  </h2>
                  <p className={`text-sm mt-2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Mostrando <span className="font-bold text-[#002855] text-lg">{productosFiltrados.length}</span> producto{productosFiltrados.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className={`text-2xl font-black transition-colors duration-300 ${
                  darkMode ? 'text-purple-400' : 'text-blue-200'
                }`}>
                  {productosFiltrados.length > 0 ? '✓' : '○'}
                </div>
              </div>
            </div>

            {/* Grid de Tarjetas - Espaciado Generoso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {productosFiltrados?.map((producto) => (
                <div
                  key={producto.id}
                  className={`group relative rounded-2xl overflow-hidden border-3 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 cursor-pointer ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                      : 'bg-white border-white hover:border-blue-300'
                  }`}
                  style={{ fontFamily: 'Inter, Roboto, sans-serif' }}
                >
                  {/* Badge NEW */}
                  <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    📌 DISPONIBLE
                  </div>

                  {/* Imagen con Overlay */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 aspect-square">
                    {producto.imagen_url ? (
                      <img 
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
                        📷
                      </div>
                    )}
                    {/* Overlay oscuro en hover */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>

                  {/* Contenido - Más Espaciado */}
                  <div className="p-6 flex flex-col h-full">
                    {/* Nombre - Más Grande */}
                    <h3 className={`font-black text-lg mb-3 line-clamp-2 transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`} style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px' }}>
                      {producto.nombre}
                    </h3>

                    {/* Descripción */}
                    <p className={`text-sm mb-4 line-clamp-2 flex-grow transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {producto.descripcion}
                    </p>

                    {/* Separador */}
                    <div className={`my-4 border-t-2 transition-colors duration-300 ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}></div>

                    {/* Precio Destacado - GRANDE Y PROMINENTE */}
                    <div className="mb-6">
                      <p className="text-xs text-gray-500 mb-1 font-bold">PRECIO ESPECIAL</p>
                      <p className="text-4xl font-black text-[#002855] leading-tight" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>
                        L {Number(producto.precio).toFixed(2)}
                      </p>
                    </div>

                    {/* Botón WhatsApp - DESTACADO */}
                    <a
                      href={`https://wa.me/${numeroWhatsApp}?text=Hola, me interesa el producto: *${producto.nombre}* - L${producto.precio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-[#25D366] to-[#20a856] hover:from-[#20a856] hover:to-[#1a8c4a] text-white font-black py-4 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-base shadow-lg hover:shadow-2xl transform hover:scale-105"
                    >
                      <span className="text-2xl">💬</span>
                      <span>CONSULTAR</span>
                    </a>

                    {/* Stock Indicator */}
                    <p className="text-xs text-green-600 mt-3 text-center font-bold">
                      ✓ En Stock
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje si no hay productos */}
            {productosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-xl transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>
                  No encontramos productos que coincidan con tu búsqueda.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default CatalogoPublico
