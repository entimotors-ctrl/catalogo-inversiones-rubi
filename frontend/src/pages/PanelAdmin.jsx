import { useState, useEffect } from 'react'
import api from '../services/api'
import logo1 from '../assets/logo1.png'

function PanelAdmin() {
  const [activeTab, setActiveTab] = useState('inventario')
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  
  // Estados para formularios
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcionProducto, setDescripcionProducto] = useState('')
  const [precioProducto, setPrecioProducto] = useState('') 
  const [imagenArchivo, setImagenArchivo] = useState(null)
  
  // NUEVO ESTADO: Para las múltiples imágenes adicionales
  const [imagenesAdicionales, setImagenesAdicionales] = useState([])
  
  const [categoriaId, setCategoriaId] = useState('')

  // Estados de edición
  const [editandoProdId, setEditandoProdId] = useState(null)
  const [editandoCatId, setEditandoCatId] = useState(null)

  const [config, setConfig] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '50497432867',
    google_maps: '',
    password_admin: '',
    // NUEVO CAMPO: Para excluir categoría del carrusel
    categoria_excluida: ''
  })

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [loading, setLoading] = useState(true)

  const BASE_URL = 'https://catalogo-inversiones-rubi.onrender.com';

  const cargarDatos = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categorias').catch(() => ({ data: [] })),
        api.get('/productos').catch(() => ({ data: [] }))
      ])
      
      setCategorias(Array.isArray(catRes.data) ? catRes.data : [])
      setProductos(Array.isArray(prodRes.data) ? prodRes.data : [])

      const configRes = await api.get('/configuracion').catch(() => null)
      if (configRes && configRes.data) {
        setConfig({ ...configRes.data, password_admin: '' })
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

  // ---- LÓGICA DE PRODUCTOS ACTUALIZADA ----
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
      
      // AGREGAR MÚLTIPLES IMÁGENES AL FORMDATA
      if (imagenesAdicionales.length > 0) {
        Array.from(imagenesAdicionales).forEach((file) => {
          formData.append('imagenes_adicionales', file);
        });
      }

      if (editandoProdId) {
        await api.put(`/productos/${editandoProdId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarMensaje('Producto actualizado', 'exito');
      } else {
        await api.post('/productos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarMensaje('Producto publicado', 'exito');
      }
      cancelarEdicion();
      cargarDatos();
    } catch (error) { 
      console.error(error);
      mostrarMensaje('Error al guardar. Verifica la conexión.', 'error'); 
    }
  }

  const prepararEdicionProd = (p) => {
    setEditandoProdId(p.id);
    setNombreProducto(p.nombre);
    setPrecioProducto(p.precio);
    setDescripcionProducto(p.descripcion || '');
    setCategoriaId(p.categoria_id.toString());
    setImagenArchivo(null);
    setImagenesAdicionales([]); // Limpiamos las colas de fotos nuevas
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const cancelarEdicion = () => {
    setEditandoProdId(null);
    setNombreProducto(''); 
    setPrecioProducto(''); 
    setDescripcionProducto('');
    setCategoriaId('');
    setImagenArchivo(null);
    setImagenesAdicionales([]);
  }

  // --- RESTO DE LÓGICA IGUAL (CATEGORÍAS Y LOGOUT) ---
  const handleGuardarCategoria = async (e) => {
    e.preventDefault()
    try {
      if (editandoCatId) {
        await api.put(`/categorias/${editandoCatId}`, { nombre: nombreCategoria })
        mostrarMensaje('Categoría actualizada', 'exito')
      } else {
        await api.post('/categorias', { nombre: nombreCategoria })
        mostrarMensaje('Categoría creada', 'exito')
      }
      setNombreCategoria('')
      setEditandoCatId(null)
      cargarDatos()
    } catch (error) { mostrarMensaje('Error al procesar categoría.', 'error') }
  }

  const handleEliminarCategoria = async (id) => {
    if (!window.confirm("¿Eliminar categoría? Esto podría afectar a los productos asociados.")) return;
    try {
      await api.delete(`/categorias/${id}`);
      mostrarMensaje('Categoría eliminada', 'exito');
      cargarDatos();
    } catch (error) { mostrarMensaje('Error al eliminar.', 'error'); }
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
      mostrarMensaje('Configuración actualizada', 'exito')
      setConfig(prev => ({ ...prev, password_admin: '' }))
      cargarDatos()
    } catch (error) { mostrarMensaje('Error al actualizar ajustes.', 'error') }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth')
    window.location.href = '/login'
  }

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}/uploads/${path}`;
  };

  const inputStyle = "w-full px-5 py-3.5 rounded-2xl outline-none text-sm bg-black/40 text-white border border-white/10 focus:border-emerald-500 transition-all placeholder:text-gray-600 font-medium";
  const cardStyle = "bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem]";
  const btnVerde = "w-full py-3.5 bg-emerald-600/90 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-emerald-500 transition-all text-white active:scale-95 shadow-lg flex justify-center items-center cursor-pointer";

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-emerald-500 font-black tracking-widest text-xs animate-pulse">CARGANDO...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className={`${cardStyle} p-6 flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className="flex items-center gap-4">
            <img src={logo1} alt="Logo" className="h-12 w-auto object-contain" />
            <h1 className="text-xl font-black uppercase italic">Panel <span className="text-emerald-500">Admin</span></h1>
          </div>
          
          <div className="flex bg-black/60 p-1.5 rounded-2xl gap-2 border border-white/5">
            <button onClick={() => setActiveTab('inventario')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'inventario' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-white'}`}>INVENTARIO</button>
            <button onClick={() => setActiveTab('manager')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'manager' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-white'}`}>AJUSTES</button>
          </div>

          <button onClick={handleLogout} className="text-gray-600 hover:text-rose-500 font-black text-[10px] uppercase">Cerrar Sesión ✕</button>
        </div>

        {mensaje.texto && (
          <div className={`p-4 rounded-2xl font-bold text-center text-xs border animate-pulse ${mensaje.tipo === 'error' ? 'bg-rose-900/30 border-rose-500 text-rose-500' : 'bg-emerald-900/30 border-emerald-500 text-emerald-500'}`}>
            {mensaje.texto.toUpperCase()}
          </div>
        )}

        {activeTab === 'inventario' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              {/* FORM PRODUCTOS ACTUALIZADO */}
              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-emerald-500 mb-8 tracking-[0.3em]">
                   {editandoProdId ? 'Actualizar Producto' : 'Publicar Producto'}
                </h2>
                <form onSubmit={handleGuardarProducto} className="space-y-5">
                  <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputStyle}>
                    <option value="">Seleccionar Categoría...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                  <input type="text" required value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className={inputStyle} placeholder="Nombre del artículo" />
                  <input type="text" required value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} className={inputStyle} placeholder="Precio" />
                  
                  {/* FOTO PRINCIPAL */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Foto Portada (1)</label>
                    <input type="file" id="file-prod" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="hidden" />
                    <label htmlFor="file-prod" className={btnVerde}>
                       {imagenArchivo ? '✅ PORTADA LISTA' : '📂 ELEGIR PORTADA'}
                    </label>
                  </div>

                  {/* FOTOS ADICIONALES */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Fotos de Ángulos (Opcional)</label>
                    <input type="file" id="files-extra" accept="image/*" multiple onChange={(e) => setImagenesAdicionales(e.target.files)} className="hidden" />
                    <label htmlFor="files-extra" className={`${btnVerde} !bg-zinc-800 hover:!bg-zinc-700`}>
                       {imagenesAdicionales.length > 0 ? `✅ ${imagenesAdicionales.length} FOTOS LISTAS` : '📸 SUBIR MÁS FOTOS'}
                    </label>
                  </div>

                  <textarea rows="3" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} className={inputStyle} placeholder="Descripción..."></textarea>
                  
                  <button type="submit" className={btnVerde}>
                    {editandoProdId ? 'Guardar Cambios' : 'Subir al Catálogo'}
                  </button>

                  {editandoProdId && (
                    <button type="button" onClick={cancelarEdicion} className="w-full text-[10px] font-black text-gray-500 uppercase py-2">Cancelar Edición</button>
                  )}
                </form>
              </div>

              {/* FORM CATEGORÍAS */}
              <div className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-emerald-500 mb-6 tracking-[0.3em]">
                  {editandoCatId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <form onSubmit={handleGuardarCategoria} className="space-y-4">
                  <input type="text" required value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} className={inputStyle} placeholder="Ej: Relojes, Joyas..." />
                  <button className={btnVerde}>{editandoCatId ? 'Actualizar' : 'Crear Grupo'}</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              {/* TABLAS IGUALES */}
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em]">Inventario</h2>
                  <span className="text-[10px] bg-emerald-600/20 text-emerald-500 px-4 py-1.5 rounded-full font-black border border-emerald-600/20">{productos.length} ÍTEMS</span>
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
                        <tr key={p.id} className="hover:bg-emerald-900/5 transition-colors">
                          <td className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white p-1 border border-zinc-100 relative">
                                <img src={getImageUrl(p.imagen_url)} className="w-full h-full object-contain" alt="" />
                                {p.imagenes_extra && <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[7px] w-4 h-4 flex items-center justify-center rounded-bl-lg font-bold">+{p.imagenes_extra.length}</div>}
                            </div>
                            <span className="font-bold uppercase text-white/90">{p.nombre}</span>
                          </td>
                          <td className="p-5 font-black text-emerald-500 text-sm">{p.precio}</td>
                          <td className="p-5 text-right space-x-2">
                            <button onClick={() => prepararEdicionProd(p)} className="bg-blue-600/10 text-blue-500 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">✎</button>
                            <button onClick={() => handleEliminarProducto(p.id)} className="bg-rose-600/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all">✕</button>
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
                  <h2 className="text-xs font-black uppercase tracking-[0.3em]">Categorías</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-black/40 text-gray-500 font-black uppercase tracking-widest">
                      <tr>
                        <th className="p-6">Nombre</th>
                        <th className="p-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {categorias.map(c => (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-6 font-bold uppercase tracking-widest text-white/90">{c.nombre}</td>
                          <td className="p-6 text-right space-x-2">
                            <button onClick={() => handleEliminarCategoria(c.id)} className="bg-rose-600/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all">✕</button>
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
          /* PESTAÑA AJUSTES ACTUALIZADA */
          <div className={`max-w-2xl mx-auto p-10 ${cardStyle}`}>
            <h2 className="text-xl font-black uppercase italic mb-10 flex items-center gap-4">
              <span className="w-10 h-10 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-600/20">⚙️</span>
              Ajustes del Sistema
            </h2>
            <form onSubmit={handleUpdateConfig} className="space-y-6">
              
              {/* SELECTOR PARA EXCLUIR CATEGORÍA */}
              <div className="space-y-2 pb-6 border-b border-white/5">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Categoría a excluir del Carrusel</label>
                <select 
                  value={config.categoria_excluida || ''} 
                  onChange={e => setConfig({...config, categoria_excluida: e.target.value})} 
                  className={inputStyle}
                >
                  <option value="">Ninguna (Mostrar todas)</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
                <p className="text-[9px] text-gray-500 italic mt-1">Los productos de esta categoría no aparecerán en el carrusel de la página principal.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-600 uppercase">Facebook</label><input type="text" value={config.facebook || ''} onChange={e => setConfig({...config, facebook: e.target.value})} className={inputStyle} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-600 uppercase">Instagram</label><input type="text" value={config.instagram || ''} onChange={e => setConfig({...config, instagram: e.target.value})} className={inputStyle} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-600 uppercase">TikTok</label><input type="text" value={config.tiktok || ''} onChange={e => setConfig({...config, tiktok: e.target.value})} className={inputStyle} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-emerald-500 uppercase">WhatsApp</label><input type="text" value={config.whatsapp || ''} onChange={e => setConfig({...config, whatsapp: e.target.value})} className={inputStyle} /></div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-500 uppercase">Link de Google Maps</label>
                <textarea rows="2" value={config.google_maps || ''} onChange={e => setConfig({...config, google_maps: e.target.value})} className={inputStyle} placeholder="URL de tu ubicación..."></textarea>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase">Nueva Contraseña</label>
                <input type="password" value={config.password_admin || ''} onChange={e => setConfig({...config, password_admin: e.target.value})} className={inputStyle} placeholder="En blanco para no cambiar" />
              </div>

              <button className={btnVerde}>Guardar Todos los Cambios</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin