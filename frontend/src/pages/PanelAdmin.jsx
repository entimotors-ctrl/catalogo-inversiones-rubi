import { useState, useEffect } from 'react'
import api from '../services/api'
// 1. Importamos el logo1 para el encabezado
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

  // Estado para controlar si estamos creando o editando un producto
  const [editandoProdId, setEditandoProdId] = useState(null)

  const [config, setConfig] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '50497432867',
    password_admin: ''
  })

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [loading, setLoading] = useState(true)

  // URL BASE para las imágenes
  const BASE_URL = 'https://entimotors-api-server.onrender.com';

  const cargarDatos = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categorias').catch(() => ({ data: [] })),
        api.get('/productos').catch(() => ({ data: [] }))
      ])
      
      setCategorias(catRes.data)
      setProductos(prodRes.data)

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

  // ---- LÓGICA DE CATEGORÍAS ----
  const handleCrearCategoria = async (e) => {
    e.preventDefault()
    try {
      await api.post('/categorias', { nombre: nombreCategoria })
      mostrarMensaje('¡Categoría creada!', 'exito')
      setNombreCategoria('')
      cargarDatos()
    } catch (error) { mostrarMensaje('Error al crear categoría.', 'error') }
  }

  const handleEliminarCategoria = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta categoría?")) return;
    try {
      await api.delete(`/categorias/${id}`);
      mostrarMensaje('Categoría eliminada', 'exito');
      cargarDatos();
    } catch (error) { mostrarMensaje('Error al eliminar.', 'error'); }
  }

  // ---- LÓGICA DE PRODUCTOS ----
  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!categoriaId) return mostrarMensaje('Selecciona una categoría', 'error');
    
    try {
      const formData = new FormData();
      formData.append('nombre', nombreProducto);
      formData.append('descripcion', descripcionProducto);
      formData.append('precio', precioProducto);
      formData.append('categoria_id', parseInt(categoriaId));
      if (imagenArchivo) formData.append('imagen', imagenArchivo);

      if (editandoProdId) {
        // ACTUALIZAR
        await api.put(`/productos/${editandoProdId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarMensaje('¡Producto actualizado!', 'exito');
      } else {
        // CREAR
        await api.post('/productos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarMensaje('¡Producto publicado!', 'exito');
      }
      
      cancelarEdicion();
      cargarDatos();
    } catch (error) { mostrarMensaje('Error al guardar producto.', 'error'); }
  }

  const prepararEdicionProd = (p) => {
    setEditandoProdId(p.id);
    setNombreProducto(p.nombre);
    setPrecioProducto(p.precio);
    setDescripcionProducto(p.descripcion || '');
    setCategoriaId(p.categoria_id.toString());
    setImagenArchivo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const cancelarEdicion = () => {
    setEditandoProdId(null);
    setNombreProducto(''); 
    setPrecioProducto(''); 
    setDescripcionProducto('');
    setCategoriaId('');
    setImagenArchivo(null);
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

  // Función para procesar imágenes correctamente
  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/40';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Clases CSS
  const inputStyle = "w-full px-5 py-3.5 rounded-2xl outline-none text-sm bg-black/40 text-white border border-white/10 focus:border-rose-600 transition-all placeholder:text-gray-600 font-medium shadow-inner";
  const cardStyle = "bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem]";
  
  // ESTE ES EL ESTILO DEL BOTÓN QUE QUERÍAS (Gris oscuro, bordes redondeados, texto elegante)
  const btnPrincipal = "w-full py-3.5 bg-zinc-800/80 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-zinc-700 transition-all text-white active:scale-95 shadow-lg flex justify-center items-center cursor-pointer";

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-rose-600 font-black tracking-widest text-xs animate-pulse uppercase">Cargando Sistema...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER DARKGLASS */}
        <div className={`${cardStyle} p-6 flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className="flex items-center gap-4">
            <img src={logo1} alt="Rubi Logo" className="h-12 w-auto object-contain" />
            <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter">Panel <span className="text-rose-600 italic">Admin</span></h1>
            </div>
          </div>
          
          <div className="flex bg-black/60 p-1.5 rounded-2xl gap-2 border border-white/5">
            <button onClick={() => setActiveTab('inventario')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'inventario' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>INVENTARIO</button>
            <button onClick={() => setActiveTab('manager')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'manager' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>AJUSTES</button>
          </div>

          <button onClick={handleLogout} className="text-gray-600 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
            Cerrar Sesión ✕
          </button>
        </div>

        {mensaje.texto && (
          <div className={`p-4 rounded-2xl font-bold text-center text-xs tracking-[0.2em] border animate-pulse ${mensaje.tipo === 'error' ? 'bg-rose-900/30 border-rose-500 text-rose-500' : 'bg-green-900/30 border-green-500 text-green-500'}`}>
            {mensaje.texto.toUpperCase()}
          </div>
        )}

        {activeTab === 'inventario' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUMNA IZQUIERDA: FORMULARIOS */}
            <div className="lg:col-span-1 space-y-8">
              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-600 mb-8 tracking-[0.3em] flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-rose-600"></span> 
                   {editandoProdId ? 'Editando Producto' : 'Publicar Producto'}
                </h2>
                <form onSubmit={handleGuardarProducto} className="space-y-5">
                  <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputStyle}>
                    <option value="">Seleccionar Categoría...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                  <input type="text" required value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className={inputStyle} placeholder="Nombre del artículo" />
                  <input type="text" required value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} className={inputStyle} placeholder="Precio (L 0.00)" />
                  
                  {/* BOTÓN EXAMINAR FOTO ACTUALIZADO */}
                  <div className="relative">
                    <input type="file" id="file-prod" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="hidden" />
                    <label htmlFor="file-prod" className={btnPrincipal}>
                       {imagenArchivo ? '✅ FOTO LISTA' : '📂 EXAMINAR FOTO'}
                    </label>
                  </div>

                  <textarea rows="3" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} className={inputStyle} placeholder="Breve descripción..."></textarea>
                  
                  {/* BOTÓN SUBIR/ACTUALIZAR ACTUALIZADO */}
                  <button type="submit" className={btnPrincipal}>
                    {editandoProdId ? 'Guardar Cambios' : 'Subir al Catálogo'}
                  </button>

                  {editandoProdId && (
                    <button type="button" onClick={cancelarEdicion} className="w-full text-[10px] font-black text-gray-500 uppercase py-2 hover:text-white transition-colors">
                      Cancelar Edición
                    </button>
                  )}
                </form>
              </div>

              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-600 mb-6 tracking-[0.3em]">Nueva Categoría</h2>
                <form onSubmit={handleCrearCategoria} className="space-y-4">
                  <input type="text" required value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} className={inputStyle} placeholder="Ej: Relojes, Joyas..." />
                  <button className={btnPrincipal}>Crear Grupo</button>
                </form>
              </div>
            </div>

            {/* COLUMNA DERECHA: TABLAS */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* TABLA PRODUCTOS */}
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/80">Listado de Inventario</h2>
                  <span className="text-[10px] bg-rose-600/20 text-rose-600 px-4 py-1.5 rounded-full font-black border border-rose-600/20">{productos.length} ARTÍCULOS</span>
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
                        <tr key={p.id} className="hover:bg-rose-900/5 transition-colors group">
                          <td className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white p-1 border border-zinc-100 shadow-md">
                                <img src={getImageUrl(p.imagen_url)} className="w-full h-full object-contain" alt="" />
                            </div>
                            <span className="font-bold uppercase tracking-tight text-white/90">{p.nombre}</span>
                          </td>
                          <td className="p-5 font-black text-rose-600 text-sm">{p.precio}</td>
                          <td className="p-5 text-right space-x-2">
                            {/* BOTÓN EDITAR */}
                            <button onClick={() => prepararEdicionProd(p)} className="bg-blue-600/10 text-blue-500 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90">✎</button>
                            <button onClick={() => handleEliminarProducto(p.id)} className="bg-rose-600/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLA CATEGORÍAS */}
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/80">Grupos de Catálogo</h2>
                  <span className="text-[10px] bg-zinc-800 text-gray-400 px-4 py-1.5 rounded-full font-black border border-white/5">{categorias.length} GRUPOS</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-black/40 text-gray-500 font-black uppercase tracking-widest">
                      <tr>
                        <th className="p-6">Nombre de la Categoría</th>
                        <th className="p-6 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {categorias.map(c => (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-6 font-bold uppercase tracking-widest text-white/90">{c.nombre}</td>
                          <td className="p-6 text-right">
                            <button onClick={() => handleEliminarCategoria(c.id)} className="bg-rose-600/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90">✕</button>
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
          /* PESTAÑA AJUSTES (MANAGER) */
          <div className={`max-w-2xl mx-auto p-10 ${cardStyle}`}>
            <h2 className="text-xl font-black uppercase italic mb-10 flex items-center gap-4 tracking-tighter">
              <span className="w-10 h-10 bg-rose-600/10 text-rose-600 rounded-2xl flex items-center justify-center not-italic border border-rose-600/20 shadow-inner">⚙️</span>
              Configuración del Sistema
            </h2>
            <form onSubmit={handleUpdateConfig} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Facebook URL</label>
                  <input type="text" value={config.facebook || ''} onChange={e => setConfig({...config, facebook: e.target.value})} className={inputStyle} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Instagram URL</label>
                  <input type="text" value={config.instagram || ''} onChange={e => setConfig({...config, instagram: e.target.value})} className={inputStyle} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">TikTok URL</label>
                  <input type="text" value={config.tiktok || ''} onChange={e => setConfig({...config, tiktok: e.target.value})} className={inputStyle} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">WhatsApp Ventas</label>
                  <input type="text" value={config.whatsapp || ''} onChange={e => setConfig({...config, whatsapp: e.target.value})} className={inputStyle} placeholder="504..." />
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Cambiar Contraseña de Acceso</label>
                <input type="password" value={config.password_admin || ''} onChange={e => setConfig({...config, password_admin: e.target.value})} className={inputStyle} placeholder="Dejar en blanco para no cambiar" />
              </div>

              <button className="w-full py-4.5 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-green-900/20 transition-all hover:scale-[1.01] active:scale-95 mt-4">Guardar Cambios</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin