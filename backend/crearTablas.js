const pool = require('./db');

const crearTablas = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        tema_visual VARCHAR(50) DEFAULT 'general'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        imagen_url TEXT,
        categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE
      );
    `);

    console.log("✅ ¡Tablas creadas exitosamente en Supabase!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creando las tablas:", error);
    process.exit(1);
  }
};

crearTablas();