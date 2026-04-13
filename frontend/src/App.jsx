import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
// Ya no necesitamos importar Navbar si no lo vamos a usar
import CatalogoPublico from './pages/CatalogoPublico'
import PanelAdmin from './pages/PanelAdmin'
import Login from './pages/Login'
import ErrorBoundary from './components/ErrorBoundary'

function RutaProtegida({ children }) {
  const auth = localStorage.getItem('auth')
  if (!auth) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      {/* Cambié bg-gray-50 por bg-zinc-950 para que no haya destellos blancos al cargar */}
      <div className="min-h-screen bg-zinc-950">
        {/* Se eliminó el componente <Navbar /> para limpiar la interfaz */}
        <Routes>
          <Route path="/" element={<CatalogoPublico />} />
          <Route
            path="/admin"
            element={
              <RutaProtegida>
                <ErrorBoundary>
                  <PanelAdmin />
                </ErrorBoundary>
              </RutaProtegida>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App