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
    facebook: '', instagram: '', tiktok: '', whatsapp: '', ubicacion: '', password_admin: ''
  })

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [loading, setLoading] = useState(true)

  // VOLVEMOS A TUS RUTAS ORIGINALES PARA QUE NO SE ROMPA NADA
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        api.get('/categorias').catch(() => ({ data: [] })),
        api.get('/productos').catch(() => ({ data: [] }))
      ])
      
      setCategorias(catRes.data)
      setProductos(prodRes.data)

      try {
        const configRes = await api.get('/configuracion')
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
      } catch (e) { console.warn("Error config:", e) }
    } catch (error) {
      mostrarMensaje('Error de conexión', 'error')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargarDatos() }, [])

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000)
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

      await api.post('/productos', formData); // Ruta original
      mostrarMensaje('¡Producto publicado!', 'exito');
      setNombreProducto(''); setPrecioProducto(''); setImagenArchivo(null); setDescripcionProducto('');
      cargarDatos();
    } catch (error) { mostrarMensaje('Error al crear producto.', 'error'); }
  }

  const handleEliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    try {
      await api.delete(`/productos/${id}`); // Ruta original
      mostrarMensaje('Eliminado', 'exito');
      cargarDatos();
    } catch (error) { mostrarMensaje('Error al eliminar.', 'error'); }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth')
    window.location.href = '/login'
  }

  // ESTILOS PARA QUE SE VEAN MEJOR (MÁS ANCHOS)
  const inputStyle = "w-full px-5 py-4 rounded-2xl outline-none text-sm bg-black/60 text-white border border-white/10 focus:border-rose-600 transition-all font-medium";
  const cardStyle = "bg-zinc-900/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem]";

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-rose-600 font-black">CARGANDO...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER IGUAL AL TUYO */}
        <div className={`${cardStyle} p-6 flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className="flex items-center gap-4">
            <img src={logo1} alt="Logo" className="h-12 w-auto" />
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Panel <span className="text-rose-600">Admin</span></h1>
          </div>
          <div className="flex bg-black/60 p-1.5 rounded-2xl gap-2 border border-white/5">
            <button onClick={() => setActiveTab('inventario')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest ${activeTab === 'inventario' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500'}`}>INVENTARIO</button>
            <button onClick={() => setActiveTab('manager')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest ${activeTab === 'manager' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500'}`}>AJUSTES</button>
          </div>
          <button onClick={handleLogout} className="text-gray-600 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest">Cerrar Sesión ✕</button>
        </div>

        {activeTab === 'inventario' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-600 mb-8 tracking-[0.3em]">Publicar Producto</h2>
                <form onSubmit={handleCrearProducto} className="space-y-5">
                  <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputStyle}>
                    <option value="">Seleccionar Categoría...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre.toUpperCase()}</option>)}
                  </select>
                  <input type="text" required value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className={inputStyle} placeholder="Nombre del artículo" />
                  <input type="text" required value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} className={inputStyle} placeholder="Precio (Ej: L 4,800)" />
                  
                  {/* BOTÓN EXAMINAR ROJO PERSONALIZADO */}
                  <div className="relative">
                    <input type="file" id="file-upload" onChange={(e) => setImagenArchivo(e.target.files[0])} className="hidden" />
                    <label htmlFor="file-upload" className="flex items-center justify-center gap-3 w-full py-4 bg-rose-600 rounded-2xl cursor-pointer hover:bg-rose-700 transition-all text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                      {imagenArchivo ? '✅ FOTO SELECCIONADA' : '📂 EXAMINAR FOTO'}
                    </label>
                  </div>

                  <textarea rows="3" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} className={inputStyle} placeholder="Descripción..."></textarea>
                  <button className="w-full py-4.5 bg-rose-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Subir al Catálogo</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/80">Listado de Inventario</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-black/40 text-gray-500 font-black uppercase tracking-widest">
                      <tr>
                        <th className="p-6">Producto</th>
                        <th className="p-6">Precio</th>
                        <th className="p-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {productos.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 flex items-center gap-4">
                            <img src={p.imagen_url} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                            <span className="font-bold uppercase text-white/90">{p.nombre}</span>
                          </td>
                          <td className="p-5 font-black text-rose-600 text-sm">{p.precio}</td>
                          <td className="p-5 text-right flex justify-end gap-2 mt-4">
                            {/* BOTÓN EDITAR (AZUL) */}
                            <button className="bg-blue-600/10 text-blue-500 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">✎</button>
                            {/* BOTÓN ELIMINAR (ROJO) */}
                            <button onClick={() => handleEliminarProducto(p.id)} className="bg-rose-600/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin;