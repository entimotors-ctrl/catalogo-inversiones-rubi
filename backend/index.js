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

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

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
                google_maps: '', // Alineado con el frontend
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
        const { facebook, instagram, tiktok, whatsapp, password_admin, google_maps } = req.body;
        
        // Se cambió 'ubicacion' por 'google_maps' para coincidir con tu PanelAdmin
        const result = await pool.query(
            `UPDATE configuracion 
             SET facebook=$1, instagram=$2, tiktok=$3, whatsapp=$4, password_admin=$5, google_maps=$6 
             WHERE id=1 RETURNING *`,
            [facebook, instagram, tiktok, whatsapp, password_admin, google_maps]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No se encontró el registro" });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error en PUT /configuracion:", err);
        res.status(500).json({ error: "Revisa si la columna 'google_maps' existe en Supabase" });
    }
});

// --- RUTAS DE CATEGORÍAS ---

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

// NUEVA RUTA: EDITAR CATEGORÍA
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

// --- RUTAS DE PRODUCTOS ---

app.get('/api/productos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre 
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            ORDER BY p.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al cargar productos" });
    }
});

app.post('/api/productos', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria_id } = req.body;
        let imagen_url = null;

        if (req.file) {
            const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
            await supabase.storage.from('productos').upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
            const { data: publicUrl } = supabase.storage.from('productos').getPublicUrl(fileName);
            imagen_url = publicUrl.publicUrl;
        }

        const result = await pool.query(
            "INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nombre, descripcion, precio, categoria_id, imagen_url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al guardar producto" });
    }
});

// *** ESTA ES LA RUTA QUE TE FALTABA Y DABA ERROR AL EDITAR ***
app.put('/api/productos/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria_id } = req.body;
        
        // 1. Obtener imagen actual por si no se sube una nueva
        const productoActual = await pool.query("SELECT imagen_url FROM productos WHERE id = $1", [id]);
        let imagen_url = productoActual.rows[0]?.imagen_url;

        // 2. Si hay nueva imagen, subirla a Supabase
        if (req.file) {
            const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
            await supabase.storage.from('productos').upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
            const { data: publicUrl } = supabase.storage.from('productos').getPublicUrl(fileName);
            imagen_url = publicUrl.publicUrl;
        }

        const result = await pool.query(
            `UPDATE productos 
             SET nombre=$1, descripcion=$2, precio=$3, categoria_id=$4, imagen_url=$5 
             WHERE id=$6 RETURNING *`,
            [nombre, descripcion, precio, categoria_id, imagen_url, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar producto" });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM productos WHERE id = $1", [id]);
        res.json({ message: "Producto eliminado" });
    } catch (err) {
        res.status(500).json({ error: "No se pudo eliminar" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});