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

// Si el backend responde 401 es porque la llave guardada en este navegador
// quedó vieja o inválida (por ejemplo, después de rotar ADMIN_API_KEY en el
// servidor). En vez de dejar que cada pantalla falle en silencio con
// "No autorizado", se limpia la sesión y se manda a /login a buscar una
// llave nueva automáticamente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('auth');
      localStorage.removeItem('adminKey');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;