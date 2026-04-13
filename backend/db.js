const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mrnoglxbkzcrxqracpon',
  // OJO: Es mejor que pases esta contraseña al .env más adelante por seguridad ;)
  password: 'Inversionesrubi', 
  ssl: { rejectUnauthorized: false },
  
  // --- OPTIMIZACIONES PARA RENDER Y SUPABASE ---
  
  // 1. Reducimos el máximo de conexiones. Node es rápido, 5 es más que suficiente 
  // para evitar el cuello de botella en Supabase.
  max: 5, 
  
  // 2. Cerramos conexiones inactivas más rápido para liberar espacio.
  idleTimeoutMillis: 10000, 
  
  // 3. Si falla, que falle rápido y no deje la pantalla cargando 1 minuto.
  connectionTimeoutMillis: 5000, 
  
  // 4. ¡LA MAGIA! Evita que los balanceadores de Render corten la conexión de golpe.
  keepAlive: true 
});

// Manejo de errores para que el servidor no se caiga si hay un micro-corte
pool.on('error', (err, client) => {
  console.error('❌ Error inesperado en el cliente de base de datos:', err.message);
});

pool.on('connect', () => {
  console.log('📡 Conexión optimizada establecida con Supabase');
});

module.exports = pool;