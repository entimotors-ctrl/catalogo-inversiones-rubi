import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const { data } = await api.post('/admin/login', { password })
      if (data.success && data.adminKey) {
        localStorage.setItem('auth', 'true')
        localStorage.setItem('adminKey', data.adminKey)
        navigate('/admin')
      } else if (data.success) {
        setError('El servidor no tiene configurada ADMIN_API_KEY. Contactá al administrador.')
      } else {
        setError('Contraseña incorrecta')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Contraseña incorrecta')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Inicio de Sesión</h1>
        <p className="text-sm text-gray-600 mb-6">Ingresa la contraseña para acceder al Panel de Administración.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button type="submit" disabled={cargando} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50">
            {cargando ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
