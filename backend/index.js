// 1. Importar las dependencias
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer'); // <-- NUEVO: Para procesar archivos
const { createClient } = require('@supabase/supabase-js'); // <-- NUEVO: Para conectar al Storage de Supabase

// 2. Inicializar Supabase y Multer
// IMPORTANTE: Asegúrate de tener SUPABASE_URL y SUPABASE_KEY en tu archivo .env
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const upload = multer({ storage: multer.memoryStorage() }); // Guarda la imagen temporalmente en memoria

// 3. Inicializar la aplicación
const app = express();

// 4. Configurar Middlewares (intermediarios)
app.use(cors({
  origin: ['http://localhost:5173', 'https://inversiones-rubi-web.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// 5. Crear una ruta de prueba
app.get('/', (req, res) => {
    res.send('¡El servidor del catálogo está funcionando al 100%!');
});

app.get('/api/test', (req, res) => {
    console.log('🔍 GET /api/test llamado desde:', req.headers.origin || 'desconocido');
    res.json({ message: 'Test endpoint working', timestamp: new Date().toISOString(), backend: 'running' });
});

// --- RUTAS DE LA API (CATEGORÍAS) ---

app.post('/api/categorias', async (req, res) => {
    try {
        const { nombre, tema_visual } = req.body;
        if (!nombre) return res.status(400).json({ error: 'El campo nombre es obligatorio' });

        const query = "INSERT INTO categorias (nombre, tema_visual) VALUES ($1, $2) RETURNING *";
        const values = [nombre, tema_visual || 'general'];
        const resultado = await pool.query(query, values);
        
        res.status(201).json(resultado.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message, code: err.code });
    }
});

app.get('/api/categorias', async (req, res) => {
    try {
        const todasLasCategorias = await pool.query("SELECT * FROM categorias");
        res.json(todasLasCategorias.rows);
    } catch (err) {
        res.status(500).send("Error en el servidor");
    }
});

app.delete('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (err) {
        res.status(500).send("Error en el servidor");
    }
});

// --- RUTAS DE LA API (PRODUCTOS) ---

// 🔥 NUEVO POST: Ahora procesa la imagen con upload.single('imagen')
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria_id } = req.body;
        let imagen_url = null;

        // Si el usuario subió una imagen...
        if (req.file) {
            // Creamos un nombre único para la foto
            const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
            
            // Subimos el archivo a la cubeta "productos" en Supabase Storage
            const { data, error } = await supabase.storage
                .from('productos')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                });

            if (error) {
                console.error("Error subiendo foto a Supabase:", error);
                throw new Error("No se pudo subir la imagen");
            }

            // Generamos la URL pública de la imagen
            const { data: publicUrlData } = supabase.storage
                .from('productos')
                .getPublicUrl(fileName);

            imagen_url = publicUrlData.publicUrl;
        }

        // Guardamos todo en la base de datos (con la nueva URL de la imagen)
        const nuevoProducto = await pool.query(
            "INSERT INTO productos (nombre, descripcion, precio, imagen_url, categoria_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nombre, descripcion, precio, imagen_url, categoria_id]
        );
        res.json(nuevoProducto.rows[0]);
    } catch (err) {
        console.error("Detalle del error:", err);
        res.status(500).send("Error en el servidor");
    }
});

app.get('/api/productos', async (req, res) => {
    try {
        const todosLosProductos = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre, c.tema_visual
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.id DESC
        `);
        res.json(todosLosProductos.rows);
    } catch (err) {
        res.status(500).send("Error en el servidor");
    }
});

app.get('/api/productos/categoria/:categoria_id', async (req, res) => {
    try {
        const { categoria_id } = req.params;
        const productos = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.categoria_id = $1
        `, [categoria_id]);
        res.json(productos.rows);
    } catch (err) {
        res.status(500).send("Error en el servidor");
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM productos WHERE id = $1", [id]);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        res.status(500).send("Error en el servidor");
    }
});

// 6. Probar conexión a la base de datos
const testConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Conexión a SUPABASE Postgres exitosa');
    } catch (err) {
        console.error('❌ Error conectando a base de datos:', err.message);
    }
};
setTimeout(testConnection, 1000);

process.on('uncaughtException', (err) => console.log('El servidor sigue ejecutándose.'));
process.on('unhandledRejection', (err) => console.log('El servidor sigue ejecutándose.'));

// 8. Encender el servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});