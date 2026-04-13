import { useState, useEffect } from 'react'
import api from '../services/api'

function PanelAdmin() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [temaVisual, setTemaVisual] = useState('general')
  
  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcionProducto, setDescripcionProducto] = useState('')
  const [precioProducto, setPrecioProducto] = useState('') // Ahora es texto
  const [imagenArchivo, setImagenArchivo] = useState(null)
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
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', nombreProducto);
      formData.append('descripcion', descripcionProducto);
      // Enviamos el precio como texto para permitir variantes (ej. Clavos)
      formData.append('precio', precioProducto);
      formData.append('categoria_id', parseInt(categoriaId));
      if (imagenArchivo) {
        formData.append('imagen', imagenArchivo);
      }

      await api.post('/productos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      mostrarMensaje('¡Producto creado con éxito!', 'exito');
      setNombreProducto('');
      setDescripcionProducto('');
      setPrecioProducto('');
      setImagenArchivo(null);
      setCategoriaId('');
      cargarDatos();
    } catch (error) {
      mostrarMensaje('Error al crear el producto.', 'error');
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

  // Estilo común para todos los inputs para asegurar visibilidad
  const inputStyle = "w-full px-4 py-3 rounded-lg outline-none text-sm bg-white text-black border-2 border-gray-300 focus:border-rose-600 transition-all placeholder:text-gray-500 font-medium";

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABECERA */}
        <div className="bg-zinc-900/50 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-l-4 border-l-rose-600 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="text-4xl text-rose-600">🌹</div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">
                Panel de <span className="text-rose-600">Control</span>
              </h1>
              <p className="text-gray-400 font-bold tracking-widest text-sm mt-1">INVERSIONES RUBI - GESTIÓN PROFESIONAL</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all uppercase tracking-wider text-sm"
          >
            Cerrar Sesión ✕
          </button>
        </div>

        {/* MENSAJES */}
        {mensaje.texto && (
          <div className={`p-4 rounded-xl font-bold uppercase tracking-wider text-sm border ${
            mensaje.tipo === 'error' 
              ? 'bg-rose-900/50 border-rose-500 text-rose-200' 
              : 'bg-green-900/50 border-green-500 text-green-200'
          }`}>
            {mensaje.tipo === 'error' ? '⚠️ ' : '✅ '} {mensaje.texto}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
            
            {/* NUEVA CATEGORÍA */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
              <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                <span className="text-rose-600">📁</span> Nueva Categoría
              </h2>
              <form onSubmit={handleCrearCategoria} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nombreCategoria}
                    onChange={(e) => setNombreCategoria(e.target.value)}
                    className={inputStyle}
                    placeholder="Ej. Herramientas Eléctricas"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-black uppercase tracking-wider transition-all text-sm">
                  Guardar Categoría
                </button>
              </form>
            </div>

            {/* NUEVO PRODUCTO */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
              <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                <span className="text-rose-600">📦</span> Nuevo Producto
              </h2>
              <form onSubmit={handleCrearProducto} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categoría</label>
                  <select
                    required
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="" className="text-gray-500">-- Seleccionar --</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
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
                    className={inputStyle}
                    placeholder="Nombre del artículo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Precio / Variantes</label>
                  <input
                    type="text"
                    required
                    value={precioProducto}
                    onChange={(e) => setPrecioProducto(e.target.value)}
                    className={inputStyle}
                    placeholder="Ej: 10.00 o 1': L5 | 2': L10"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Foto</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagenArchivo(e.target.files[0])}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</label>
                  <textarea
                    rows="3"
                    value={descripcionProducto}
                    onChange={(e) => setDescripcionProducto(e.target.value)}
                    className={inputStyle}
                    placeholder="Detalles adicionales..."
                  ></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-black uppercase tracking-wider transition-all text-sm">
                  Publicar en Catálogo
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* TABLA CATEGORÍAS */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
              <h2 className="text-xl font-black uppercase mb-6">Categorías</h2>
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
                      <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-4 font-bold">{cat.nombre}</td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => handleEliminarCategoria(cat.id)} className="text-rose-500 hover:text-rose-400 font-bold text-xs uppercase">
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
            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
              <h2 className="text-xl font-black uppercase mb-6">Inventario</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-400 uppercase bg-black/40">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Producto</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(prod => (
                      <tr key={prod.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {prod.imagen_url ? (
                              <img src={prod.imagen_url} alt="" className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-xs">📷</div>
                            )}
                            <span className="font-bold">{prod.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-black text-rose-500">{prod.precio}</td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => handleEliminarProducto(prod.id)} className="text-rose-500 hover:text-rose-400 font-bold text-xs uppercase">
                            Borrar ✕
                          </button>
                        </td>
                      </tr>
                    ))}
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