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

  // URL BASE PARA IMÁGENES (Asegúrate de que coincida con tu backend)
  const BASE_URL = import.meta.env.VITE_API_URL || 'https://entimotors-api-server.onrender.com';

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

  // Función para obtener la URL correcta de la imagen
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const mostrarMensaje = (texto, tipo = 'exito') => {
    if (tipo === 'exito') { setMensaje(texto); setError(''); }
    else { setError(texto); setMensaje(''); }
    setTimeout(() => { setMensaje(''); setError(''); }, 5000)
  }

  const handleSubmitProducto = async (e) => {
    e.preventDefault()
    if (!productoForm.categoria_id) return mostrarMensaje('SELECCIONA UNA CATEGORÍA', 'error');

    try {
      const formData = new FormData()
      formData.append('nombre', productoForm.nombre)
      formData.append('descripcion', productoForm.descripcion || '')
      formData.append('precio', productoForm.precio)
      formData.append('categoria_id', productoForm.categoria_id)
      if (imagenArchivo) formData.append('imagen', imagenArchivo)

      if (productoEnEdicion) {
        await api.put(`/productos/${productoEnEdicion}`, formData)
        mostrarMensaje('PRODUCTO ACTUALIZADO');
      } else {
        await api.post('/productos', formData)
        mostrarMensaje('PRODUCTO GUARDADO');
      }

      setProductoForm({ nombre: '', descripcion: '', precio: '', categoria_id: '' })
      setImagenArchivo(null)
      setProductoEnEdicion(null)
      cargarDatos()
    } catch (err) {
      mostrarMensaje('ERROR AL GUARDAR DATOS', 'error')
    }
  }

  const handleSubmitCategoria = async (e) => {
    e.preventDefault()
    try {
      if (categoriaEnEdicion) {
        await api.put(`/categorias/${categoriaEnEdicion}`, categoriaForm)
      } else {
        await api.post('/categorias', categoriaForm)
      }
      setCategoriaForm({ nombre: '', tema_visual: 'general' })
      setCategoriaEnEdicion(null)
      cargarDatos()
      mostrarMensaje('CATEGORÍA LISTA')
    } catch (err) { mostrarMensaje('ERROR EN CATEGORÍA', 'error') }
  }

  const inputStyle = "w-full px-5 py-4 rounded-2xl outline-none text-sm bg-black/60 text-white border border-white/10 focus:border-rose-600 transition-all font-medium";
  const cardStyle = "bg-zinc-900/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem]";
  const btnEstiloUnificado = "w-full py-4 bg-zinc-800 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-zinc-700 transition-all text-white active:scale-95 shadow-lg";

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-rose-600 font-black tracking-widest uppercase">Cargando...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER */}
        <div className={`${cardStyle} p-6 flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className="flex items-center gap-4">
            <img src={logo1} alt="Logo" className="h-12 w-auto" />
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Panel <span className="text-rose-600">Admin</span></h1>
          </div>
          <div className="flex bg-black/60 p-1.5 rounded-2xl gap-2 border border-white/5">
            <button onClick={() => setActiveTab('inventario')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest ${activeTab === 'inventario' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:text-white'}`}>INVENTARIO</button>
            <button onClick={() => setActiveTab('manager')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest ${activeTab === 'manager' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:text-white'}`}>AJUSTES</button>
          </div>
          <button onClick={() => { localStorage.removeItem('auth'); navigate('/login'); }} className="text-gray-600 hover:text-rose-500 font-black text-[10px] uppercase">Cerrar Sesión ✕</button>
        </div>

        {mensaje && <div className="p-4 bg-green-600/20 border border-green-500 text-green-500 rounded-2xl text-center font-bold text-xs uppercase">{mensaje}</div>}
        {error && <div className="p-4 bg-rose-600/20 border border-rose-500 text-rose-500 rounded-2xl text-center font-bold text-xs uppercase">{error}</div>}

        {activeTab === 'inventario' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8">
              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-600 mb-8 tracking-[0.3em]">{productoEnEdicion ? 'Editando' : 'Publicar'} Producto</h2>
                <form onSubmit={handleSubmitProducto} className="space-y-5">
                  <select required value={productoForm.categoria_id} onChange={(e) => setProductoForm({...productoForm, categoria_id: e.target.value})} className={inputStyle}>
                    <option value="">Categoría...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre.toUpperCase()}</option>)}
                  </select>
                  <input type="text" required value={productoForm.nombre} onChange={(e) => setProductoForm({...productoForm, nombre: e.target.value})} className={inputStyle} placeholder="Nombre" />
                  <input type="text" required value={productoForm.precio} onChange={(e) => setProductoForm({...productoForm, precio: e.target.value})} className={inputStyle} placeholder="Precio" />
                  
                  <div className="relative">
                    <input type="file" id="file-prod" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="hidden" />
                    <label htmlFor="file-prod" className={`flex items-center justify-center cursor-pointer ${btnEstiloUnificado}`}>
                       {imagenArchivo ? '✅ LISTA' : '📂 FOTO'}
                    </label>
                  </div>

                  <button type="submit" className={btnEstiloUnificado}>{productoEnEdicion ? 'Actualizar' : 'Subir'}</button>
                  {productoEnEdicion && <button type="button" onClick={() => setProductoEnEdicion(null)} className="w-full text-gray-500 text-[10px] font-black uppercase">Cancelar</button>}
                </form>
              </div>

              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-600 mb-8 tracking-[0.3em]">Nueva Categoría</h2>
                <form onSubmit={handleSubmitCategoria} className="space-y-5">
                  <input type="text" required value={categoriaForm.nombre} onChange={(e) => setCategoriaForm({...categoriaForm, nombre: e.target.value})} className={inputStyle} placeholder="Nombre categoría" />
                  <button type="submit" className={btnEstiloUnificado}>Crear Grupo</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-8 border-b border-white/5 bg-black/20"><h2 className="text-xs font-black uppercase tracking-[0.3em]">Inventario</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <tbody className="divide-y divide-white/5">
                      {productos.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 flex items-center gap-4">
                            {/* CORRECCIÓN DE VISUALIZACIÓN DE IMAGEN */}
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden">
                                <img 
                                    src={getImageUrl(p.imagen_url)} 
                                    className="w-full h-full object-cover" 
                                    alt="" 
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                            <span className="font-bold uppercase">{p.nombre}</span>
                          </td>
                          <td className="p-5 font-black text-rose-600 text-sm">L {p.precio}</td>
                          <td className="p-5 text-right space-x-2">
                            <button onClick={() => { setProductoEnEdicion(p.id); setProductoForm({nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, categoria_id: p.categoria_id.toString()}) }} className="bg-blue-600/10 text-blue-500 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">✎</button>
                            <button onClick={async () => { if(window.confirm('¿Borrar?')) { await api.delete(`/productos/${p.id}`); cargarDatos(); } }} className="bg-rose-600/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all">✕</button>
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
            <h2 className="text-xl font-black uppercase italic mb-10 text-center">⚙️ Ajustes</h2>
            <form onSubmit={async (e) => { e.preventDefault(); await api.put('/configuracion', config); mostrarMensaje('AJUSTES GUARDADOS'); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={config.facebook} onChange={e => setConfig({...config, facebook: e.target.value})} className={inputStyle} placeholder="Facebook" />
                <input type="text" value={config.instagram} onChange={e => setConfig({...config, instagram: e.target.value})} className={inputStyle} placeholder="Instagram" />
                <input type="text" value={config.tiktok} onChange={e => setConfig({...config, tiktok: e.target.value})} className={inputStyle} placeholder="TikTok" />
                <input type="text" value={config.whatsapp} onChange={e => setConfig({...config, whatsapp: e.target.value})} className={inputStyle} placeholder="WhatsApp" />
              </div>
              <button type="submit" className="w-full py-4.5 bg-green-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl text-white">Guardar Todo</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin;