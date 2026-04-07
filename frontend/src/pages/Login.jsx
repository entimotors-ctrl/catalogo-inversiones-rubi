import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === 'admin123') {
      localStorage.setItem('auth', 'true')
      setError('')
      navigate('/admin')
    } else {
      setError('Contraseña incorrecta')
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

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
