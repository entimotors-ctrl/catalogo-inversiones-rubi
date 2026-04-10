import axios from 'axios'

// Determina dinámicamente la URL del API
let apiBaseURL = import.meta.env.VITE_API_BASE_URL

if (!apiBaseURL) {
  // Si no hay variable de entorno, construye la URL dinámicamente
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = 3000
  
  // Si estamos en localhost, intenta usar 0.0.0.0 o la IP local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // En desarrollo, asume que el backend está en el mismo puerto
    apiBaseURL = `${protocol}//localhost:${port}/api`
  } else {
    // En producción o desde otro dispositivo, usa el mismo hostname
    apiBaseURL = `${protocol}//${hostname}:${port}/api`
  }
}

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
