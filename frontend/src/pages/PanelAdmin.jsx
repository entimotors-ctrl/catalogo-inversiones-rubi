import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function PanelAdmin() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [temaVisual, setTemaVisual] = useState('general')
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null)
  const [productoEnEdicion, setProductoEnEdicion] = useState(null)
  const [loading, setLoading] = useState(true)

  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcionProducto, setDescripcionProducto] = useState('')
  const [precioProducto, setPrecioProducto] = useState('')
  const [imagenUrlProducto, setImagenUrlProducto] = useState('')
  const [categoriaIdProducto, setCategoriaIdProducto] = useState('')

  const obtenerCategorias = async () => {
    try {
      setLoading(true)
      const response = await api.get('/categorias')
      setCategorias(response.data || [])
      if ((response.data || []).length > 0 && !categoriaIdProducto) {
        setCategoriaIdProducto(response.data[0].id.toString())
      }
      setError('')
    } catch (err) {
      console.error("Error cargando categorías:", err)
      if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
        setError('❌ No puedo conectar al backend. ¿Está ejecutándose en puerto 3000?')
      } else {
        setError('No se pudieron cargar las categorías.')
      }
      setCategorias([])
    } finally {
      setLoading(false)
    }
  }

  const obtenerProductos = async () => {
    try {
      const response = await api.get('/productos')
      setProductos(response.data || [])
      setError('')
    } catch (err) {
      console.error("Error cargando productos:", err)
      if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
        setError('❌ No puedo conectar al backend. ¿Está ejecutándose en puerto 3000?')
      } else {
        setError('No se pudieron cargar los productos.')
      }
      setProductos([])
    }
  }

  const testConnection = async () => {
    try {
      console.log('🔍 Probando conexión al backend...')
      const response = await api.get('/test')
      console.log('✅ Conexión exitosa:', response.data)
      alert('Conexión al backend funciona: ' + JSON.stringify(response.data))
    } catch (err) {
      console.error('❌ Error de conexión:', err)
      alert('Error de conexión: ' + err.message)
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('auth')
    navigate('/login')
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        await obtenerCategorias()
        await obtenerProductos()
      } catch (err) {
        console.error('Error en useEffect:', err)
      }
    }
    cargarDatos()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('🔍 Intentando guardar categoría:', { nombre, temaVisual })

      const data = {
        nombre,
        tema_visual: temaVisual,
      }

      console.log('📤 Enviando datos:', data)

      if (categoriaEnEdicion) {
        await api.put(`/categorias/${categoriaEnEdicion}`, data)
        setMensaje('Categoría actualizada')
      } else {
        await api.post('/categorias', data)
        setMensaje('Categoría guardada')
      }

      setError('')
      setNombre('')
      setTemaVisual('general')
      setCategoriaEnEdicion(null)
      obtenerCategorias()
      setTimeout(() => setMensaje(''), 3000)
    } catch (err) {
      console.error('❌ Error completo:', err)
      console.error('Response data:', err.response?.data)
      console.error('Response status:', err.response?.status)
      setError('Error al guardar la categoría.')
      setMensaje('')
    }
  }

  const handleSubmitProducto = async (e) => {
    e.preventDefault()
    try {
      if (!categoriaIdProducto) {
        setError('Selecciona una categoría para el producto.')
        return
      }

      const data = {
        nombre: nombreProducto,
        descripcion: descripcionProducto,
        precio: parseFloat(precioProducto),
        imagen_url: imagenUrlProducto,
        categoria_id: parseInt(categoriaIdProducto, 10),
      }

      if (productoEnEdicion) {
        await api.put(`/productos/${productoEnEdicion}`, data)
        setMensaje('Producto actualizado')
      } else {
        await api.post('/productos', data)
        setMensaje('Producto guardado')
      }

      setError('')
      setNombreProducto('')
      setDescripcionProducto('')
      setPrecioProducto('')
      setImagenUrlProducto('')
      setCategoriaIdProducto(categorias.length > 0 ? categorias[0].id.toString() : '')
      setProductoEnEdicion(null)
      obtenerProductos()
      setTimeout(() => setMensaje(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Error al guardar el producto.')
      setMensaje('')
    }
  }

  const eliminarCategoria = async (id) => {
    if (!window.confirm('¿Estás seguro de borrar esta categoría?')) {
      return
    }
    try {
      await api.delete(`/categorias/${id}`)
      setMensaje('Categoría eliminada')
      setError('')
      obtenerCategorias()
      obtenerProductos()
      setTimeout(() => setMensaje(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Error al eliminar la categoría.')
      setMensaje('')
    }
  }

  const iniciarEdicionCategoria = (cat) => {
    setCategoriaEnEdicion(cat.id)
    setNombre(cat.nombre)
    setTemaVisual(cat.tema_visual || 'general')
    setMensaje('')
    setError('')
  }

  const iniciarEdicionProducto = (prod) => {
    setProductoEnEdicion(prod.id)
    setNombreProducto(prod.nombre)
    setDescripcionProducto(prod.descripcion)
    setPrecioProducto(prod.precio?.toString() || '')
    setImagenUrlProducto(prod.imagen_url || '')
    setCategoriaIdProducto(prod.categoria_id?.toString() || '')
    setMensaje('')
    setError('')
  }

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de borrar este producto?')) {
      return
    }
    try {
      await api.delete(`/productos/${id}`)
      setMensaje('Producto eliminado')
      setError('')
      obtenerProductos()
      setTimeout(() => setMensaje(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Error al eliminar el producto.')
      setMensaje('')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <div className="flex gap-2">
          <button
            onClick={testConnection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            Test Backend
          </button>
          <button
            onClick={cerrarSesion}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          ⏳ Cargando datos del servidor...
        </div>
      )}

      {mensaje && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded border border-green-300">
          ✅ {mensaje}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded border-2 border-red-300">
          <p className="font-bold mb-2">{error}</p>
          <details className="text-sm">
            <summary className="cursor-pointer text-red-700 underline">Ver instrucciones</summary>
            <div className="mt-2 bg-white p-2 rounded text-gray-700">
              <p>Para solucionar este error:</p>
              <ol className="list-decimal ml-5 mt-1">
                <li>Abre una terminal</li>
                <li>Ve a la carpeta backend: <code className="bg-gray-200 px-1">cd backend</code></li>
                <li>Inicia el servidor: <code className="bg-gray-200 px-1">node index.js</code></li>
                <li>Luego, haz clic en "Test Backend" para verificar</li>
              </ol>
            </div>
          </details>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Crear nueva categoría</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tema Visual</label>
            <select
              value={temaVisual}
              onChange={(e) => setTemaVisual(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="ferreteria">Ferretería</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {categoriaEnEdicion ? 'Actualizar Categoría' : 'Guardar Categoría'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Listado de categorías</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 font-medium text-gray-700">Nombre</th>
                <th className="px-4 py-2 font-medium text-gray-700">Tema Visual</th>
                <th className="px-4 py-2 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-2" colSpan="4">Cargando categorías...</td>
                </tr>
              ) : !categorias || categorias.length === 0 ? (
                <tr>
                  <td className="px-4 py-2" colSpan="4">No hay categorías aún.</td>
                </tr>
              ) : (
                categorias.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">{cat.id}</td>
                    <td className="px-4 py-2 font-semibold">{cat.nombre}</td>
                    <td className="px-4 py-2">{cat.tema_visual || 'general'}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => iniciarEdicionCategoria(cat)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarCategoria(cat.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Añadir Nuevo Producto</h2>

        <form onSubmit={handleSubmitProducto} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={descripcionProducto}
              onChange={(e) => setDescripcionProducto(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              type="number"
              step="0.01"
              value={precioProducto}
              onChange={(e) => setPrecioProducto(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen URL</label>
            <input
              type="text"
              value={imagenUrlProducto}
              onChange={(e) => setImagenUrlProducto(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={categoriaIdProducto}
              onChange={(e) => setCategoriaIdProducto(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Selecciona una categoría</option>
              {(categorias || []).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {productoEnEdicion ? 'Actualizar Producto' : 'Guardar Producto'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Listado de productos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 font-medium text-gray-700">Nombre</th>
                <th className="px-4 py-2 font-medium text-gray-700">Precio</th>
                <th className="px-4 py-2 font-medium text-gray-700">Categoría</th>
                <th className="px-4 py-2 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td className="px-4 py-2" colSpan="4">No hay productos aún.</td>
                </tr>
              ) : (
                productos?.map((prod) => (
                  <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{prod.nombre}</td>
                    <td className="px-4 py-2">$ {Number(prod.precio).toFixed(2)}</td>
                    <td className="px-4 py-2">{prod.categoria_nombre || 'Sin categoría'}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => iniciarEdicionProducto(prod)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarProducto(prod.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PanelAdmin
