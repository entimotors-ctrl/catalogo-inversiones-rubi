const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.mrnoglxbkzcrxqracpon:Inversionesrubi@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log("🔍 Intentando conectar a Supabase...");
    const result = await pool.query('SELECT NOW()');
    console.log("✅ Conexión exitosa!");
    console.log("Hora del servidor:", result.rows[0].now);
    
    // Intentar obtener categorías
    console.log("\n🔍 Intentando insertar una categoría de prueba...");
    const insertResult = await pool.query(
      "INSERT INTO categorias (nombre, tema_visual) VALUES ($1, $2) RETURNING *",
      ["TestDesdeScript", "rojo"]
    );
    console.log("✅ Categoría insertada:", insertResult.rows[0]);
    
    // Obtener todas las categorías
    console.log("\n🔍 Obteniendo todas las categorías...");
    const selectResult = await pool.query("SELECT * FROM categorias");
    console.log("✅ Categorías encontradas:", selectResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    process.exit(1);
  }
}

testConnection();
