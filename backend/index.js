require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_KEY
);

// Configuración de Multer para múltiples archivos
const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Función auxiliar para subir imágenes a Supabase
const subirASupabase = async (file) => {
    const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    await supabase.storage.from('productos').upload(fileName, file.buffer, { contentType: file.mimetype });
    const { data: publicUrl } = supabase.storage.from('productos').getPublicUrl(fileName);
    return publicUrl.publicUrl;
};

// --- RUTAS DE CONFIGURACIÓN ---

app.get('/api/configuracion', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM configuracion WHERE id = 1");
        if (result.rows.length === 0) {
            return res.json({ 
                whatsapp: '50497432867', 
                facebook: '', 
                instagram: '', 
                tiktok: '', 
                google_maps: '',
                categoria_excluida: null,
                password_admin: 'admin123' 
            });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error en GET /configuracion:", err);
        res.status(500).json({ error: "Error al cargar configuración" });
    }
});

app.put('/api/configuracion', async (req, res) => {
    try {
        const { facebook, instagram, tiktok, whatsapp, password_admin, google_maps, categoria_excluida } = req.body;
        
        const result = await pool.query(
            `UPDATE configuracion 
             SET facebook=$1, instagram=$2, tiktok=$3, whatsapp=$4, password_admin=$5, google_maps=$6, categoria_excluida=$7 
             WHERE id=1 RETURNING *`,
            [facebook, instagram, tiktok, whatsapp, password_admin, google_maps, categoria_excluida || null]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar ajustes" });
    }
});

// --- RUTAS DE PRODUCTOS ---

app.get('/api/productos', async (req, res) => {
    try {
        // ACTUALIZACIÓN: Ahora pedimos el ID y la URL para que el frontend pueda borrar fotos
        const result = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre,
            (SELECT json_agg(img) FROM (SELECT id, imagen_url FROM producto_imagenes WHERE producto_id = p.id) img) AS imagenes_extra
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            ORDER BY p.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al cargar productos" });
    }
});

app.post('/api/productos', upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'imagenes_adicionales', maxCount: 10 }
]), async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria_id } = req.body;
        let imagen_url = null;
        if (req.files['imagen']) {
            imagen_url = await subirASupabase(req.files['imagen'][0]);
        }
        const productRes = await pool.query(
            "INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nombre, descripcion, precio, categoria_id, imagen_url]
        );
        const nuevoProducto = productRes.rows[0];
        if (req.files['imagenes_adicionales']) {
            for (const file of req.files['imagenes_adicionales']) {
                const extraUrl = await subirASupabase(file);
                await pool.query(
                    "INSERT INTO producto_imagenes (producto_id, imagen_url) VALUES ($1, $2)",
                    [nuevoProducto.id, extraUrl]
                );
            }
        }
        res.json(nuevoProducto);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear producto" });
    }
});

app.put('/api/productos/:id', upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'imagenes_adicionales', maxCount: 10 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria_id } = req.body;
        const prodActual = await pool.query("SELECT imagen_url FROM productos WHERE id = $1", [id]);
        let imagen_url = prodActual.rows[0]?.imagen_url;
        if (req.files['imagen']) {
            imagen_url = await subirASupabase(req.files['imagen'][0]);
        }
        const result = await pool.query(
            `UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, categoria_id=$4, imagen_url=$5 WHERE id=$6 RETURNING *`,
            [nombre, descripcion, precio, categoria_id, imagen_url, id]
        );
        if (req.files['imagenes_adicionales']) {
            for (const file of req.files['imagenes_adicionales']) {
                const extraUrl = await subirASupabase(file);
                await pool.query("INSERT INTO producto_imagenes (producto_id, imagen_url) VALUES ($1, $2)", [id, extraUrl]);
            }
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar" });
    }
});

// --- CATEGORÍAS ---

app.get('/api/categorias', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categorias ORDER BY nombre ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al cargar categorías" });
    }
});

app.post('/api/categorias', async (req, res) => {
    try {
        const { nombre } = req.body;
        const result = await pool.query("INSERT INTO categorias (nombre) VALUES ($1) RETURNING *", [nombre]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al crear categoría" });
    }
});

app.put('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const result = await pool.query("UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *", [nombre, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar categoría" });
    }
});

// --- ELIMINACIONES ---

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM productos WHERE id = $1", [id]);
        res.json({ message: "Producto eliminado" });
    } catch (err) {
        res.status(500).json({ error: "No se pudo eliminar" });
    }
});

app.delete('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
        res.json({ message: "Categoría eliminada" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar categoría" });
    }
});

// Ruta para eliminar una foto específica de la galería
app.delete('/api/productos/foto/:fotoId', async (req, res) => {
    try {
        const { fotoId } = req.params;
        await pool.query("DELETE FROM producto_imagenes WHERE id = $1", [fotoId]);
        res.json({ message: "Foto eliminada de la galería" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar la foto" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});