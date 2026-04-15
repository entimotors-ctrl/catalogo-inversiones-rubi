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

  // Estados para formularios
  const [productoForm, setProductoForm] = useState({ nombre: '', precio: '', categoria_id: '' })
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '' })
  const [imagenArchivo, setImagenArchivo] = useState(null)

  // Control de edición
  const [editandoProdId, setEditandoProdId] = useState(null)
  const [editandoCatId, setEditandoCatId] = useState(null)

  const [config, setConfig] = useState({ facebook: '', instagram: '', tiktok: '', whatsapp: '', password_admin: '' })

  const BASE_URL = 'https://entimotors-api-server.onrender.com';

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
      setError('Error al conectar con el servidor.')
    } finally { setLoading(false) }
  }

  const mostrarMensaje = (texto, tipo = 'exito') => {
    tipo === 'exito' ? setMensaje(texto) : setError(texto)
    setTimeout(() => { setMensaje(''); setError(''); }, 5000)
  }

  // --- LÓGICA DE PRODUCTOS (CORREGIDA) ---
  const handleSubmitProducto = async (e) => {
    e.preventDefault()
    if (!productoForm.categoria_id) return mostrarMensaje('Selecciona una categoría', 'error')

    try {
      const formData = new FormData()
      formData.append('nombre', productoForm.nombre)
      formData.append('precio', productoForm.precio)
      formData.append('categoria_id', productoForm.categoria_id)
      if (imagenArchivo) formData.append('imagen', imagenArchivo)

      if (editandoProdId) {
        // EDITAR
        await api.put(`/productos/${editandoProdId}`, formData)
        mostrarMensaje('Producto actualizado con éxito')
      } else {
        // CREAR
        await api.post('/productos', formData)
        mostrarMensaje('Producto creado con éxito')
      }

      cancelarEdicionProd()
      cargarDatos()
    } catch (err) {
      mostrarMensaje('Error al procesar el producto', 'error')
    }
  }

  const prepararEdicionProd = (p) => {
    setEditandoProdId(p.id)
    setProductoForm({
      nombre: p.nombre,
      precio: p.precio,
      categoria_id: p.categoria_id.toString()
    })
    setImagenArchivo(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelarEdicionProd = () => {
    setEditandoProdId(null)
    setProductoForm({ nombre: '', precio: '', categoria_id: '' })
    setImagenArchivo(null)
  }

  // --- LÓGICA DE CATEGORÍAS ---
  const handleSubmitCategoria = async (e) => {
    e.preventDefault()
    try {
      if (editandoCatId) {
        await api.put(`/categorias/${editandoCatId}`, categoriaForm)
        mostrarMensaje('Categoría actualizada')
      } else {
        await api.post('/categorias', categoriaForm)
        mostrarMensaje('Categoría creada')
      }
      setEditandoCatId(null)
      setCategoriaForm({ nombre: '' })
      cargarDatos()
    } catch (err) { mostrarMensaje('Error en categoría', 'error') }
  }

  // Estilos visuales
  const inputStyle = "w-full px-5 py-4 rounded-2xl outline-none text-sm bg-black/60 text-white border border-white/10 focus:border-rose-600 transition-all font-medium";
  const cardStyle = "bg-zinc-900/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem]";
  const btnPrincipal = "w-full py-4 bg-zinc-800 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-zinc-700 transition-all text-white active:scale-95 shadow-lg";

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-rose-600 font-black tracking-widest">CARGANDO...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8 relative">
        
        {/* HEADER */}
        <div className={`${cardStyle} p-6 flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className="flex items-center gap-4">
            <img src={logo1} alt="Rubi" className="h-12 w-auto" />
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Panel <span className="text-rose-600">Admin</span></h1>
          </div>
          <div className="flex bg-black/60 p-1.5 rounded-2xl gap-2 border border-white/5">
            <button onClick={() => setActiveTab('inventario')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest ${activeTab === 'inventario' ? 'bg-rose-600 text-white' : 'text-gray-500'}`}>INVENTARIO</button>
            <button onClick={() => setActiveTab('manager')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest ${activeTab === 'manager' ? 'bg-rose-600 text-white' : 'text-gray-500'}`}>AJUSTES</button>
          </div>
          <button onClick={() => { localStorage.removeItem('auth'); navigate('/login'); }} className="text-gray-600 hover:text-rose-500 font-black text-[10px] uppercase">Salir ✕</button>
        </div>

        {mensaje && <div className="p-4 bg-green-600/20 border border-green-500 text-green-500 rounded-2xl text-center font-bold text-xs uppercase tracking-widest">{mensaje}</div>}
        {error && <div className="p-4 bg-rose-600/20 border border-rose-500 text-rose-500 rounded-2xl text-center font-bold text-xs uppercase tracking-widest">{error}</div>}

        {activeTab === 'inventario' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8">
              {/* FORM PRODUCTO */}
              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-600 mb-8 tracking-[0.3em]">{editandoProdId ? 'Modificar Producto' : 'Nuevo Producto'}</h2>
                <form onSubmit={handleSubmitProducto} className="space-y-5">
                  <select required value={productoForm.categoria_id} onChange={(e) => setProductoForm({...productoForm, categoria_id: e.target.value})} className={inputStyle}>
                    <option value="">Categoría...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre.toUpperCase()}</option>)}
                  </select>
                  <input type="text" required value={productoForm.nombre} onChange={(e) => setProductoForm({...productoForm, nombre: e.target.value})} className={inputStyle} placeholder="Nombre del artículo" />
                  <input type="text" required value={productoForm.precio} onChange={(e) => setProductoForm({...productoForm, precio: e.target.value})} className={inputStyle} placeholder="Precio (L.)" />
                  
                  <div className="relative">
                    <input type="file" id="file-prod" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="hidden" />
                    <label htmlFor="file-prod" className={btnPrincipal + " cursor-pointer flex justify-center items-center"}>
                       {imagenArchivo ? '✅ FOTO CARGADA' : '📂 EXAMINAR FOTO'}
                    </label>
                  </div>

                  <button type="submit" className={btnPrincipal}>
                    {editandoProdId ? 'Guardar Cambios' : 'Publicar Producto'}
                  </button>
                  {editandoProdId && <button type="button" onClick={cancelarEdicionProd} className="w-full text-[10px] font-black text-gray-500 uppercase py-2">Cancelar</button>}
                </form>
              </div>

              {/* FORM CATEGORÍA */}
              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-600 mb-8 tracking-[0.3em]">{editandoCatId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                <form onSubmit={handleSubmitCategoria} className="space-y-5">
                  <input type="text" required value={categoriaForm.nombre} onChange={(e) => setCategoriaForm({...categoriaForm, nombre: e.target.value})} className={inputStyle} placeholder="Nombre del grupo" />
                  <button type="submit" className={btnPrincipal}>
                    {editandoCatId ? 'Actualizar' : 'Crear Grupo'}
                  </button>
                  {editandoCatId && <button type="button" onClick={() => {setEditandoCatId(null); setCategoriaForm({nombre:''})}} className="w-full text-[10px] font-black text-gray-500 uppercase py-2">Cancelar</button>}
                </form>
              </div>
            </div>

            {/* TABLAS */}
            <div className="lg:col-span-2 space-y-8">
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-8 border-b border-white/5 bg-black/20"><h2 className="text-xs font-black uppercase tracking-[0.3em]">Lista de Artículos</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <tbody className="divide-y divide-white/5">
                      {productos.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden">
                              <img src={p.imagen_url.startsWith('http') ? p.imagen_url : `${BASE_URL}${p.imagen_url}`} className="w-full h-full object-cover" alt="" />
                            </div>
                            <span className="font-bold uppercase">{p.nombre}</span>
                          </td>
                          <td className="p-5 font-black text-rose-600 text-sm">L {p.precio}</td>
                          <td className="p-5 text-right space-x-2">
                            <button onClick={() => prepararEdicionProd(p)} className="bg-blue-600/10 text-blue-500 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">✎</button>
                            <button onClick={async () => { if(window.confirm('¿Eliminar?')) { await api.delete(`/productos/${p.id}`); cargarDatos(); } }} className="bg-rose-600/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all">✕</button>
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
            <h2 className="text-xl font-black uppercase italic mb-10 text-center">⚙️ Configuración</h2>
            <form onSubmit={async (e) => { e.preventDefault(); await api.put('/configuracion', config); mostrarMensaje('Ajustes guardados'); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={config.facebook} onChange={e => setConfig({...config, facebook: e.target.value})} className={inputStyle} placeholder="URL Facebook" />
                <input type="text" value={config.whatsapp} onChange={e => setConfig({...config, whatsapp: e.target.value})} className={inputStyle} placeholder="WhatsApp (Ej: 504...)" />
              </div>
              <button type="submit" className="w-full py-4.5 bg-green-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl text-white">Guardar Cambios</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin;