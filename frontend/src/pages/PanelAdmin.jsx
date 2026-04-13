import { useState, useEffect } from 'react'
import api from '../services/api'

function PanelAdmin() {
  const [activeTab, setActiveTab] = useState('inventario')
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcionProducto, setDescripcionProducto] = useState('')
  const [precioProducto, setPrecioProducto] = useState('') 
  const [imagenArchivo, setImagenArchivo] = useState(null)
  const [categoriaId, setCategoriaId] = useState('')

  const [config, setConfig] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '50497432867',
    password_admin: ''
  })

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [loading, setLoading] = useState(true)

  const cargarDatos = async () => {
    try {
      // Cargamos productos y categorías con manejo de errores individual
      const [catRes, prodRes] = await Promise.all([
        api.get('/categorias').catch(() => ({ data: [] })),
        api.get('/productos').catch(() => ({ data: [] }))
      ])
      
      setCategorias(catRes.data)
      setProductos(prodRes.data)

      // Carga de configuración independiente
      try {
        const configRes = await api.get('/configuracion')
        if (configRes.data) {
          setConfig({ ...configRes.data, password_admin: '' })
        }
      } catch (e) {
        console.warn("La tabla de configuración no respondió.")
      }
    } catch (error) {
      mostrarMensaje('Error al conectar con el servidor.', 'error')
    } finally {
      setLoading(false)
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
      await api.post('/categorias', { nombre: nombreCategoria })
      mostrarMensaje('¡Categoría creada!', 'exito')
      setNombreCategoria('')
      cargarDatos()
    } catch (error) { mostrarMensaje('Error al crear categoría.', 'error') }
  }

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (!categoriaId) return mostrarMensaje('Selecciona una categoría', 'error');
    
    try {
      const formData = new FormData();
      formData.append('nombre', nombreProducto);
      formData.append('descripcion', descripcionProducto);
      formData.append('precio', precioProducto);
      formData.append('categoria_id', parseInt(categoriaId));
      if (imagenArchivo) formData.append('imagen', imagenArchivo);

      await api.post('/productos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      mostrarMensaje('¡Producto publicado!', 'exito');
      setNombreProducto(''); setPrecioProducto(''); setImagenArchivo(null); setDescripcionProducto('');
      cargarDatos();
    } catch (error) { mostrarMensaje('Error al crear producto.', 'error'); }
  }

  const handleEliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await api.delete(`/productos/${id}`);
      mostrarMensaje('Producto eliminado', 'exito');
      cargarDatos();
    } catch (error) { mostrarMensaje('No se pudo eliminar.', 'error'); }
  }

  const handleUpdateConfig = async (e) => {
    e.preventDefault()
    try {
      // Ajuste de ruta para coincidir con el backend
      await api.put('/configuracion', config)
      mostrarMensaje('Configuración actualizada correctamente', 'exito')
      setConfig(prev => ({ ...prev, password_admin: '' }))
      cargarDatos()
    } catch (error) {
      mostrarMensaje('Error al actualizar ajustes.', 'error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth')
    window.location.href = '/login'
  }

  const inputStyle = "w-full px-4 py-3 rounded-lg outline-none text-sm bg-white text-black border-2 border-gray-300 focus:border-rose-600 transition-all placeholder:text-gray-500 font-medium";

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-zinc-900 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-rose-900/20">🌹</div>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter">Rubi <span className="text-rose-600 italic">Admin</span></h1>
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">Gestión de Catálogo</p>
            </div>
          </div>
          
          <div className="flex bg-black/40 p-1.5 rounded-2xl gap-2">
            <button onClick={() => setActiveTab('inventario')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'inventario' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>INVENTARIO</button>
            <button onClick={() => setActiveTab('manager')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'manager' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>MANAGER</button>
          </div>

          <button onClick={handleLogout} className="text-gray-500 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-colors">Salir ✕</button>
        </div>

        {mensaje.texto && (
          <div className={`p-4 rounded-2xl font-bold text-center text-xs tracking-widest border animate-pulse ${mensaje.tipo === 'error' ? 'bg-rose-900/20 border-rose-500 text-rose-500' : 'bg-green-900/20 border-green-500 text-green-500'}`}>
            {mensaje.texto}
          </div>
        )}

        {activeTab === 'inventario' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
                <h2 className="text-sm font-black uppercase text-rose-600 mb-6 flex items-center gap-2">Nuevo Artículo</h2>
                <form onSubmit={handleCrearProducto} className="space-y-4">
                  <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputStyle}>
                    <option value="">Categoría...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                  <input type="text" required value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className={inputStyle} placeholder="Nombre del producto" />
                  <input type="text" required value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} className={inputStyle} placeholder="Precio (ej: L 500)" />
                  <input type="file" onChange={(e) => setImagenArchivo(e.target.files[0])} className="text-xs text-gray-500 file:bg-zinc-800 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4 cursor-pointer w-full" />
                  <textarea rows="2" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} className={inputStyle} placeholder="Descripción..."></textarea>
                  <button className="w-full py-4 bg-rose-600 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20 hover:scale-[1.02] transition-transform">Publicar Producto</button>
                </form>
              </div>

              <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
                <h2 className="text-sm font-black uppercase text-rose-600 mb-6">Añadir Categoría</h2>
                <form onSubmit={handleCrearCategoria} className="space-y-4">
                  <input type="text" required value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} className={inputStyle} placeholder="Nombre categoría" />
                  <button className="w-full py-3 bg-zinc-800 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/5">Guardar Grupo</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-sm font-black uppercase tracking-widest">Inventario Actual</h2>
                  <span className="text-[10px] bg-rose-600/20 text-rose-500 px-3 py-1 rounded-full font-black">{productos.length} ITEMS</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/20 text-gray-500 font-black uppercase">
                      <tr>
                        <th className="p-4">Producto</th>
                        <th className="p-4">Precio</th>
                        <th className="p-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {productos.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={p.imagen_url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover bg-white" alt="" />
                            <span className="font-bold uppercase">{p.nombre}</span>
                          </td>
                          <td className="p-4 font-black text-rose-600">{p.precio}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleEliminarProducto(p.id)} className="bg-rose-600/10 text-rose-500 p-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MANAGER */
          <div className="max-w-2xl mx-auto bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-2xl">
            <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
              <span className="w-8 h-8 bg-rose-600/20 text-rose-600 rounded-lg flex items-center justify-center not-italic">⚙️</span>
              Ajustes del Manager
            </h2>
            <form onSubmit={handleUpdateConfig} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Link Facebook</label>
                  <input type="text" value={config.facebook || ''} onChange={e => setConfig({...config, facebook: e.target.value})} className={inputStyle} placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Link Instagram</label>
                  <input type="text" value={config.instagram || ''} onChange={e => setConfig({...config, instagram: e.target.value})} className={inputStyle} placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Link TikTok</label>
                  <input type="text" value={config.tiktok || ''} onChange={e => setConfig({...config, tiktok: e.target.value})} className={inputStyle} placeholder="https://tiktok.com/@..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">WhatsApp de Ventas</label>
                  <input type="text" value={config.whatsapp || ''} onChange={e => setConfig({...config, whatsapp: e.target.value})} className={inputStyle} placeholder="504..." />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 block">Nueva Contraseña</label>
                <input type="password" value={config.password_admin || ''} onChange={e => setConfig({...config, password_admin: e.target.value})} className={inputStyle} placeholder="Solo si deseas cambiarla" />
              </div>

              <button className="w-full py-4 bg-green-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-900/20 hover:scale-[1.01] transition-transform">Actualizar Datos</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin