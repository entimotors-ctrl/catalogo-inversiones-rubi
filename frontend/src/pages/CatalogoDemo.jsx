import { useState } from 'react'

function CatalogoDemo() {
  const [categoriaActiva, setCategoriaActiva] = useState('ferreteria')
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  // Datos hardcodeados para demostración
  const categorias = [
    { id: 'ferreteria', nombre: 'Ferretería', icon: '🔨' },
    { id: 'hogar', nombre: 'Hogar', icon: '🏠' },
    { id: 'automotriz', nombre: 'Automotriz', icon: '🚗' },
  ]

  const productos = [
    // Ferretería
    {
      id: 1,
      nombre: 'Martillo Truper',
      precio: 'L 24.99',
      categoria: 'ferreteria',
      imagen: 'https://via.placeholder.com/300x300?text=Martillo',
      descripcion: 'Martillo de acero templado profesional',
    },
    {
      id: 2,
      nombre: 'Sierra Circular',
      precio: 'L 89.99',
      categoria: 'ferreteria',
      imagen: 'https://via.placeholder.com/300x300?text=Sierra',
      descripcion: 'Sierra circular de alta potencia 2000W',
    },
    {
      id: 3,
      nombre: 'Set de Destornilladores',
      precio: 'L 34.50',
      categoria: 'ferreteria',
      imagen: 'https://via.placeholder.com/300x300?text=Destornilladores',
      descripcion: 'Set completo de 12 destornilladores',
    },
    {
      id: 4,
      nombre: 'Taladro Inalámbrico',
      precio: 'L 199.99',
      categoria: 'ferreteria',
      imagen: 'https://via.placeholder.com/300x300?text=Taladro',
      descripcion: 'Taladro a batería 20V con 2 baterías',
    },
    {
      id: 5,
      nombre: 'Caja de Herramientas',
      precio: 'L 65.00',
      categoria: 'ferreteria',
      imagen: 'https://via.placeholder.com/300x300?text=CajaHerramientas',
      descripcion: 'Caja de metal con organizador interior',
    },
    {
      id: 6,
      nombre: 'Escalera Aluminio 6 escalones',
      precio: 'L 145.50',
      categoria: 'ferreteria',
      imagen: 'https://via.placeholder.com/300x300?text=Escalera',
      descripcion: 'Escalera de aluminio resistente y ligera',
    },
    {
      id: 7,
      nombre: 'Juego de Llaves Inglesas',
      precio: 'L 85.99',
      categoria: 'ferreteria',
      imagen: 'https://via.placeholder.com/300x300?text=Llaves',
      descripcion: 'Set de 8 llaves inglesas cromadas',
    },
    // Hogar
    {
      id: 8,
      nombre: 'Pintura Blanca Premium',
      precio: 'L 45.00',
      categoria: 'hogar',
      imagen: 'https://via.placeholder.com/300x300?text=Pintura',
      descripcion: 'Pintura mate blanca de alta cobertura',
    },
    {
      id: 9,
      nombre: 'Lámpara LED Inteligente',
      precio: 'L 52.99',
      categoria: 'hogar',
      imagen: 'https://via.placeholder.com/300x300?text=Lampara',
      descripcion: 'Lámpara LED RGB con control remoto',
    },
    {
      id: 10,
      nombre: 'Cortinas Blackout',
      precio: 'L 78.50',
      categoria: 'hogar',
      imagen: 'https://via.placeholder.com/300x300?text=Cortinas',
      descripcion: 'Cortinas oscurecentes 2x2.5 metros',
    },
    {
      id: 11,
      nombre: 'Espejo Decorativo',
      precio: 'L 65.00',
      categoria: 'hogar',
      imagen: 'https://via.placeholder.com/300x300?text=Espejo',
      descripcion: 'Espejo de pared marco dorado 60x40cm',
    },
    {
      id: 12,
      nombre: 'Ventilador de Techo',
      precio: 'L 125.99',
      categoria: 'hogar',
      imagen: 'https://via.placeholder.com/300x300?text=Ventilador',
      descripcion: 'Ventilador de techo con luz integrada',
    },
    {
      id: 13,
      nombre: 'Alfombra Premium',
      precio: 'L 95.00',
      categoria: 'hogar',
      imagen: 'https://via.placeholder.com/300x300?text=Alfombra',
      descripcion: 'Alfombra de lana 2x3 metros',
    },
    {
      id: 14,
      nombre: 'Juego de Almohadas',
      precio: 'L 55.99',
      categoria: 'hogar',
      imagen: 'https://via.placeholder.com/300x300?text=Almohadas',
      descripcion: 'Set de 4 almohadas decorativas',
    },
    // Automotriz
    {
      id: 15,
      nombre: 'Aceite para Motor 10W40',
      precio: 'L 18.75',
      categoria: 'automotriz',
      imagen: 'https://via.placeholder.com/300x300?text=Aceite',
      descripcion: 'Aceite sintético de calidad superior',
    },
    {
      id: 16,
      nombre: 'Batería de Auto 12V 100Ah',
      precio: 'L 189.99',
      categoria: 'automotriz',
      imagen: 'https://via.placeholder.com/300x300?text=Bateria',
      descripcion: 'Batería automotriz de largo rendimiento',
    },
    {
      id: 17,
      nombre: 'Llantas 185/60R15',
      precio: 'L 299.00',
      categoria: 'automotriz',
      imagen: 'https://via.placeholder.com/300x300?text=Llantas',
      descripcion: 'Llantas de calidad premium para sedán',
    },
    {
      id: 18,
      nombre: 'Filtro de Aire Automotriz',
      precio: 'L 25.50',
      categoria: 'automotriz',
      imagen: 'https://via.placeholder.com/300x300?text=FiltroAire',
      descripcion: 'Filtro de aire reemplazable OEM',
    },
    {
      id: 19,
      nombre: 'Bujías Estándar Set x4',
      precio: 'L 32.99',
      categoria: 'automotriz',
      imagen: 'https://via.placeholder.com/300x300?text=Bujias',
      descripcion: 'Set de 4 bujías de ignitión',
    },
    {
      id: 20,
      nombre: 'Acumulador de Carga',
      precio: 'L 75.00',
      categoria: 'automotriz',
      imagen: 'https://via.placeholder.com/300x300?text=Acumulador',
      descripcion: 'Cargador de batería inteligente 12V',
    },
  ]

  // Filtrar productos
  const productosFiltrados = productos.filter(
    (producto) => producto.categoria === categoriaActiva
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* ========== HEADER PROFESIONAL ========== */}
      <header className={`sticky top-0 z-50 bg-gradient-to-r from-[#002855] to-[#004080] shadow-lg transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>
              ✨ Inversiones Rubí - Catálogo Virtual
            </h1>

            {/* Botón Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full transition-all duration-300 ${
                darkMode
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Buscador Centrado */}
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="🔍 Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-lg px-6 py-3 rounded-full border-2 border-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
              style={{ fontFamily: 'Inter, Roboto, sans-serif' }}
            />
          </div>

          {/* Badge de Demo */}
          <div className="mt-3 text-center">
            <span className="inline-block bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-1 rounded-full text-xs font-bold">
              ✨ MAQUETA INVERSIONES RUBÍ ✨
            </span>
          </div>
        </div>
      </header>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <div className={`max-w-7xl mx-auto px-4 py-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex gap-8">
          {/* ========== SIDEBAR CATEGORÍAS ========== */}
          <aside className="w-48 flex-shrink-0">
            <div className={`sticky top-32 rounded-xl border-2 shadow-sm p-6 transition-all duration-300 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                darkMode ? 'text-purple-400' : 'text-[#002855]'
              }`} style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>
                Categorías
              </h2>

              <nav className="space-y-2">
                {categorias.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => setCategoriaActiva(categoria.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      categoriaActiva === categoria.id
                        ? 'bg-[#002855] text-white shadow-md'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={{ fontFamily: 'Inter, Roboto, sans-serif' }}
                  >
                    <span className="text-xl">{categoria.icon}</span>
                    <span>{categoriaActiva === categoria.id ? '✓ ' : '• '}{categoria.nombre}</span>
                  </button>
                ))}
              </nav>

              {/* Info adicional */}
              <div className={`mt-8 p-4 rounded-lg border transition-all duration-300 ${
                darkMode
                  ? 'bg-purple-900 border-purple-700'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-xs font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-purple-200' : 'text-blue-900'
                }`}>💡 Demo Profesional</p>
                <p className={`text-xs mt-1 transition-colors duration-300 ${
                  darkMode ? 'text-purple-300' : 'text-blue-700'
                }`}>Diseño minimalista para Inversiones Rubí</p>
              </div>
            </div>
          </aside>

          {/* ========== GRID DE PRODUCTOS ========== */}
          <main className={`flex-1 transition-colors duration-300`}>
            {/* Encabezado de sección */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`} style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>
                  {categorias.find((c) => c.id === categoriaActiva)?.nombre}
                </h2>
                <p className={`text-sm mt-1 transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Mostrando <span className="font-bold text-[#002855]">{productosFiltrados.length}</span> productos
                </p>
              </div>

              {/* Badge categoría */}
              <div className="bg-gradient-to-r from-[#002855] to-[#004080] text-white px-6 py-3 rounded-lg">
                <p className="font-bold text-lg">{categorias.find((c) => c.id === categoriaActiva)?.icon}</p>
              </div>
            </div>

            {/* Grid de Tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  className={`group rounded-xl overflow-hidden border-2 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-100'
                  }`}
                  style={{ fontFamily: 'Inter, Roboto, sans-serif' }}
                >
                  {/* Imagen del Producto */}
                  <div className="relative overflow-hidden bg-gray-200 aspect-square">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Badge descuento simulado */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      DEMO
                    </div>
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="p-4">
                    {/* Nombre del Producto */}
                    <h3 className={`font-bold mb-2 line-clamp-2 text-sm transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`} style={{ fontWeight: 600 }}>
                      {producto.nombre}
                    </h3>

                    {/* Descripción */}
                    <p className={`text-xs mb-3 line-clamp-2 transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {producto.descripcion}
                    </p>

                    {/* Separador */}
                    <div className={`mb-4 pb-4 border-b transition-colors duration-300 ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}></div>

                    {/* Precio Destacado */}
                    <p className="text-3xl font-bold text-[#002855] mb-4" style={{ fontWeight: 700 }}>
                      {producto.precio}
                    </p>

                    {/* Botón WhatsApp */}
                    <button
                      className="w-full bg-[#25D366] hover:bg-[#20a856] text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-95"
                      onClick={() => {
                        // Simular abrir WhatsApp
                        alert(`💬 WhatsApp abierto para: ${producto.nombre}\nPrecio: ${producto.precio}`);
                      }}
                    >
                      <span>💬</span>
                      <span>Consultar Disponibilidad</span>
                    </button>

                    {/* Info stock simulada */}
                    <p className="text-xs text-green-600 mt-3 text-center font-semibold">
                      ✓ Stock disponible
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje si no hay productos */}
            {productosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-xl transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No hay productos en esta categoría
                </p>
              </div>
            )}

            {/* Footer Info Demo */}
            <div className={`mt-12 p-8 rounded-xl border-2 border-dashed transition-all duration-300 ${
              darkMode
                ? 'bg-gray-800 border-gray-600'
                : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
            }`}>
              <div className="text-center">
                <p className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-purple-300' : 'text-blue-900'
                }`}>🎨 MAQUETA MINIMALISTA PROFESIONAL</p>
                <p className={`text-xs transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Diseño elegante y limpio para Inversiones Rubí
                </p>
                <div className="mt-4 flex justify-center gap-3 flex-wrap">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                    darkMode
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-blue-200 text-blue-900'
                  }`}>
                    ✓ Dark Mode
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                    darkMode
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-blue-200 text-blue-900'
                  }`}>
                    ✓ Minimalista
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                    darkMode
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-blue-200 text-blue-900'
                  }`}>
                    ✓ Responsive
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                    darkMode
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-blue-200 text-blue-900'
                  }`}>
                    ✓ Lempiras
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ========== ESTILOS PERSONALIZADOS ========== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap');

        /* Scrollbar personalizado */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #002855;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #004080;
        }

        /* Line clamp fallback */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default CatalogoDemo
