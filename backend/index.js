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

// Permite que tu frontend (inversiones-rubi-web) hable con este backend
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// --- RUTAS ---
app.get('/', (req, res) => {
    res.send('Backend activo. Ve a /api/productos para ver datos.');
});

// Obtener productos
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
        console.error(err);
        res.status(500).json({ error: "Error al cargar productos" });
    }
});

// Obtener categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categorias ORDER BY nombre ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al cargar categorías" });
    }
});

// Crear categoría
app.post('/api/categorias', async (req, res) => {
    try {
        const { nombre } = req.body;
        const result = await pool.query("INSERT INTO categorias (nombre) VALUES ($1) RETURNING *", [nombre]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al crear categoría" });
    }
});

// Subir producto con imagen
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria_id } = req.body;
        let imagen_url = null;

        if (req.file) {
            const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
            const { error } = await supabase.storage
                .from('productos') 
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

            if (error) throw error;

            const { data: publicUrl } = supabase.storage
                .from('productos')
                .getPublicUrl(fileName);
            
            imagen_url = publicUrl.publicUrl;
        }

        const result = await pool.query(
            "INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nombre, descripcion, precio, categoria_id, imagen_url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar producto" });
    }
});
// --- RUTAS PARA ELIMINAR ---

// Eliminar Producto
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM productos WHERE id = $1", [id]);
        res.json({ message: "Producto eliminado exitosamente" });
    } catch (err) {
        console.error("Error al eliminar producto:", err);
        res.status(500).json({ error: "No se pudo eliminar el producto" });
    }
});

// Eliminar Categoría
app.delete('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Primero verificamos si hay productos usando esta categoría
        const checkProductos = await pool.query(
            "SELECT COUNT(*) FROM productos WHERE categoria_id = $1", 
            [id]
        );
        
        if (parseInt(checkProductos.rows[0].count) > 0) {
            // Si hay productos, enviamos un error claro al frontend
            return res.status(400).json({ 
                error: "No puedes eliminar esta categoría porque aún tiene productos. Elimina los productos primero." 
            });
        }

        // 2. Si no hay productos, procedemos a borrar la categoría
        await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
        res.json({ message: "Categoría eliminada exitosamente" });
        
    } catch (err) {
        console.error("Error al eliminar categoría:", err);
        res.status(500).json({ error: "No se pudo eliminar la categoría" });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});