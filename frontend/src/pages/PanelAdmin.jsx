import { useState, useEffect } from 'react'
import api from '../services/api'
import logo1 from '../assets/logo1.png'

function PanelAdmin() {
  const [activeTab, setActiveTab] = useState('inventario')
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  
  // Estados para formularios
  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcionProducto, setDescripcionProducto] = useState('')
  const [precioProducto, setPrecioProducto] = useState('') 
  const [imagenArchivo, setImagenArchivo] = useState(null)
  const [imagenesAdicionales, setImagenesAdicionales] = useState([])
  const [categoriaId, setCategoriaId] = useState('')

  const [fotosExistentes, setFotosExistentes] = useState([])
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [editandoProdId, setEditandoProdId] = useState(null)
  const [editandoCatId, setEditandoCatId] = useState(null)

  const [config, setConfig] = useState({
    facebook: '', instagram: '', tiktok: '', whatsapp: '50497432867',
    google_maps: '', password_admin: '', categoria_excluida: ''
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
      if (configRes && configRes.data) { setConfig({ ...configRes.data, password_admin: '' }) }
    } catch (error) { mostrarMensaje('Error al conectar con el servidor.', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { cargarDatos() }, [])

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  }

  const handleEliminarFotoExtra = async (fotoId) => {
    if(!window.confirm("¿Eliminar esta foto de la galería?")) return;
    try {
      await api.delete(`/productos/foto/${fotoId}`);
      setFotosExistentes(fotosExistentes.filter(f => f.id !== fotoId));
      mostrarMensaje("Foto eliminada", "exito");
      cargarDatos();
    } catch (error) { mostrarMensaje("Error al eliminar foto", "error"); }
  }

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
      if (imagenesAdicionales.length > 0) {
        Array.from(imagenesAdicionales).forEach((file) => { formData.append('imagenes_adicionales', file); });
      }
      if (editandoProdId) {
        await api.put(`/productos/${editandoProdId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        mostrarMensaje('Producto actualizado', 'exito');
      } else {
        await api.post('/productos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        mostrarMensaje('Producto publicado', 'exito');
      }
      cancelarEdicion();
      cargarDatos();
    } catch (error) { mostrarMensaje('Error al guardar.', 'error'); }
  }

  const prepararEdicionProd = (p) => {
    setEditandoProdId(p.id);
    setNombreProducto(p.nombre);
    setPrecioProducto(p.precio);
    setDescripcionProducto(p.descripcion || '');
    setCategoriaId(p.categoria_id.toString());
    setImagenArchivo(null);
    setImagenesAdicionales([]);
    setFotosExistentes(p.imagenes_extra || []); 
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
    setFotosExistentes([]);
  }

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

  // NUEVA FUNCIÓN: Preparar edición de categoría
  const prepararEdicionCat = (c) => {
    setEditandoCatId(c.id);
    setNombreCategoria(c.nombre);
    // Hacemos scroll suave al formulario de categorías
    const formCat = document.getElementById('form-categoria');
    formCat?.scrollIntoView({ behavior: 'smooth' });
  }

  const handleEliminarCategoria = async (id) => {
    if (!window.confirm("¿Eliminar categoría? Los productos podrían quedar sin grupo.")) return;
    try { await api.delete(`/categorias/${id}`); cargarDatos(); } catch (error) { mostrarMensaje('Error.', 'error'); }
  }

  const handleEliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try { await api.delete(`/productos/${id}`); cargarDatos(); } catch (error) { mostrarMensaje('Error.', 'error'); }
  }

  const handleUpdateConfig = async (e) => {
    e.preventDefault()
    // VALIDACIÓN DE CONTRASEÑA
    if (config.password_admin.trim() !== "") {
      if (!window.confirm("Has escrito una nueva contraseña. ¿Estás seguro de que quieres cambiarla?")) {
        return; // Cancela si el usuario no confirma
      }
    }

    try {
      await api.put('/configuracion', config)
      mostrarMensaje('Configuración actualizada', 'exito')
      setConfig(prev => ({ ...prev, password_admin: '' }))
      cargarDatos()
    } catch (error) { mostrarMensaje('Error al actualizar.', 'error') }
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

  const inputStyle = "w-full px-5 py-3.5 rounded-2xl outline-none text-sm bg-black/40 text-white border border-white/10 focus:border-emerald-500 transition-all font-medium";
  const cardStyle = "bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem]";
  const btnVerde = "w-full py-3.5 bg-emerald-600/90 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-emerald-500 transition-all text-white active:scale-95 cursor-pointer flex justify-center items-center";

  if (loading) return <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div></div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className={`${cardStyle} p-6 flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className="flex items-center gap-4">
            <img src={logo1} alt="Logo" className="h-12 w-auto" />
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
              {/* FORM PRODUCTOS */}
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
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Foto Portada (1)</label>
                    <input type="file" id="file-prod" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="hidden" />
                    <label htmlFor="file-prod" className={btnVerde}>{imagenArchivo ? '✅ PORTADA LISTA' : '📂 ELEGIR PORTADA'}</label>
                  </div>
                  {editandoProdId && fotosExistentes.length > 0 && (
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                      <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Fotos actuales en galería</label>
                      <div className="grid grid-cols-4 gap-2">
                        {fotosExistentes.map((foto) => (
                          <div key={foto.id} className="relative aspect-square bg-white rounded-lg overflow-hidden group">
                            <img src={getImageUrl(foto.imagen_url)} className="w-full h-full object-cover" alt="" />
                            <button type="button" onClick={() => handleEliminarFotoExtra(foto.id)} className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Nuevas Fotos de Ángulos</label>
                    <input type="file" id="files-extra" accept="image/*" multiple onChange={(e) => setImagenesAdicionales(e.target.files)} className="hidden" />
                    <label htmlFor="files-extra" className={`${btnVerde} !bg-zinc-800 hover:!bg-zinc-700`}>{imagenesAdicionales.length > 0 ? `✅ ${imagenesAdicionales.length} FOTOS LISTAS` : '📸 AGREGAR MÁS FOTOS'}</label>
                  </div>
                  <textarea rows="3" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} className={inputStyle} placeholder="Descripción..."></textarea>
                  <button type="submit" className={btnVerde}>{editandoProdId ? 'Guardar Cambios' : 'Subir al Catálogo'}</button>
                  {editandoProdId && (
                    <button type="button" onClick={cancelarEdicion} className="w-full text-[10px] font-black text-gray-500 uppercase py-2">Cancelar Edición</button>
                  )}
                </form>
              </div>

              {/* FORM CATEGORÍAS (CON ID PARA SCROLL) */}
              <div id="form-categoria" className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-emerald-500 mb-6 tracking-[0.3em]">
                  {editandoCatId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <form onSubmit={handleGuardarCategoria} className="space-y-4">
                  <input type="text" required value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} className={inputStyle} placeholder="Ej: Relojes, Joyas..." />
                  <button className={btnVerde}>{editandoCatId ? 'Actualizar Nombre' : 'Crear Grupo'}</button>
                  {editandoCatId && (
                    <button type="button" onClick={() => {setEditandoCatId(null); setNombreCategoria('');}} className="w-full text-[10px] font-black text-gray-500 uppercase py-2">Cancelar</button>
                  )}
                </form>
              </div>
            </div>

            {/* TABLAS */}
            <div className="lg:col-span-2 space-y-8">
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
                                <img src={getImageUrl(p.imagen_url)} className="w-full h-full object-contain" alt="" loading="lazy" />
                                {p.imagenes_extra && p.imagenes_extra.length > 0 && (
                                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[7px] w-4 h-4 flex items-center justify-center rounded-bl-lg font-bold">+{p.imagenes_extra.length}</div>
                                )}
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

              {/* TABLA CATEGORÍAS (CON BOTÓN EDITAR) */}
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em]">Categorías</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-black/40 text-gray-500 font-black uppercase tracking-widest">
                      <tr><th className="p-6">Nombre</th><th className="p-6 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {categorias.map(c => (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-6 font-bold uppercase tracking-widest text-white/90">{c.nombre}</td>
                          <td className="p-6 text-right space-x-2">
                            <button onClick={() => prepararEdicionCat(c)} className="bg-blue-600/10 text-blue-500 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">✎</button>
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
          <div className={`max-w-2xl mx-auto p-10 ${cardStyle}`}>
            <h2 className="text-xl font-black uppercase italic mb-10 flex items-center gap-4">⚙️ Ajustes</h2>
            <form onSubmit={handleUpdateConfig} className="space-y-6">
              <div className="space-y-2 pb-6 border-b border-white/5">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Excluir del Carrusel</label>
                <select value={config.categoria_excluida || ''} onChange={e => setConfig({...config, categoria_excluida: e.target.value})} className={inputStyle}>
                  <option value="">Ninguna</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Facebook" value={config.facebook || ''} onChange={e => setConfig({...config, facebook: e.target.value})} className={inputStyle} />
                <input type="text" placeholder="Instagram" value={config.instagram || ''} onChange={e => setConfig({...config, instagram: e.target.value})} className={inputStyle} />
                <input type="text" placeholder="TikTok" value={config.tiktok || ''} onChange={e => setConfig({...config, tiktok: e.target.value})} className={inputStyle} />
                <input type="text" placeholder="WhatsApp" value={config.whatsapp || ''} onChange={e => setConfig({...config, whatsapp: e.target.value})} className={inputStyle} />
              </div>
              <textarea placeholder="Maps" value={config.google_maps || ''} onChange={e => setConfig({...config, google_maps: e.target.value})} className={inputStyle}></textarea>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Cambiar Contraseña</label>
                <input type="password" placeholder="Nueva Contraseña" value={config.password_admin || ''} onChange={e => setConfig({...config, password_admin: e.target.value})} className={inputStyle} />
              </div>
              <button className={btnVerde}>Guardar Cambios</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin