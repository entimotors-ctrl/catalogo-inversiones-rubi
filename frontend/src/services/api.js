import axios from 'axios';

// VITE_API_URL permite apuntar al backend local durante desarrollo
// (ver frontend/.env.local). Si no está definida, usa el backend de producción.
const API_BASE = import.meta.env.VITE_API_URL || 'https://catalogo-inversiones-rubi.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adjunta la llave de administrador (obtenida al iniciar sesión en /login)
// a toda petición saliente. El backend solo la exige en rutas de
// escritura/borrado; en las rutas públicas de lectura simplemente se ignora.
api.interceptors.request.use((config) => {
  const adminKey = localStorage.getItem('adminKey');
  if (adminKey) {
    config.headers['x-admin-key'] = adminKey;
  }
  return config;
});

export default api;