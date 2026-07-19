import { useState, useEffect } from 'react'
import api from '../services/api'
import logo1 from '../assets/logo1.png'

const CONECTORES = new Set(['para', 'con', 'del', 'las', 'los', 'una', 'uno', 'este', 'esta', 'the', 'and', 'for', 'sin']);

// Sugiere una categoría para un nombre de producto NUEVO evaluando cada
// palabra por separado contra el inventario ya existente: si alguna palabra
// concentra sus coincidencias claramente en una sola categoría, la sugiere.
// No usa IA ni servicios externos, solo el inventario propio (reutilizado
// tanto por el formulario normal como por la Carga Masiva).
function sugerirCategoria(nombreProducto, productos) {
  const palabras = nombreProducto.trim().toLowerCase().split(/\s+/)
    .filter(w => w.length >= 4 && !CONECTORES.has(w));
  if (palabras.length === 0) return null;

  let mejorSugerencia = null;
  palabras.forEach(palabra => {
    const coincidencias = productos.filter(p => p.nombre.toLowerCase().includes(palabra));
    if (coincidencias.length < 2) return; // evita adivinar con un solo parecido

    const conteo = {};
    coincidencias.forEach(p => { conteo[p.categoria_id] = (conteo[p.categoria_id] || 0) + 1; });
    const [catId, votos] = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];
    const confianza = votos / coincidencias.length;

    const esMejor = !mejorSugerencia
      || confianza > mejorSugerencia.confianza
      || (confianza === mejorSugerencia.confianza && coincidencias.length > mejorSugerencia.total);
    if (esMejor) {
      mejorSugerencia = { catId, confianza, total: coincidencias.length };
    }
  });

  return mejorSugerencia && mejorSugerencia.confianza >= 0.6 ? mejorSugerencia.catId : null;
}

function PanelAdmin() {
  const [vistaActiva, setVistaActiva] = useState('inventario')
  const [subVistaInventario, setSubVistaInventario] = useState('productos')
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
  const [categoriaAbierta, setCategoriaAbierta] = useState(null)
  const [dragModalAbierto, setDragModalAbierto] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragFotos, setDragFotos] = useState([])
  const [portadaIndex, setPortadaIndex] = useState(0)
  const [portadaActualUrl, setPortadaActualUrl] = useState(null)
  const [categoriaSugerida, setCategoriaSugerida] = useState(false)

  // Carga Masiva: varias fotos = varios productos distintos (uno por foto)
  const [cargaMasivaAbierta, setCargaMasivaAbierta] = useState(false)
  const [filasMasivas, setFilasMasivas] = useState([])
  const [publicandoMasivo, setPublicandoMasivo] = useState(false)
  const [isDragOverMasivo, setIsDragOverMasivo] = useState(false)

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

  // Sugerencia automática de categoría para el formulario principal: mientras
  // se escribe el nombre de un producto NUEVO (sin categoría elegida
  // todavía), usa el inventario ya cargado para autocompletarla.
  useEffect(() => {
    if (editandoProdId || categoriaId) return; // edición o ya hay categoría: no tocar
    const sugerida = sugerirCategoria(nombreProducto, productos);
    if (sugerida) {
      setCategoriaId(sugerida);
      setCategoriaSugerida(true);
    }
  }, [nombreProducto, categoriaId, editandoProdId, productos]);

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

  // Mueve una foto de la galería un puesto antes o después, y guarda
  // el nuevo orden en el backend (para que el catálogo público lo respete).
  const moverFotoExtra = async (index, direccion) => {
    const destino = index + direccion;
    if (destino < 0 || destino >= fotosExistentes.length) return;

    const nuevasFotos = [...fotosExistentes];
    [nuevasFotos[index], nuevasFotos[destino]] = [nuevasFotos[destino], nuevasFotos[index]];
    setFotosExistentes(nuevasFotos);

    try {
      await api.put(`/productos/${editandoProdId}/imagenes/orden`, {
        orden: nuevasFotos.map(f => f.id),
      });
    } catch (error) {
      mostrarMensaje("Error al guardar el nuevo orden", "error");
    }
  }

  // Convierte una foto de la galería en la portada del producto,
  // intercambiando su lugar con la portada actual.
  const hacerPortada = async (foto) => {
    try {
      await api.put(`/productos/${editandoProdId}/portada`, { fotoId: foto.id });
      setFotosExistentes(fotosExistentes.map(f =>
        f.id === foto.id ? { ...f, imagen_url: portadaActualUrl } : f
      ));
      setPortadaActualUrl(foto.imagen_url);
      mostrarMensaje("Portada actualizada", "exito");
      cargarDatos();
    } catch (error) {
      mostrarMensaje("Error al cambiar la portada", "error");
    }
  }

  // --- CARGA MASIVA: varias fotos = varios productos (uno por foto) ---

  const abrirCargaMasiva = () => {
    setFilasMasivas([]);
    setCargaMasivaAbierta(true);
  }

  const cerrarCargaMasiva = () => {
    filasMasivas.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFilasMasivas([]);
    setCargaMasivaAbierta(false);
  }

  const agregarFotosMasivas = (fileList) => {
    const nuevas = Array.from(fileList)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        nombre: '',
        precio: '',
        categoriaId: '',
        categoriaSugerida: false,
        estado: 'pendiente', // pendiente | subiendo | hecho | error
        errorMsg: '',
      }));
    setFilasMasivas(prev => [...prev, ...nuevas]);
  }

  const handleDragOverMasivo = (e) => {
    e.preventDefault();
    setIsDragOverMasivo(true);
  }

  const handleDragLeaveMasivo = () => {
    setIsDragOverMasivo(false);
  }

  const handleDropMasivo = (e) => {
    e.preventDefault();
    setIsDragOverMasivo(false);
    agregarFotosMasivas(e.dataTransfer.files);
  }

  const actualizarFilaMasiva = (id, campos) => {
    setFilasMasivas(prev => prev.map(f => {
      if (f.id !== id) return f;
      const actualizada = { ...f, ...campos };
      // Autosugerir categoría al escribir el nombre, igual que en el formulario normal.
      if ('nombre' in campos && !f.categoriaId) {
        const sugerida = sugerirCategoria(campos.nombre, productos);
        if (sugerida) {
          actualizada.categoriaId = sugerida;
          actualizada.categoriaSugerida = true;
        }
      }
      if ('categoriaId' in campos) {
        actualizada.categoriaSugerida = false; // el admin la cambió a mano
      }
      return actualizada;
    }));
  }

  const quitarFilaMasiva = (id) => {
    setFilasMasivas(prev => {
      const fila = prev.find(f => f.id === id);
      if (fila) URL.revokeObjectURL(fila.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  }

  const publicarTodoMasivo = async () => {
    setPublicandoMasivo(true);
    let exitos = 0;
    let fallos = 0;

    // Se sube de a una para no saturar la base de datos (pool limitado) ni Supabase Storage.
    // Si ya se publicó (estado 'hecho'), se salta: así este mismo botón sirve para
    // reintentar solo las filas pendientes o que fallaron, sin duplicar las que sí subieron.
    for (const fila of filasMasivas) {
      if (fila.estado === 'hecho') continue;

      if (!fila.nombre.trim() || !fila.precio || !fila.categoriaId) {
        setFilasMasivas(prev => prev.map(f => f.id === fila.id ? { ...f, estado: 'error', errorMsg: 'Faltan datos (nombre, precio o categoría)' } : f));
        fallos++;
        continue;
      }

      setFilasMasivas(prev => prev.map(f => f.id === fila.id ? { ...f, estado: 'subiendo' } : f));
      try {
        const formData = new FormData();
        formData.append('nombre', fila.nombre);
        formData.append('descripcion', '');
        formData.append('precio', fila.precio);
        formData.append('categoria_id', parseInt(fila.categoriaId));
        formData.append('imagen', fila.file);
        await api.post('/productos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setFilasMasivas(prev => prev.map(f => f.id === fila.id ? { ...f, estado: 'hecho' } : f));
        exitos++;
      } catch (error) {
        const detalle = error.response?.data?.error || error.message || 'Error desconocido';
        setFilasMasivas(prev => prev.map(f => f.id === fila.id ? { ...f, estado: 'error', errorMsg: detalle } : f));
        fallos++;
      }
    }

    setPublicandoMasivo(false);
    mostrarMensaje(`Carga masiva: ${exitos} publicados, ${fallos} con error`, fallos > 0 ? 'error' : 'exito');
    cargarDatos();
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
      if (imagenArchivo) {
        formData.append('imagen', imagenArchivo);
      } else if (!editandoProdId && portadaActualUrl) {
        // Duplicar producto: reutiliza la imagen del producto original sin resubirla.
        formData.append('imagen_url', portadaActualUrl);
      }
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
    setPortadaActualUrl(p.imagen_url || null);
    setCategoriaSugerida(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const prepararDuplicado = (p) => {
    setEditandoProdId(null); // es un producto NUEVO, no una edición
    setNombreProducto(p.nombre + ' (copia)');
    setPrecioProducto(p.precio);
    setDescripcionProducto(p.descripcion || '');
    setCategoriaId(p.categoria_id.toString());
    setImagenArchivo(null);
    setImagenesAdicionales([]);
    setFotosExistentes([]); // no se duplica la galería de ángulos, solo la portada
    setPortadaActualUrl(p.imagen_url || null);
    setCategoriaSugerida(false);
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
    setDragModalAbierto(false);
    setDragFotos([]);
    setPortadaIndex(0);
    setPortadaActualUrl(null);
    setCategoriaSugerida(false);
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  }

  const handleDragLeave = () => {
    setIsDragOver(false);
  }

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    cancelarEdicion();
    setDragFotos(files);
    setPortadaIndex(0);
    setImagenArchivo(files[0]);
    setImagenesAdicionales(files.slice(1));
    setDragModalAbierto(true);
  }

  const seleccionarPortada = (index) => {
    setPortadaIndex(index);
    setImagenArchivo(dragFotos[index]);
    setImagenesAdicionales(dragFotos.filter((_, i) => i !== index));
  }

  const eliminarDragFoto = (index) => {
    const nuevasFotos = dragFotos.filter((_, i) => i !== index);
    if (nuevasFotos.length === 0) {
      cancelarEdicion();
      return;
    }
    const nuevoIndex = portadaIndex >= nuevasFotos.length ? 0 : portadaIndex === index ? 0 : portadaIndex > index ? portadaIndex - 1 : portadaIndex;
    setDragFotos(nuevasFotos);
    setPortadaIndex(nuevoIndex);
    setImagenArchivo(nuevasFotos[nuevoIndex]);
    setImagenesAdicionales(nuevasFotos.filter((_, i) => i !== nuevoIndex));
  }

  const agregarMasDragFotos = (e) => {
    const nuevas = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (nuevas.length === 0) return;
    const todas = [...dragFotos, ...nuevas];
    setDragFotos(todas);
    setImagenArchivo(todas[portadaIndex]);
    setImagenesAdicionales(todas.filter((_, i) => i !== portadaIndex));
    e.target.value = '';
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
    localStorage.removeItem('adminKey')
    window.location.href = '/login'
  }

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}/uploads/${path}`;
  };

  const inputStyle = "w-full px-5 py-3.5 rounded-2xl outline-none text-sm bg-black/40 text-white border border-white/10 focus:border-emerald-500 transition-all font-medium";
  const cardStyle = "bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem]";
  const btnVerde = "w-full py-3.5 bg-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-rose-700 transition-all text-white active:scale-95 cursor-pointer flex justify-center items-center";

  if (loading) return <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center"><div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-4"></div></div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className={`${cardStyle} p-4 md:p-6 flex flex-col gap-4`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logo1} alt="Logo" className="h-10 md:h-12 w-auto" />
              <h1 className="text-lg md:text-xl font-black uppercase italic">Panel <span className="text-rose-500">Admin</span></h1>
            </div>
            <button onClick={handleLogout} className="text-gray-600 hover:text-rose-500 font-black text-[9px] md:text-[10px] uppercase self-start sm:self-auto">Cerrar Sesión ✕</button>
          </div>
          <div className="flex flex-wrap bg-black/60 p-1.5 rounded-2xl gap-2 border border-white/5 w-fit">
            <button onClick={() => setVistaActiva('inventario')} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest transition-all ${vistaActiva === 'inventario' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:text-white'}`}>INVENTARIO</button>
            <button onClick={() => setVistaActiva('ajustes')} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest transition-all ${vistaActiva === 'ajustes' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:text-white'}`}>AJUSTES</button>
          </div>
        </div>

        {mensaje.texto && (
          <div className={`p-4 rounded-2xl font-bold text-center text-xs border animate-pulse ${mensaje.tipo === 'error' ? 'bg-rose-900/30 border-rose-500 text-rose-500' : 'bg-rose-900/30 border-rose-500 text-rose-500'}`}>
            {mensaje.texto.toUpperCase()}
          </div>
        )}

        {vistaActiva === 'inventario' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap bg-black/60 p-1.5 rounded-2xl gap-2 border border-white/5 w-fit">
              <button onClick={() => setSubVistaInventario('productos')} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest transition-all ${subVistaInventario === 'productos' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:text-white'}`}>PRODUCTOS</button>
              <button onClick={() => setSubVistaInventario('categorias')} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest transition-all ${subVistaInventario === 'categorias' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:text-white'}`}>CATEGORÍAS</button>
            </div>
            <span className="text-[9px] md:text-[10px] bg-rose-600/20 text-rose-400 px-3 py-1.5 rounded-full font-black border border-rose-600/20">
              {productos.reduce((total, p) => total + 1 + (p.imagenes_extra?.length || 0), 0)} PRODUCTOS
            </span>
            {subVistaInventario === 'productos' && (
              <button onClick={abrirCargaMasiva} className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest bg-amber-600/20 text-amber-500 border border-amber-600/20 hover:bg-amber-600 hover:text-white transition-all">
                📦 CARGA MASIVA
              </button>
            )}
          </div>
        )}

        {vistaActiva === 'inventario' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {subVistaInventario === 'productos' && (
              <>
                <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6 md:space-y-8">
                  {/* MODAL DRAG & DROP */}
                  {dragModalAbierto && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                      <div className={`${cardStyle} w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 relative`}>
                        <button onClick={cancelarEdicion} className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-rose-600 text-white rounded-full transition-colors">
                          ✕
                        </button>
                        <h2 className="text-[9px] md:text-[10px] font-black uppercase text-rose-500 mb-6 tracking-[0.3em]">📸 Nuevo Producto</h2>

                        {/* MINIATURAS CON SELECCIÓN DE PORTADA */}
                        {dragFotos.length > 0 && (
                          <div className="mb-5 space-y-2">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Toca una foto para usarla como portada</p>
                            <div className="grid grid-cols-4 gap-2">
                              {dragFotos.map((foto, idx) => (
                                <div key={idx} className="relative">
                                  <button
                                    type="button"
                                    onClick={() => seleccionarPortada(idx)}
                                    className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                      portadaIndex === idx
                                        ? 'border-rose-500 scale-105 shadow-lg shadow-rose-500/30'
                                        : 'border-white/10 opacity-60 hover:opacity-90'
                                    }`}
                                  >
                                    <img src={URL.createObjectURL(foto)} alt={`foto-${idx}`} className="w-full h-full object-cover" />
                                    {portadaIndex === idx && (
                                      <div className="absolute inset-0 bg-rose-600/20 flex items-end justify-center pb-1">
                                        <span className="text-[7px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full uppercase">Portada</span>
                                      </div>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => eliminarDragFoto(idx)}
                                    className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-md transition-colors"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              {/* BOTÓN AGREGAR MÁS FOTOS */}
                              <div className="relative aspect-square">
                                <input type="file" id="drag-agregar-mas" accept="image/*" multiple onChange={agregarMasDragFotos} className="hidden" />
                                <label htmlFor="drag-agregar-mas" className="flex w-full h-full items-center justify-center rounded-xl border-2 border-dashed border-white/20 hover:border-rose-500 text-white/40 hover:text-rose-500 transition-all cursor-pointer text-2xl font-black">
                                  +
                                </label>
                              </div>
                            </div>
                          </div>
                        )}

                        <form onSubmit={handleGuardarProducto} className="space-y-4">
                          <div className="space-y-1">
                            <select required value={categoriaId} onChange={(e) => { setCategoriaId(e.target.value); setCategoriaSugerida(false); }} className={inputStyle}>
                              <option value="">Seleccionar Categoría...</option>
                              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                            </select>
                            {categoriaSugerida && (
                              <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest ml-2">💡 Categoría sugerida según productos parecidos — verificá que sea correcta</p>
                            )}
                          </div>
                          <input type="text" required value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className={inputStyle} placeholder="Nombre del artículo" />
                          <input type="number" step="0.01" min="0" required value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} className={inputStyle} placeholder="Precio" />
                          <textarea rows="3" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} className={inputStyle} placeholder="Descripción..."></textarea>
                          <button type="submit" className={btnVerde}>Subir al Catálogo</button>
                          <button type="button" onClick={cancelarEdicion} className="w-full text-[9px] font-black text-gray-500 uppercase py-2">Cancelar</button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* FORM PRODUCTOS */}
                  <div
                    className={`${cardStyle} p-5 md:p-8 transition-all duration-200 relative ${isDragOver ? 'border-rose-500 ring-2 ring-rose-500/40 scale-[1.01]' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isDragOver && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 rounded-[2rem] pointer-events-none">
                        <span className="text-4xl mb-2">📸</span>
                        <p className="text-rose-500 font-black uppercase tracking-widest text-sm">Suelta la foto aquí</p>
                      </div>
                    )}
                <h2 className="text-[9px] md:text-[10px] font-black uppercase text-rose-500 mb-6 md:mb-8 tracking-[0.3em]">
                   {editandoProdId ? 'Actualizar Producto' : portadaActualUrl ? 'Publicar Copia del Producto' : 'Publicar Producto'}
                </h2>
                <form onSubmit={handleGuardarProducto} className="space-y-4 md:space-y-5">
                  <div className="space-y-1">
                    <select required value={categoriaId} onChange={(e) => { setCategoriaId(e.target.value); setCategoriaSugerida(false); }} className={inputStyle}>
                      <option value="">Seleccionar Categoría...</option>
                      {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                    </select>
                    {categoriaSugerida && (
                      <p className="text-[8px] md:text-[9px] font-black text-amber-500 uppercase tracking-widest ml-2">💡 Categoría sugerida según productos parecidos — verificá que sea correcta</p>
                    )}
                  </div>
                  <input type="text" required value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className={inputStyle} placeholder="Nombre del artículo" />
                  <input type="number" step="0.01" min="0" required value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} className={inputStyle} placeholder="Precio" />
                  <div className="space-y-2">
                    <label className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Foto Portada (1)</label>
                    {portadaActualUrl && !imagenArchivo && (
                      <div className="relative w-full aspect-square max-h-36 bg-white rounded-2xl overflow-hidden flex items-center justify-center p-2 border-2 border-rose-500/40">
                        <img src={getImageUrl(portadaActualUrl)} alt="Portada actual" className="max-h-full max-w-full object-contain" />
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full uppercase">{editandoProdId ? 'Portada actual' : 'Portada duplicada'}</span>
                      </div>
                    )}
                    {imagenArchivo && (
                      <div className="relative w-full aspect-square max-h-36 bg-white rounded-2xl overflow-hidden flex items-center justify-center p-2 border-2 border-green-500/50">
                        <img src={URL.createObjectURL(imagenArchivo)} alt="Nueva portada" className="max-h-full max-w-full object-contain" />
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-black text-white bg-green-600 px-2 py-0.5 rounded-full uppercase">Nueva portada</span>
                        <button type="button" onClick={() => setImagenArchivo(null)} className="absolute top-2 right-2 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[9px] font-black">✕</button>
                      </div>
                    )}
                    <input type="file" id="file-prod" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="hidden" />
                    <label htmlFor="file-prod" className={btnVerde}>{imagenArchivo ? '✅ PORTADA LISTA' : portadaActualUrl ? '🔄 CAMBIAR PORTADA' : '📂 ELEGIR PORTADA'}</label>
                  </div>
                  {editandoProdId && fotosExistentes.length > 0 && (
                    <div className="p-3 md:p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                      <label className="text-[8px] md:text-[9px] font-black text-rose-500 uppercase tracking-widest">Fotos actuales en galería (usá ◀ ▶ para reordenar, ⭐ para hacerla portada)</label>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {fotosExistentes.map((foto, index) => (
                          <div key={foto.id} className="space-y-1">
                            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                              <img src={getImageUrl(foto.imagen_url)} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex items-center justify-between gap-0.5 bg-zinc-900 rounded-lg p-0.5">
                              <button type="button" disabled={index === 0} onClick={() => moverFotoExtra(index, -1)} className="flex-1 py-1 text-[10px] text-white/70 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed">◀</button>
                              <button type="button" onClick={() => hacerPortada(foto)} title="Hacer portada" className="flex-1 py-1 text-[10px] text-amber-500 hover:text-amber-400">⭐</button>
                              <button type="button" disabled={index === fotosExistentes.length - 1} onClick={() => moverFotoExtra(index, 1)} className="flex-1 py-1 text-[10px] text-white/70 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed">▶</button>
                              <button type="button" onClick={() => handleEliminarFotoExtra(foto.id)} title="Eliminar" className="flex-1 py-1 text-[10px] text-rose-500 hover:text-rose-400">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Nuevas Fotos de Ángulos</label>
                    <input type="file" id="files-extra" accept="image/*" multiple onChange={(e) => setImagenesAdicionales(e.target.files)} className="hidden" />
                    <label htmlFor="files-extra" className={`${btnVerde} !bg-zinc-800 hover:!bg-zinc-700`}>{imagenesAdicionales.length > 0 ? `✅ ${imagenesAdicionales.length} FOTOS LISTAS` : '📸 AGREGAR MÁS FOTOS'}</label>
                  </div>
                  <textarea rows="3" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} className={inputStyle} placeholder="Descripción..."></textarea>
                  <button type="submit" className={btnVerde}>{editandoProdId ? 'Guardar Cambios' : 'Subir al Catálogo'}</button>
                  {editandoProdId && (
                    <button type="button" onClick={cancelarEdicion} className="w-full text-[9px] md:text-[10px] font-black text-gray-500 uppercase py-2">Cancelar Edición</button>
                  )}
                </form>
              </div>

              {/* FORM CATEGORÍAS (CON ID PARA SCROLL) */}
              <div id="form-categoria" className={`${cardStyle} p-8`}>
                <h2 className="text-[10px] font-black uppercase text-rose-500 mb-6 tracking-[0.3em]">
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

            {/* TABLAS - INVENTARIO (ACORDEÓN) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-6 md:space-y-8">
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="p-4 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-black/20">
                  <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.3em]">Inventario</h2>
                  <span className="text-[9px] md:text-[10px] bg-rose-600/20 text-rose-500 px-3 md:px-4 py-1 md:py-1.5 rounded-full font-black border border-rose-600/20 w-fit">{productos.length} ÍTEMS</span>
                </div>
                <div className="space-y-4 p-4">
                  {categorias.map(cat => {
                    const productosDelCategoria = productos.filter(p => Number(p.categoria_id) === Number(cat.id));
                    const estaAbierto = categoriaAbierta === cat.id;
                    return (
                      <div key={cat.id} className="overflow-hidden rounded-xl border border-white/5">
                        {/* ENCABEZADO DEL ACORDEÓN */}
                        <button
                          onClick={() => setCategoriaAbierta(estaAbierto ? null : cat.id)}
                          className="w-full flex items-center justify-between p-3 md:p-5 lg:p-6 bg-zinc-900/80 hover:bg-zinc-900 transition-colors border-l-4 border-rose-600"
                        >
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className={`text-base md:text-lg lg:text-xl transition-transform duration-300 ${estaAbierto ? 'rotate-180' : ''}`}>▼</span>
                            <span className="font-black uppercase text-white/90 text-xs md:text-sm lg:text-base tracking-tight">
                              {cat.nombre} <span className="text-rose-500 font-bold">({productosDelCategoria.length})</span>
                            </span>
                          </div>
                          {productosDelCategoria.length === 0 && (
                            <span className="text-[7px] md:text-[9px] text-gray-500 font-bold">SIN PRODUCTOS</span>
                          )}
                        </button>

                        {/* CONTENIDO DEL ACORDEÓN */}
                        {estaAbierto && productosDelCategoria.length > 0 && (
                          <div className="space-y-2 md:space-y-3 p-3 md:p-6 bg-black/40 border-t border-white/5">
                            {productosDelCategoria.map(p => (
                              <div key={p.id} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 p-3 md:p-4 bg-zinc-800/40 rounded-xl border border-white/5 hover:bg-rose-900/5 transition-colors">
                                {/* IMAGEN */}
                                <div className="w-16 h-16 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden bg-white p-1 border border-zinc-100 relative flex-shrink-0">
                                    <img src={getImageUrl(p.imagen_url)} className="w-full h-full object-cover" alt="" loading="lazy" />
                                    {p.imagenes_extra && p.imagenes_extra.length > 0 && (
                                      <div className="absolute top-0 right-0 bg-rose-600 text-white text-[7px] w-5 h-5 flex items-center justify-center rounded-bl-lg font-bold">+{p.imagenes_extra.length}</div>
                                    )}
                                </div>

                                {/* NOMBRE Y PRECIO */}
                                <div className="flex-1 flex flex-col gap-1 md:gap-2">
                                  <span className="font-bold uppercase text-white/90 text-xs md:text-sm lg:text-base">{p.nombre}</span>
                                  <span className="font-black text-rose-500 text-sm md:text-base">L {p.precio}</span>
                                </div>

                                {/* BOTONES */}
                                <div className="flex gap-2 w-full md:w-auto">
                                  <button onClick={() => prepararEdicionProd(p)} className="flex-1 md:flex-none bg-blue-600/10 text-blue-500 p-2 md:p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-bold text-[9px] md:text-xs">✎ Editar</button>
                                  <button onClick={() => prepararDuplicado(p)} className="flex-1 md:flex-none bg-amber-600/10 text-amber-500 p-2 md:p-2.5 rounded-xl hover:bg-amber-600 hover:text-white transition-all font-bold text-[9px] md:text-xs">⎘ Duplicar</button>
                                  <button onClick={() => handleEliminarProducto(p.id)} className="flex-1 md:flex-none bg-rose-600/10 text-rose-500 p-2 md:p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all font-bold text-[9px] md:text-xs">✕ Borrar</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
              </>
            )}

            {subVistaInventario === 'categorias' && (
              <>
                <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6 md:space-y-8">
                  {/* FORM CATEGORÍAS */}
                  <div id="form-categoria" className={`${cardStyle} p-5 md:p-8`}>
                    <h2 className="text-[9px] md:text-[10px] font-black uppercase text-rose-500 mb-4 md:mb-6 tracking-[0.3em]">
                      {editandoCatId ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h2>
                    <form onSubmit={handleGuardarCategoria} className="space-y-3 md:space-y-4">
                      <input type="text" required value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} className={inputStyle} placeholder="Ej: Relojes, Joyas..." />
                      <button className={btnVerde}>{editandoCatId ? 'Actualizar Nombre' : 'Crear Grupo'}</button>
                      {editandoCatId && (
                        <button type="button" onClick={() => {setEditandoCatId(null); setNombreCategoria('');}} className="w-full text-[9px] md:text-[10px] font-black text-gray-500 uppercase py-2">Cancelar</button>
                      )}
                    </form>
                  </div>
                </div>

                {/* TABLA CATEGORÍAS */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-6 md:space-y-8">
                  <div className={`${cardStyle} overflow-hidden`}>
                    <div className="p-4 md:p-8 border-b border-white/5 bg-black/20">
                      <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.3em]">Categorías</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px] md:text-[11px]">
                        <thead className="bg-black/40 text-gray-500 font-black uppercase tracking-widest">
                          <tr><th className="p-3 md:p-6">Nombre</th><th className="p-3 md:p-6 text-right">Acciones</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {categorias.map(c => (
                            <tr key={c.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-3 md:p-6 font-bold uppercase tracking-widest text-white/90">{c.nombre}</td>
                              <td className="p-3 md:p-6 text-right space-x-1 md:space-x-2">
                                <button onClick={() => prepararEdicionCat(c)} className="bg-blue-600/10 text-blue-500 p-1.5 md:p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-sm md:text-base">✎</button>
                                <button onClick={() => handleEliminarCategoria(c.id)} className="bg-rose-600/10 text-rose-500 p-1.5 md:p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all text-sm md:text-base">✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {vistaActiva === 'ajustes' && (
          <div className={`max-w-2xl mx-auto p-5 md:p-10 ${cardStyle}`}>
            <h2 className="text-lg md:text-xl font-black uppercase italic mb-6 md:mb-10 flex items-center gap-4">⚙️ Ajustes</h2>
            <form onSubmit={handleUpdateConfig} className="space-y-6">
              <div className="space-y-2 pb-6 border-b border-white/5">
                <label className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-widest">Excluir del Carrusel</label>
                <select value={config.categoria_excluida || ''} onChange={e => setConfig({...config, categoria_excluida: e.target.value})} className={inputStyle}>
                  <option value="">Ninguna</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <input type="text" placeholder="Facebook" value={config.facebook || ''} onChange={e => setConfig({...config, facebook: e.target.value})} className={inputStyle} />
                <input type="text" placeholder="Instagram" value={config.instagram || ''} onChange={e => setConfig({...config, instagram: e.target.value})} className={inputStyle} />
                <input type="text" placeholder="TikTok" value={config.tiktok || ''} onChange={e => setConfig({...config, tiktok: e.target.value})} className={inputStyle} />
                <input type="text" placeholder="WhatsApp" value={config.whatsapp || ''} onChange={e => setConfig({...config, whatsapp: e.target.value})} className={inputStyle} />
              </div>
              <textarea placeholder="Maps" value={config.google_maps || ''} onChange={e => setConfig({...config, google_maps: e.target.value})} className={inputStyle}></textarea>
              <div className="space-y-1">
                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase ml-2">Cambiar Contraseña</label>
                <input type="password" placeholder="Nueva Contraseña" value={config.password_admin || ''} onChange={e => setConfig({...config, password_admin: e.target.value})} className={inputStyle} />
              </div>
              <button className={btnVerde}>Guardar Cambios</button>
            </form>
          </div>
        )}

        {/* MODAL: CARGA MASIVA (varias fotos = varios productos) */}
        {cargaMasivaAbierta && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div
              className={`${cardStyle} w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 md:p-8 relative transition-all ${isDragOverMasivo ? 'border-amber-500 ring-2 ring-amber-500/40' : ''}`}
              onDragOver={handleDragOverMasivo}
              onDragLeave={handleDragLeaveMasivo}
              onDrop={handleDropMasivo}
            >
              {isDragOverMasivo && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 rounded-[2rem] pointer-events-none">
                  <span className="text-4xl mb-2">📸</span>
                  <p className="text-amber-500 font-black uppercase tracking-widest text-sm">Soltá las fotos aquí</p>
                </div>
              )}
              <button onClick={cerrarCargaMasiva} className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-rose-600 text-white rounded-full transition-colors">✕</button>
              <h2 className="text-[9px] md:text-[10px] font-black uppercase text-amber-500 mb-2 tracking-[0.3em]">📦 Carga Masiva</h2>
              <p className="text-[10px] text-gray-400 mb-6">Cada foto se convierte en un producto distinto. Completá nombre y precio de cada uno — la categoría se sugiere sola cuando se puede. Podés arrastrar y soltar las fotos directamente acá.</p>

              {filasMasivas.length === 0 ? (
                <div>
                  <input type="file" id="carga-masiva-input" accept="image/*" multiple onChange={(e) => agregarFotosMasivas(e.target.files)} className="hidden" />
                  <label htmlFor="carga-masiva-input" className="flex flex-col items-center justify-center gap-3 py-16 border-2 border-dashed border-white/20 hover:border-amber-500 rounded-2xl cursor-pointer text-white/40 hover:text-amber-500 transition-all">
                    <span className="text-4xl">📸</span>
                    <span className="font-black uppercase tracking-widest text-xs">Elegí o arrastrá todas las fotos</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex w-full h-3 rounded-full overflow-hidden bg-zinc-800 gap-0.5 p-0.5">
                      {filasMasivas.map((fila) => (
                        <div
                          key={fila.id}
                          title={fila.nombre || 'Sin nombre'}
                          className={`flex-1 h-full rounded-sm transition-colors duration-300 ${
                            fila.estado === 'hecho' ? 'bg-green-500'
                              : fila.estado === 'error' ? 'bg-rose-500'
                              : fila.estado === 'subiendo' ? 'bg-amber-500 animate-pulse'
                              : 'bg-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">
                      ✅ {filasMasivas.filter(f => f.estado === 'hecho').length} publicados
                      {filasMasivas.some(f => f.estado === 'error') && (
                        <span className="text-rose-500"> · ❌ {filasMasivas.filter(f => f.estado === 'error').length} con error</span>
                      )}
                      {' '}· {filasMasivas.length} en total
                    </p>
                  </div>

                  <div className="space-y-3">
                    {filasMasivas.map((fila) => (
                      <div key={fila.id} className={`flex flex-col sm:flex-row gap-3 p-3 rounded-xl border ${fila.estado === 'hecho' ? 'border-green-600/40 bg-green-900/10' : fila.estado === 'error' ? 'border-rose-600/40 bg-rose-900/10' : 'border-white/5 bg-black/30'}`}>
                        <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 bg-white rounded-lg overflow-hidden flex items-center justify-center p-1.5">
                          <img src={fila.previewUrl} alt="" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input type="text" placeholder="Nombre" value={fila.nombre} disabled={fila.estado === 'subiendo' || fila.estado === 'hecho'}
                            onChange={(e) => actualizarFilaMasiva(fila.id, { nombre: e.target.value })} className={`${inputStyle} !py-2`} />
                          <input type="number" step="0.01" min="0" placeholder="Precio" value={fila.precio} disabled={fila.estado === 'subiendo' || fila.estado === 'hecho'}
                            onChange={(e) => actualizarFilaMasiva(fila.id, { precio: e.target.value })} className={`${inputStyle} !py-2`} />
                          <div className="space-y-0.5">
                            <select value={fila.categoriaId} disabled={fila.estado === 'subiendo' || fila.estado === 'hecho'}
                              onChange={(e) => actualizarFilaMasiva(fila.id, { categoriaId: e.target.value })} className={`${inputStyle} !py-2`}>
                              <option value="">Categoría...</option>
                              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                            </select>
                            {fila.categoriaSugerida && <p className="text-[7px] font-black text-amber-500 uppercase ml-1">💡 sugerida</p>}
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center justify-center gap-2 sm:w-20 flex-shrink-0">
                          {fila.estado === 'pendiente' && <button type="button" onClick={() => quitarFilaMasiva(fila.id)} className="text-rose-500 hover:text-rose-400 text-xs font-bold">✕ Quitar</button>}
                          {fila.estado === 'subiendo' && <span className="text-[9px] font-black text-amber-500 uppercase">Subiendo...</span>}
                          {fila.estado === 'hecho' && <span className="text-[9px] font-black text-green-500 uppercase">✅ Listo</span>}
                          {fila.estado === 'error' && (
                            <div className="text-center">
                              <span className="text-[9px] font-black text-rose-500 uppercase">❌ Error</span>
                              <p className="text-[8px] text-rose-400 normal-case leading-tight mt-0.5">{fila.errorMsg}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input type="file" id="carga-masiva-agregar-mas" accept="image/*" multiple onChange={(e) => agregarFotosMasivas(e.target.files)} className="hidden" />
                    <label htmlFor="carga-masiva-agregar-mas" className={`${btnVerde} !bg-zinc-800 hover:!bg-zinc-700 cursor-pointer`}>📸 Agregar más fotos</label>
                    <button type="button" disabled={publicandoMasivo} onClick={publicarTodoMasivo} className={`${btnVerde} disabled:opacity-50`}>
                      {publicandoMasivo
                        ? 'Publicando...'
                        : filasMasivas.some(f => f.estado === 'hecho')
                          ? `🔁 Reintentar pendientes (${filasMasivas.filter(f => f.estado !== 'hecho').length})`
                          : `🚀 Publicar Todos (${filasMasivas.length})`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanelAdmin