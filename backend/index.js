require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// 1. Inicializar Supabase (Variables según tu captura de Render)
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

// --- RUTAS DE CONSULTA (GET) ---

app.get('/', (req, res) => {
    res.send('¡Servidor de Inversiones Rubi activo!');
});

app.get('/api/productos', async (req, res) => {
    try {
        const resDB = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre 
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            ORDER BY p.id DESC
        `);
        res.json(resDB.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/categorias', async (req, res) => {
    try {
        const resDB = await pool.query("SELECT * FROM categorias ORDER BY nombre ASC");
        res.json(resDB.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- RUTA CRÍTICA: SUBIDA DE PRODUCTOS CON IMAGEN ---
// Esta es la que probablemente te está dando el error 404 al intentar usar el panel
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria_id } = req.body;
        let imagen_url = null;

        if (req.file) {
            const fileName = `${Date.now()}_${req.file.originalname}`;
            const { data, error } = await supabase.storage
                .from('productos') // Asegúrate que tu bucket en Supabase se llame 'productos'
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

            if (error) throw error;

            const { data: publicUrl } = supabase.storage
                .from('productos')
                .getPublicUrl(fileName);
            
            imagen_url = publicUrl.publicUrl;
        }

        const nuevoProducto = await pool.query(
            "INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nombre, descripcion, precio, categoria_id, imagen_url]
        );

        res.json(nuevoProducto.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar producto" });
    }
});

// --- RUTA PARA CREAR CATEGORÍAS ---
app.post('/api/categorias', async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevaCat = await pool.query(
            "INSERT INTO categorias (nombre) VALUES ($1) RETURNING *", 
            [nombre]
        );
        res.json(nuevaCat.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al crear categoría" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});