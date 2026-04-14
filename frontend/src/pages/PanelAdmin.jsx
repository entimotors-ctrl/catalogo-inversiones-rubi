import { useState, useEffect } from 'react'
import api from '../services/api'
import logo1 from '../assets/logo1.png'

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
    whatsapp: '',
    ubicacion: '', 
    password_admin: ''
  })

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [loading, setLoading] = useState(true)

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        api.get('/api/categorias').catch(() => ({ data: [] })),
        api.get('/api/productos').catch(() => ({ data: [] }))
      ])
      
      setCategorias(catRes.data)
      setProductos(prodRes.data)

      try {
        const configRes = await api.get('/api/configuracion')
        if (configRes.data) {
          setConfig({ 
            facebook: configRes.data.facebook || '',
            instagram: configRes.data.instagram || '',
            tiktok: configRes.data.tiktok || '',
            whatsapp: configRes.data.whatsapp || '',
            ubicacion: configRes.data.ubicacion || '', 
            password_admin: '' 
          })
        }
      } catch (e) {
        console.warn("Error al cargar configuración:", e)
      }
    } catch (error) {
      mostrarMensaje('Error al conectar con el servidor.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarDatos() }, [])

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000)
  }

  const handleCrearCategoria = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/categorias', { nombre: nombreCategoria })
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

      await api.post('/api/productos', formData);
      mostrarMensaje('¡Producto publicado!', 'exito');
      setNombreProducto(''); setPrecioProducto(''); setImagenArchivo(null); setDescripcionProducto('');
      cargarDatos();
    } catch (error) { mostrarMensaje('Error al crear producto.', 'error'); }
  }

  const handleEliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await api.delete(`/api/productos/${id}`);
      mostrarMensaje('Producto eliminado', 'exito');
      cargarDatos();
    } catch (error) { mostrarMensaje('No se pudo eliminar.', 'error'); }
  }

  const handleUpdateConfig = async (e) => {
    e.preventDefault()
    try {
      await api.put('/api/configuracion', config)
      mostrarMensaje('Configuración actualizada correctamente', 'exito')
      setConfig(prev => ({ ...prev, password_admin: '' }))
      cargarDatos()
    } catch (error) { mostrarMensaje('Error al actualizar ajustes.', 'error') }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth')
    window.location.href = '/login'
  }

  // ESTILOS MEJORADOS (MÁS ANCHOS Y ROBUSTOS)
  const inputStyle = "w-full px-6 py-4 rounded-2xl outline-none text-sm bg-black/60 text-white border border-white/10 focus:border-rose-600 transition-all placeholder:text-gray-500 font-medium";
  const cardStyle = "bg-zinc-900/80 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[2.5rem]";

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-rose-600 font-black tracking-widest text-xs animate-pulse uppercase">Cargando Sistema...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-6 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* HEADER */}
        <div className={`${cardStyle} p-8 flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className="flex items-center gap-6">
            <img src={logo1} alt="Rubi Logo" className="h-14 w-auto drop-shadow-2xl" />
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white/90">Panel <span className="text-rose-600">Admin</span></h1>
          </div>
          <div className="flex bg-black/40 p-2 rounded-2xl border border-white/10">
            <button onClick={() => setActiveTab('inventario')} className={`px-8 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === 'inventario' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>INVENTARIO</button>
            <button onClick={() => setActiveTab('manager')} className={`px-8 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === 'manager' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>AJUSTES</button>
          </div>
          <button onClick={handleLogout} className="text-gray-600 hover:text-rose-500 font-black text-xs uppercase tracking-[0.2em] transition-colors">Cerrar Sesión ✕</button>
        </div>

        {mensaje.texto && (
          <div className={`p-5 rounded-2xl font-bold text-center text-xs tracking-[0.3em] border ${mensaje.tipo === 'error' ? 'bg-rose-900/30 border-rose-500 text-rose-500' : 'bg-green-900/30 border-green-500 text-green-500'}`}>
            {mensaje.texto.toUpperCase()}
          </div>
        )}

        {activeTab === 'inventario' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* COLUMNA IZQUIERDA: FORMULARIOS */}
            <div className="lg:col-span-4 space-y-8">
              <div className={`${cardStyle} p-10`}>
                <h2 className="text-xs font-black uppercase text-rose-600 mb-10 tracking-[0.4em] flex items-center gap-3">
                   <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span> 
                   Publicar Producto
                </h2>
                <form onSubmit={handleCrearProducto} className="space-y-6">
                  <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputStyle}>
                    <option value="">Seleccionar Categoría...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre.toUpperCase()}</option>)}
                  </select>
                  <input type="text" required value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className={inputStyle} placeholder="Nombre del artículo" />
                  <input type="text" required value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} className={inputStyle} placeholder="Precio (Ej: L 4,800)" />
                  
                  {/* BOTÓN EXAMINAR ROJO PERSONALIZADO */}
                  <div className="relative">
                    <input 
                      type="file" 
                      id="file-upload"
                      onChange={(e) => setImagenArchivo(e.target.files[0])} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor="file-upload" 
                      className="flex items-center justify-center gap-3 w-full py-4.5 bg-rose-600 border-2 border-rose-600 rounded-2xl cursor-pointer hover:bg-rose-700 transition-all text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20"
                    >
                      {imagenArchivo ? '✅ IMAGEN LISTA' : '📂 EXAMINAR FOTO'}
                    </label>
                  </div>

                  <textarea rows="3" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} className={inputStyle} placeholder="Breve descripción..."></textarea>
                  <button className="w-full py-5 bg-rose-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] transition-all">Subir al Catálogo</button>
                </form>
              </div>

              <div className={`${cardStyle} p-10`}>
                <h2 className="text-xs font-black uppercase text-rose-600 mb-8 tracking-[0.4em]">Nueva Categoría</h2>
                <form onSubmit={handleCrearCategoria} className="space-y-5">
                  <input type="text" required value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} className={inputStyle} placeholder="Ej: Relojes, Joyas..." />
                  <button className="w-full py-4 bg-zinc-800 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/5 hover:bg-zinc-700 transition-colors">Crear Grupo</button>
                </form>
              </div>
            </div>

            {/* COLUMNA DERECHA: LISTADO */}
            <div className="lg:col-span-8">
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/40">
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/90">Listado de Inventario</h2>
                  <span className="text-xs bg-rose-600/20 text-rose-600 px-6 py-2 rounded-full font-black border border-rose-600/30">{productos.length} ARTÍCULOS</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest px-6">
                        <th className="pb-4 pl-6">Producto</th>
                        <th className="pb-4">Precio</th>
                        <th className="pb-4 text-right pr-6">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map(p => (
                        <tr key={p.id} className="bg-black/20 hover:bg-white/5 transition-all group rounded-2xl">
                          <td className="py-4 pl-6 rounded-l-2xl">
                            <div className="flex items-center gap-5">
                              <img src={p.imagen_url} className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-lg" alt="" />
                              <span className="font-bold uppercase text-xs tracking-tight">{p.nombre}</span>
                            </div>
                          </td>
                          <td className="py-4 font-black text-rose-600 text-sm">{p.precio}</td>
                          <td className="py-4 text-right pr-6 rounded-r-2xl">
                            <div className="flex justify-end gap-3">
                              {/* BOTÓN EDITAR (AZUL) */}
                              <button className="p-3 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                ✎
                              </button>
                              <button onClick={() => handleEliminarProducto(p.id)} className="p-3 bg-rose-600/10 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                                ✕
                              </button>
                            </div>
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
          /* PESTAÑA AJUSTES */
          <div className={`max-w-3xl mx-auto p-12 ${cardStyle}`}>
            <h2 className="text-2xl font-black uppercase italic mb-12 flex items-center gap-5 tracking-tighter">
              <span className="w-12 h-12 bg-rose-600/10 text-rose-600 rounded-2xl flex items-center justify-center not-italic border border-rose-600/20">⚙️</span>
              Configuración del Sistema
            </h2>
            <form onSubmit={handleUpdateConfig} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input type="text" value={config.facebook} onChange={e => setConfig({...config, facebook: e.target.value})} className={inputStyle} placeholder="Facebook URL" />
                <input type="text" value={config.instagram} onChange={e => setConfig({...config, instagram: e.target.value})} className={inputStyle} placeholder="Instagram URL" />
                <input type="text" value={config.tiktok} onChange={e => setConfig({...config, tiktok: e.target.value})} className={inputStyle} placeholder="TikTok URL" />
                <input type="text" value={config.whatsapp} onChange={e => setConfig({...config, whatsapp: e.target.value})} className={inputStyle} placeholder="WhatsApp (504...)" />
                <div className="md:col-span-2">
                  <input type="text" value={config.ubicacion} onChange={e => setConfig({...config, ubicacion: e.target.value})} className={inputStyle} placeholder="Link de Google Maps" />
                </div>
              </div>
              <input type="password" value={config.password_admin} onChange={e => setConfig({...config, password_admin: e.target.value})} className={inputStyle} placeholder="Nueva Contraseña (Opcional)" />
              <button type="submit" className="w-full py-5 bg-green-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all">Guardar Ajustes</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin;