// ... (Todo el inicio de tu archivo se mantiene igual hasta la ruta GET de productos)

// --- RUTAS DE PRODUCTOS ---

app.get('/api/productos', async (req, res) => {
    try {
        // CORRECCIÓN: Ahora traemos el ID y la URL de las fotos extras para poder borrarlas individualmente
        const result = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre,
            (
                SELECT json_agg(img) 
                FROM (
                    SELECT id, imagen_url 
                    FROM producto_imagenes 
                    WHERE producto_id = p.id
                ) img
            ) AS imagenes_extra
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            ORDER BY p.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error en GET /productos:", err);
        res.status(500).json({ error: "Error al cargar productos" });
    }
});

// ... (Las rutas POST y PUT se mantienen iguales a como las tienes)

// ... (Tus rutas de categorías y eliminación de producto completo se mantienen iguales)

// --- RUTA DE ELIMINACIÓN DE FOTO INDIVIDUAL ---
// Mueve este bloque justo ARRIBA de app.listen para tenerlo ordenado
app.delete('/api/productos/foto/:fotoId', async (req, res) => {
    try {
        const { fotoId } = req.params;
        
        // Verificación de seguridad: si no viene el ID, lanzamos error antes de tocar la DB
        if (!fotoId || fotoId === 'undefined') {
            return res.status(400).json({ error: "ID de foto no válido" });
        }

        const result = await pool.query("DELETE FROM producto_imagenes WHERE id = $1", [fotoId]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "La foto no existe en la base de datos" });
        }

        res.json({ message: "Foto eliminada de la galería" });
    } catch (err) {
        console.error("Error al eliminar foto:", err);
        res.status(500).json({ error: "Error interno al eliminar la foto" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});