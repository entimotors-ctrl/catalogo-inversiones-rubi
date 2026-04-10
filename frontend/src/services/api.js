import axios from 'axios'

// Determina dinámicamente la URL del API
let apiBaseURL = import.meta.env.VITE_API_BASE_URL

if (!apiBaseURL) {
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  
  // Si estamos en Render (dominio .onrender.com), usa la misma URL
  if (hostname.includes('onrender.com')) {
    apiBaseURL = `${protocol}//${hostname}/api`
  } 
  // Si estamos en localhost, usa localhost:3000
  else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    apiBaseURL = `${protocol}//localhost:3000/api`
  }
  // Si es otra IP (como en la red local), usa esa IP con puerto 3000
  else {
    apiBaseURL = `${protocol}//${hostname}:3000/api`
  }
}

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
