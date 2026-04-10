import axios from 'axios'

// Forzamos la URL de producción de Render para evitar errores en móviles
const apiBaseURL = 'https://inversiones-rubi-web.onrender.com/api'

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para depuración (opcional, ayuda a ver errores en consola)
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la llamada API:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api