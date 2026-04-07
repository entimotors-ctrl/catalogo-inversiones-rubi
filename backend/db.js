const { Pool } = require('pg');
require('dotenv').config();

// Configuración explícita en lugar de connectionString para mejor manejo de caracteres especiales
const pool = new Pool({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mrnoglxbkzcrxqracpon',
  password: 'Inversionesrubi',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('❌ Error en el pool de conexiones:', err);
});

pool.on('connect', () => {
  console.log('📡 Conexión establecida con Supabase');
});

module.exports = pool;