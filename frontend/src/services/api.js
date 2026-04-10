import axios from 'axios';

const api = axios.create({
  // Reemplaza esto con tu URL real de Render que aparece en tu captura
  baseURL: 'https://inversiones-rubi-web.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;