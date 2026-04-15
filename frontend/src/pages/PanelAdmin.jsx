import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import logo1 from '../assets/logo1.png'

function PanelAdmin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inventario')
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  // Estado del formulario de producto mejorado
  const [productoForm, setProductoForm] = useState({ 
    nombre: '', 
    descripcion: '', 
    precio: '', 
    categoria_id: '' 
  })
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', tema_visual: 'general' })
  const [imagenArchivo, setImagenArchivo] = useState(null)

  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null)
  const [productoEnEdicion, setProductoEnEdicion] = useState(null)
  const [config, setConfig] = useState({ facebook: '', instagram: '', tiktok: '', whatsapp: '', ubicacion: '', password_admin: '' })

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) navigate('/login')
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [catRes, prodRes, configRes] = await Promise.all([
        api.get('/categorias'),
        api.get('/productos'),
        api.get('/configuracion').catch(() => ({ data: null }))
      ])
      setCategorias(catRes.data)
      setProductos(prodRes.data)
      if (configRes?.data) setConfig({ ...configRes.data, password_admin: '' })
    } catch (err) {
      setError('Error de conexión con el servidor.')
    } finally { setLoading(false) }
  }

  const mostrarMensaje = (texto, tipo = 'exito') => {
    if (tipo === 'exito') {
      setMensaje(texto)
      setError('')
    } else {
      setError(texto)
      setMensaje('')
    }
    setTimeout(() => { setMensaje(''); setError(''); }, 5000)
  }

  const handleSubmitProducto = async (e) => {
    e.preventDefault()
    
    // Validación de seguridad antes de enviar
    if (!productoForm.categoria_id) {
      return mostrarMensaje('DEBES SELECCIONAR UNA CATEGORÍA', 'error')
    }

    try {
      const formData = new FormData()
      formData.append('nombre', productoForm.nombre)
      formData.append('descripcion', productoForm.descripcion || '')
      formData.append('precio', productoForm.precio)
      formData.append('categoria_id', productoForm.categoria_id)
      
      if (imagenArchivo) {
        formData.append('imagen', imagenArchivo)
      }

      if (productoEnEdicion) {
        await api.put(`/productos/${productoEnEdicion}`, formData)
        mostrarMensaje('PRODUCTO ACTUALIZADO CORRECTAMENTE')
      } else {
        await api.post('/productos', formData)
        mostrarMensaje('PRODUCTO GUARDADO EN EL CATÁLOGO')
      }

      // Limpiar formulario tras éxito
      setProductoForm({ nombre: '', descripcion: '', precio: '', categoria_id: '' })
      setImagenArchivo(null)
      setProductoEnEdicion(null)
      cargarDatos()
    } catch (err) {
      console.error(err)
      mostrarMensaje('ERROR AL GUARDAR PRODUCTO: REVISA LA IMAGEN O LOS DATOS', 'error')
    }
  }

  const handleSubmitCategoria = async (e) => {
    e.preventDefault()
    try {
      if (categoriaEnEdicion) {
        await api.put(`/categorias/${categoriaEnEdicion}`, categoriaForm)
        mostrarMensaje('CATEGORÍA ACTUALIZADA')
      } else {
        await api.post('/categorias', categoriaForm)
        mostrarMensaje('CATEGORÍA CREADA CON ÉXITO')
      }
      setCategoriaForm({ nombre: '', tema_visual: 'general' })
      setCategoriaEnEdicion(null)
      cargarDatos()
    } catch (err) { mostrarMensaje('ERROR AL GUARDAR CATEGORÍA', 'error') }
  }

  // ESTILOS UNIFICADOS (COMO LOS BOTONES GRISES ROBUSTOS)
  const inputStyle = "w-full px-5 py-4 rounded-2xl outline-none text-sm bg-black/60 text-white border border-white/10 focus:border-rose-600 transition-all font-medium";
  const cardStyle = "bg-zinc-900/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem]";
  const btnEstiloUnificado = "w-full py-4 bg-zinc-800 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-zinc-700 transition-all text-white active:scale-95 shadow-lg";

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-rose-600 font-black tracking-widest uppercase">Cargando Sistema...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER */}
        <div className={`${cardStyle} p-6 flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className="flex items-center gap-4">
            <img src={logo1} alt="Logo Inversiones Rubi" className="h-12 w-auto" />
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Panel <span className="text-rose-600">Admin</span></h1>
          </div>
          <div className="flex bg-black/60 p-1.5 rounded-2xl gap-2 border border-white/5">
            <button onClick={() => setActiveTab('inventario')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest ${activeTab === 'inventario' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:text-white'}`}>INVENTARIO</button>
            <button onClick={() => setActiveTab('manager')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest ${activeTab === 'manager' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:text-white'}`}>AJUSTES</button>
          </div>
          <button onClick={() => { localStorage.removeItem('auth'); navigate('/login'); }} className="text-gray-600 hover:text-rose-500 font-black text-[10px] uppercase">Cerrar Sesión ✕</button>
        </div>

        {mensaje && <div className="p-4 bg-green-600/20 border border-green-500 text-green-500 rounded-2xl text-center font-bold text-xs tracking-widest uppercase shadow-lg shadow-green-900/20">{mensaje}</div>}
        {error && <div className="p-4 bg-rose-600/20 border border-rose-500 text-rose-500 rounded-2xl text-center font-bold text-xs tracking-widest uppercase shadow-lg shadow-rose-900/20">{error}</div>}

        {activeTab === 'inventario' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8">
              {/* FORMULARIO PRODUCTO */}
              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-600 mb-8 tracking-[0.3em]">{productoEnEdicion ? 'Editando Producto' : 'Publicar Producto'}</h2>
                <form onSubmit={handleSubmitProducto} className="space-y-5">
                  <select required value={productoForm.categoria_id} onChange={(e) => setProductoForm({...productoForm, categoria_id: e.target.value})} className={inputStyle}>
                    <option value="">Seleccionar Categoría...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre.toUpperCase()}</option>)}
                  </select>
                  <input type="text" required value={productoForm.nombre} onChange={(e) => setProductoForm({...productoForm, nombre: e.target.value})} className={inputStyle} placeholder="Nombre del artículo" />
                  <input type="text" required value={productoForm.precio} onChange={(e) => setProductoForm({...productoForm, precio: e.target.value})} className={inputStyle} placeholder="Precio (Ej: 4800)" />
                  
                  <div className="relative">
                    <input type="file" id="file-prod" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="hidden" />
                    <label htmlFor="file-prod" className={`flex items-center justify-center cursor-pointer ${btnEstiloUnificado}`}>
                       {imagenArchivo ? '✅ FOTO SELECCIONADA' : '📂 EXAMINAR FOTO'}
                    </label>
                  </div>

                  <button type="submit" className={btnEstiloUnificado}>
                    {productoEnEdicion ? 'Actualizar Producto' : 'Subir al Catálogo'}
                  </button>
                  {productoEnEdicion && <button type="button" onClick={() => { setProductoEnEdicion(null); setProductoForm({nombre:'', descripcion:'', precio:'', categoria_id:''}) }} className="w-full text-[10px] font-black text-gray-500 uppercase py-2">Cancelar Edición</button>}
                </form>
              </div>

              {/* FORMULARIO CATEGORÍA */}
              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-600 mb-8 tracking-[0.3em]">{categoriaEnEdicion ? 'Editando Grupo' : 'Nueva Categoría'}</h2>
                <form onSubmit={handleSubmitCategoria} className="space-y-5">
                  <input type="text" required value={categoriaForm.nombre} onChange={(e) => setCategoriaForm({...categoriaForm, nombre: e.target.value})} className={inputStyle} placeholder="Ej: Barbería, Ferretería..." />
                  <button type="submit" className={btnEstiloUnificado}>
                    {categoriaEnEdicion ? 'Guardar Cambios' : 'Crear Grupo'}
                  </button>
                </form>
              </div>
            </div>

            {/* TABLAS */}
            <div className="lg:col-span-2 space-y-8">
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-8 border-b border-white/5 bg-black/20 flex justify-between items-center">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em]">Inventario Actual</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <tbody className="divide-y divide-white/5">
                      {productos.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 flex items-center gap-4">
                            <img src={p.imagen_url} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                            <span className="font-bold uppercase tracking-tight">{p.nombre}</span>
                          </td>
                          <td className="p-5 font-black text-rose-600 text-sm">L {p.precio}</td>
                          <td className="p-5 text-right space-x-2">
                            <button onClick={() => { setProductoEnEdicion(p.id); setProductoForm({nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, categoria_id: p.categoria_id.toString()}) }} className="bg-blue-600/10 text-blue-500 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90">✎</button>
                            <button onClick={async () => { if(window.confirm('¿Borrar?')) { await api.delete(`/productos/${p.id}`); cargarDatos(); } }} className="bg-rose-600/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-8 border-b border-white/5 bg-black/20"><h2 className="text-xs font-black uppercase tracking-[0.3em]">Grupos y Categorías</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <tbody className="divide-y divide-white/5">
                      {categorias.map(c => (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 font-bold uppercase tracking-widest">{c.nombre}</td>
                          <td className="p-5 text-right space-x-2">
                            <button onClick={() => { setCategoriaEnEdicion(c.id); setCategoriaForm({ nombre: c.nombre, tema_visual: c.tema_visual }); }} className="bg-blue-600/10 text-blue-500 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90">✎</button>
                            <button onClick={async () => { if(window.confirm('¿Borrar categoría?')) { await api.delete(`/categorias/${c.id}`); cargarDatos(); } }} className="bg-rose-600/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90">✕</button>
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
          <div className={`max-w-3xl mx-auto p-12 ${cardStyle}`}>
            <h2 className="text-xl font-black uppercase italic mb-10 tracking-tighter text-center">⚙️ Ajustes</h2>
            <form onSubmit={async (e) => { e.preventDefault(); try { await api.put('/configuracion', config); mostrarMensaje('AJUSTES GUARDADOS'); } catch(e) { mostrarMensaje('ERROR AL GUARDAR AJUSTES', 'error'); } }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={config.facebook} onChange={e => setConfig({...config, facebook: e.target.value})} className={inputStyle} placeholder="Facebook URL" />
                <input type="text" value={config.instagram} onChange={e => setConfig({...config, instagram: e.target.value})} className={inputStyle} placeholder="Instagram URL" />
                <input type="text" value={config.tiktok} onChange={e => setConfig({...config, tiktok: e.target.value})} className={inputStyle} placeholder="TikTok URL" />
                <input type="text" value={config.whatsapp} onChange={e => setConfig({...config, whatsapp: e.target.value})} className={inputStyle} placeholder="WhatsApp" />
              </div>
              <input type="password" value={config.password_admin} onChange={e => setConfig({...config, password_admin: e.target.value})} className={inputStyle} placeholder="Nueva Contraseña" />
              <button type="submit" className="w-full py-4.5 bg-green-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all text-white active:scale-95">Guardar Cambios</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin;