// 1. Importar las dependencias
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // <-- IMPORTAMOS LA CONEXIÓN A LA BASE DE DATOS

// 2. Inicializar la aplicación
const app = express();

// 3. Configurar Middlewares (intermediarios)
app.use(cors({
  origin: ['http://localhost:5173', 'https://inversiones-rubi-web.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// 4. Crear una ruta de prueba
app.get('/', (req, res) => {
    res.send('¡El servidor del catálogo está funcionando al 100%!');
});

// Ruta de prueba para verificar que las peticiones llegan
app.get('/api/test', (req, res) => {
    console.log('🔍 GET /api/test llamado desde:', req.headers.origin || 'desconocido');
    res.json({ message: 'Test endpoint working', timestamp: new Date().toISOString(), backend: 'running' });
});

// --- 5. RUTAS DE LA API (CATEGORÍAS) ---

// Crear una nueva categoría (POST)
app.post('/api/categorias', async (req, res) => {
    console.log('🔥 POST /api/categorias llamado con body:', req.body);
    console.log('Headers:', req.headers);

    try {
        const { nombre, tema_visual } = req.body;

        if (!nombre) {
            console.log('❌ Nombre faltante');
            return res.status(400).json({ error: 'El campo nombre es obligatorio' });
        }

        console.log('📝 Intentando insertar:', { nombre, tema_visual: tema_visual || 'general' });

        const query = "INSERT INTO categorias (nombre, tema_visual) VALUES ($1, $2) RETURNING *";
        const values = [nombre, tema_visual || 'general'];

        const resultado = await pool.query(query, values);
        console.log("✅ Categoría creada exitosamente:", resultado.rows[0]);
        res.status(201).json(resultado.rows[0]);
    } catch (err) {
        console.error("❌ ERROR EN POST /api/categorias:");
        console.error("   Mensaje:", err.message);
        console.error("   Código:", err.code);
        console.error("   Detalles:", err.detail);
        console.error("   Stack:", err.stack);
        res.status(500).json({
            error: err.message,
            code: err.code,
            detail: err.detail
        });
    }
});

// Obtener todas las categorías (GET)
app.get('/api/categorias', async (req, res) => {
    try {
        // Pedimos toda la lista a la base de datos
        const todasLasCategorias = await pool.query("SELECT * FROM categorias");
        res.json(todasLasCategorias.rows);
    } catch (err) {
        console.error("Detalle del error:", err);
        res.status(500).send("Error en el servidor");
    }
});

// Eliminar una categoría (DELETE)
app.delete('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (err) {
        console.error("Detalle del error:", err);
        res.status(500).send("Error en el servidor");
    }
});

// --- RUTAS DE LA API (PRODUCTOS) ---

// Crear un nuevo producto (POST)
app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, descripcion, precio, imagen_url, categoria_id } = req.body;
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

// Obtener todos los productos (GET)
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
        console.error("Detalle del error:", err);
        res.status(500).send("Error en el servidor");
    }
});

// Obtener productos por categoría (GET)
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
        console.error("Detalle del error:", err);
        res.status(500).send("Error en el servidor");
    }
});

// Eliminar un producto (DELETE)
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM productos WHERE id = $1", [id]);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error("Detalle del error:", err);
        res.status(500).send("Error en el servidor");
    }
});

// Actualizar una categoría (PUT)
app.put('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tema_visual } = req.body;
        const categoriaActualizada = await pool.query(
            "UPDATE categorias SET nombre = $1, tema_visual = $2 WHERE id = $3 RETURNING *",
            [nombre, tema_visual, id]
        );

        if (categoriaActualizada.rowCount === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json(categoriaActualizada.rows[0]);
    } catch (err) {
        console.error("Detalle del error:", err);
        res.status(500).send("Error en el servidor");
    }
});

// Actualizar un producto (PUT)
app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, imagen_url, categoria_id } = req.body;
        const productoActualizado = await pool.query(
            "UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, imagen_url = $4, categoria_id = $5 WHERE id = $6 RETURNING *",
            [nombre, descripcion, precio, imagen_url, categoria_id, id]
        );

        if (productoActualizado.rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(productoActualizado.rows[0]);
    } catch (err) {
        console.error("Detalle del error:", err);
        res.status(500).send("Error en el servidor");
    }
});

// 6. Probar conexión a la base de datos (sin bloquear el servidor)
const testConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Conexión a SUPABASE exitosa:', res.rows[0]);
    } catch (err) {
        console.error('❌ Error conectando a SUPABASE:', err.message);
        // No detener el servidor si hay error de conexión
        console.log('⚠️  El servidor continuará ejecutándose...');
    }
};

// Probar conexión sin bloquear el inicio del servidor
setTimeout(testConnection, 1000);

// 7. Manejo de errores no capturados
process.on('uncaughtException', (err) => {
    console.error('💥 Excepción no capturada:', err);
    console.error('Stack:', err.stack);
    console.log('✅ El servidor continuará ejecutándose...');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promesa rechazada no manejada:', reason);
    console.log('✅ El servidor continuará ejecutándose...');
});

// 8. Encender el servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    console.log('📊 API disponible en http://localhost:3000/api');
});

// Manejar errores del servidor
server.on('error', (err) => {
    console.error('❌ Error del servidor:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`Puerto ${PORT} ya está en uso. Intenta con otro puerto.`);
    }
});