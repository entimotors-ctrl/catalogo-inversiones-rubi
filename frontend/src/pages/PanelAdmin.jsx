import { useState, useEffect } from 'react'
import api from '../services/api'

function PanelAdmin() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  
  // Estados para nueva categoría
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [temaVisual, setTemaVisual] = useState('general')
  
  // Estados para nuevo producto
  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcionProducto, setDescripcionProducto] = useState('')
  const [precioProducto, setPrecioProducto] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [categoriaId, setCategoriaId] = useState('')

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })

  const cargarDatos = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categorias'),
        api.get('/productos')
      ])
      setCategorias(catRes.data)
      setProductos(prodRes.data)
    } catch (error) {
      mostrarMensaje('Error al cargar los datos del servidor.', 'error')
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000)
  }

  const handleCrearCategoria = async (e) => {
    e.preventDefault()
    try {
      await api.post('/categorias', {
        nombre: nombreCategoria,
        tema_visual: temaVisual
      })
      mostrarMensaje('¡Categoría creada con éxito!', 'exito')
      setNombreCategoria('')
      cargarDatos()
    } catch (error) {
      mostrarMensaje('Error al crear la categoría.', 'error')
    }
  }

  const handleCrearProducto = async (e) => {
    e.preventDefault()
    try {
      await api.post('/productos', {
        nombre: nombreProducto,
        descripcion: descripcionProducto,
        precio: parseFloat(precioProducto),
        imagen_url: imagenUrl,
        categoria_id: parseInt(categoriaId)
      })
      mostrarMensaje('¡Producto creado con éxito!', 'exito')
      setNombreProducto('')
      setDescripcionProducto('')
      setPrecioProducto('')
      setImagenUrl('')
      setCategoriaId('')
      cargarDatos()
    } catch (error) {
      mostrarMensaje('Error al crear el producto.', 'error')
    }
  }

  const handleEliminarProducto = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await api.delete(`/productos/${id}`)
        mostrarMensaje('Producto eliminado.', 'exito')
        cargarDatos()
      } catch (error) {
        mostrarMensaje('Error al eliminar el producto.', 'error')
      }
    }
  }

  const handleEliminarCategoria = async (id) => {
    if (window.confirm('¿Eliminar categoría? Los productos asociados también se borrarán.')) {
      try {
        await api.delete(`/categorias/${id}`)
        mostrarMensaje('Categoría eliminada.', 'exito')
        cargarDatos()
      } catch (error) {
        mostrarMensaje('Error al eliminar la categoría.', 'error')
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-glassblack-theme text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABECERA DEL PANEL */}
        <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-l-4 border-l-red-600">
          <div>
            <h1 className="text-3xl font-black uppercase font-montserrat tracking-tight">
              Panel de <span className="text-red-600">Control</span>
            </h1>
            <p className="text-gray-400 font-bold tracking-widest text-sm mt-1">INVERSIONES RUBI - SISTEMA DE GESTIÓN</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 rounded-xl font-bold transition-all uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
          >
            Cerrar Sesión ✕
          </button>
        </div>

        {/* ALERTAS */}
        {mensaje.texto && (
          <div className={`p-4 rounded-xl font-bold uppercase tracking-wider text-sm animate-enter border ${
            mensaje.tipo === 'error' 
              ? 'bg-red-900/50 border-red-500 text-red-200' 
              : 'bg-green-900/50 border-green-500 text-green-200'
          }`}>
            {mensaje.tipo === 'error' ? '⚠️ ' : '✅ '} {mensaje.texto}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA - FORMULARIOS */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* FORMULARIO DE CATEGORÍAS */}
            <div className="glass-panel p-6 rounded-2xl border-t border-white/10">
              <h2 className="text-xl font-black uppercase font-montserrat mb-6 flex items-center gap-2">
                <span className="text-red-600">📁</span> Nueva Categoría
              </h2>
              <form onSubmit={handleCrearCategoria} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre de categoría</label>
                  <input
                    type="text"
                    required
                    value={nombreCategoria}
                    onChange={(e) => setNombreCategoria(e.target.value)}
                    className="search-input w-full px-4 py-3 rounded-lg outline-none text-sm"
                    placeholder="Ej. Herramientas..."
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-black uppercase tracking-wider transition-all text-sm">
                  Guardar Categoría
                </button>
              </form>
            </div>

            {/* FORMULARIO DE PRODUCTOS */}
            <div className="glass-panel p-6 rounded-2xl border-t border-white/10">
              <h2 className="text-xl font-black uppercase font-montserrat mb-6 flex items-center gap-2">
                <span className="text-red-600">📦</span> Nuevo Producto
              </h2>
              <form onSubmit={handleCrearProducto} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categoría</label>
                  <select
                    required
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="search-input w-full px-4 py-3 rounded-lg outline-none text-sm appearance-none"
                  >
                    <option value="">-- Seleccionar --</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nombreProducto}
                    onChange={(e) => setNombreProducto(e.target.value)}
                    className="search-input w-full px-4 py-3 rounded-lg outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Precio (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={precioProducto}
                    onChange={(e) => setPrecioProducto(e.target.value)}
                    className="search-input w-full px-4 py-3 rounded-lg outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">URL de Imagen</label>
                  <input
                    type="url"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    className="search-input w-full px-4 py-3 rounded-lg outline-none text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</label>
                  <textarea
                    rows="3"
                    value={descripcionProducto}
                    onChange={(e) => setDescripcionProducto(e.target.value)}
                    className="search-input w-full px-4 py-3 rounded-lg outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <button type="submit" className="btn-whatsapp w-full py-3 rounded-lg font-black text-white uppercase tracking-wider transition-all text-sm border-none">
                  Guardar Producto
                </button>
              </form>
            </div>
          </div>

          {/* COLUMNA DERECHA - TABLAS DE DATOS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* TABLA CATEGORÍAS */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-black uppercase font-montserrat mb-6">Categorías Registradas</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-400 uppercase bg-black/40">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Nombre</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map(cat => (
                      <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-bold">{cat.nombre}</td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => handleEliminarCategoria(cat.id)} className="text-red-500 hover:text-red-400 font-bold uppercase text-xs tracking-wider">
                            Eliminar ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLA PRODUCTOS */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-black uppercase font-montserrat mb-6">Inventario de Productos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-400 uppercase bg-black/40">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Producto</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3">Categoría</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(prod => {
                      const cat = categorias.find(c => c.id === prod.categoria_id)
                      return (
                        <tr key={prod.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {prod.imagen_url ? (
                                <img src={prod.imagen_url} alt="" className="w-10 h-10 rounded object-cover border border-white/10" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-xs">📷</div>
                              )}
                              <span className="font-bold line-clamp-1">{prod.nombre}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-black text-red-500 font-montserrat">L {Number(prod.precio).toFixed(2)}</td>
                          <td className="px-4 py-4 text-gray-400">{cat ? cat.nombre : 'N/A'}</td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => handleEliminarProducto(prod.id)} className="text-red-500 hover:text-red-400 font-bold uppercase text-xs tracking-wider">
                              Borrar ✕
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default PanelAdmin