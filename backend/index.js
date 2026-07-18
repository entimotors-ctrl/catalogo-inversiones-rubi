require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// Importar rutas del asistente
const assistantRoutes = require('./routes/assistant');
const { processMessage } = require('./assistant/assistantEngine');
const { formatPrecio } = require('./assistant/responseBuilder');
const { sendWhatsAppMessage, sendWhatsAppImage } = require('./services/whatsappService');

// Máximo de imágenes de producto a enviar por mensaje de WhatsApp,
// para no saturar el chat del cliente cuando hay muchos resultados.
const MAX_WHATSAPP_IMAGES = 5;

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

// --- RUTAS DEL ASISTENTE VIRTUAL ---
app.use('/api/assistant', assistantRoutes);

// Exige el header "x-admin-key" (entregado al iniciar sesión en el panel)
// para cualquier ruta que cree, modifique o borre datos del catálogo.
const requireAdminKey = (req, res, next) => {
    const key = req.headers['x-admin-key'];
    if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
};

// --- LOGIN DEL PANEL ADMIN ---

app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        const result = await pool.query("SELECT password_admin FROM configuracion WHERE id = 1");
        const passwordGuardada = result.rows[0]?.password_admin || 'admin123';

        if (!password || password !== passwordGuardada) {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }

        res.json({ success: true, adminKey: process.env.ADMIN_API_KEY });
    } catch (err) {
        console.error("Error en POST /admin/login:", err);
        res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
    }
});

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
            });
        }
        // No se devuelve password_admin: es información sensible y esta
        // ruta es pública (la usa el catálogo para mostrar los enlaces de contacto).
        const { password_admin, ...configPublica } = result.rows[0];
        res.json(configPublica);
    } catch (err) {
        console.error("Error en GET /configuracion:", err);
        res.status(500).json({ error: "Error al cargar configuración" });
    }
});

app.put('/api/configuracion', requireAdminKey, async (req, res) => {
    try {
        const { facebook, instagram, tiktok, whatsapp, password_admin, google_maps, categoria_excluida } = req.body;

        // Solo se actualiza la contraseña si mandaron una nueva; si viene
        // vacía se conserva la actual (COALESCE con NULLIF evita que un
        // guardado normal de ajustes borre la contraseña sin querer).
        const result = await pool.query(
            `UPDATE configuracion
             SET facebook=$1, instagram=$2, tiktok=$3, whatsapp=$4, password_admin=COALESCE(NULLIF($5, ''), password_admin), google_maps=$6, categoria_excluida=$7
             WHERE id=1 RETURNING *`,
            [facebook, instagram, tiktok, whatsapp, password_admin, google_maps, categoria_excluida || null]
        );

        const { password_admin: _omit, ...configPublica } = result.rows[0];
        res.json(configPublica);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar ajustes" });
    }
});

// --- RUTAS DE PRODUCTOS ---

app.get('/api/productos', async (req, res) => {
    try {
        // ACTUALIZACIÓN: Ahora pedimos el ID y la URL para que el frontend pueda borrar fotos.
        // Las fotos extra se devuelven ordenadas por "orden" (reordenable desde el panel).
        const result = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre,
            (SELECT json_agg(img ORDER BY img.orden, img.id) FROM (SELECT id, imagen_url, orden FROM producto_imagenes WHERE producto_id = p.id) img) AS imagenes_extra
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

app.post('/api/productos', requireAdminKey, upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'imagenes_adicionales', maxCount: 10 }
]), async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria_id } = req.body;
        let imagen_url = null;
        if (req.files['imagen']) {
            imagen_url = await subirASupabase(req.files['imagen'][0]);
        } else if (req.body.imagen_url) {
            // Duplicar producto: reutiliza la imagen de un producto existente
            // sin volver a subirla (el frontend manda la URL ya publicada).
            imagen_url = req.body.imagen_url;
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

app.put('/api/productos/:id', requireAdminKey, upload.fields([
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

app.post('/api/categorias', requireAdminKey, async (req, res) => {
    try {
        const { nombre } = req.body;
        const result = await pool.query("INSERT INTO categorias (nombre) VALUES ($1) RETURNING *", [nombre]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al crear categoría" });
    }
});

app.put('/api/categorias/:id', requireAdminKey, async (req, res) => {
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

app.delete('/api/productos/:id', requireAdminKey, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM productos WHERE id = $1", [id]);
        res.json({ message: "Producto eliminado" });
    } catch (err) {
        res.status(500).json({ error: "No se pudo eliminar" });
    }
});

app.delete('/api/categorias/:id', requireAdminKey, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
        res.json({ message: "Categoría eliminada" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar categoría" });
    }
});

// Ruta para eliminar una foto específica de la galería
app.delete('/api/productos/foto/:fotoId', requireAdminKey, async (req, res) => {
    try {
        const { fotoId } = req.params;
        await pool.query("DELETE FROM producto_imagenes WHERE id = $1", [fotoId]);
        res.json({ message: "Foto eliminada de la galería" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar la foto" });
    }
});

// Reordena las fotos de la galería de un producto. Recibe el arreglo de
// ids de foto en el nuevo orden deseado y guarda su posición (0, 1, 2...).
app.put('/api/productos/:id/imagenes/orden', requireAdminKey, async (req, res) => {
    try {
        const { id } = req.params;
        const { orden } = req.body; // array de foto ids en el orden deseado
        if (!Array.isArray(orden)) {
            return res.status(400).json({ error: "Se esperaba un arreglo 'orden'" });
        }
        for (let i = 0; i < orden.length; i++) {
            await pool.query(
                "UPDATE producto_imagenes SET orden = $1 WHERE id = $2 AND producto_id = $3",
                [i, orden[i], id]
            );
        }
        res.json({ message: "Orden actualizado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al reordenar las fotos" });
    }
});

// Convierte una foto de la galería en la portada del producto, intercambiando
// su lugar con la portada actual (así no se pierde ninguna imagen).
app.put('/api/productos/:id/portada', requireAdminKey, async (req, res) => {
    try {
        const { id } = req.params;
        const { fotoId } = req.body;

        const prodRes = await pool.query("SELECT imagen_url FROM productos WHERE id = $1", [id]);
        const fotoRes = await pool.query("SELECT imagen_url FROM producto_imagenes WHERE id = $1 AND producto_id = $2", [fotoId, id]);

        if (prodRes.rows.length === 0 || fotoRes.rows.length === 0) {
            return res.status(404).json({ error: "Producto o foto no encontrados" });
        }

        const portadaActual = prodRes.rows[0].imagen_url;
        const nuevaPortada = fotoRes.rows[0].imagen_url;

        await pool.query("UPDATE productos SET imagen_url = $1 WHERE id = $2", [nuevaPortada, id]);
        await pool.query("UPDATE producto_imagenes SET imagen_url = $1 WHERE id = $2", [portadaActual, fotoId]);

        res.json({ message: "Portada actualizada", imagen_url: nuevaPortada });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al cambiar la portada" });
    }
});

// --- WEBHOOK DE WHATSAPP ---

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const expectedToken = process.env.WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === expectedToken) {
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages || [];
        const firstMessage = messages[0];

        if (firstMessage?.type === 'text' && firstMessage?.text?.body) {
            const messageBody = firstMessage.text.body;
            const sender = firstMessage.from;
            console.log('Webhook mensaje recibido:', { messageBody, sender });

            try {
                // Se procesa con el motor del asistente usando el número del
                // remitente como userId, para que cada cliente de WhatsApp
                // tenga su propio contexto de conversación (contextManager ya
                // soporta cualquier userId).
                const assistantResponse = await processMessage(messageBody, sender);
                console.log('Respuesta del asistente para WhatsApp:', assistantResponse.response);

                if (assistantResponse.success) {
                    await sendWhatsAppMessage(sender, assistantResponse.response);

                    // Envía las fotos de los productos encontrados (si tienen
                    // imagen), además del texto de la respuesta.
                    const productsWithImage = (assistantResponse.products || [])
                        .filter((p) => p.imagen_url)
                        .slice(0, MAX_WHATSAPP_IMAGES);

                    for (const product of productsWithImage) {
                        const caption = `${product.nombre} - ${formatPrecio(product.precio)}`;
                        await sendWhatsAppImage(sender, product.imagen_url, caption);
                    }
                }
            } catch (err) {
                // No se detiene el servidor ni se deja de responder 200 a
                // Meta: solo se registra el error para revisarlo después.
                console.error('Error procesando mensaje de WhatsApp:', err);
            }
        }

        // Siempre 200, incluso si algo falló arriba, para que Meta no reintente.
        return res.status(200).send('EVENT_RECEIVED');
    }

    return res.sendStatus(404);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});