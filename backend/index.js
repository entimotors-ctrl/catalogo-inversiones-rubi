require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// 2. Inicializar Supabase con las credenciales exactas de tu Render
// Usamos SUPABASE_KEY porque así aparece en tu configuración de Environment
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_KEY
);

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

// 4. Configurar CORS para acceso total (Soluciona el error en móviles)
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// --- RUTAS ---

app.get('/', (req, res) => {
    res.send('¡Servidor de Inversiones Rubi activo y conectado!');
});

// GET PRODUCTOS: Conexión optimizada para evitar errores de carga
app.get('/api/productos', async (req, res) => {
    try {
        const todosLosProductos = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre, c.tema_visual
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.id DESC
        `);
        res.json(todosLosProductos.rows);
    } catch (err) {
        console.error("Error en base de datos:", err.message);
        res.status(500).json({ error: "No se pudieron obtener los productos" });
    }
});

// Rutas de Categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const todasLasCategorias = await pool.query("SELECT * FROM categorias");
        res.json(todasLasCategorias.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener categorías" });
    }
});

// 8. Encender el servidor en modo producción
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Inversiones Rubi escuchando en puerto ${PORT}`);
});