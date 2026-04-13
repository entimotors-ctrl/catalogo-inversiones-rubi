import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import CatalogoPublico from './pages/CatalogoPublico'
import PanelAdmin from './pages/PanelAdmin'
import Login from './pages/Login'
import ErrorBoundary from './components/ErrorBoundary'
import RedesFlotantes from './components/RedesFlotantes' // <-- 1. Importamos el nuevo componente

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
      <div className="min-h-screen bg-zinc-950">
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

        {/* 2. Botones Flotantes aparecerán en todas las páginas */}
        <RedesFlotantes /> 
      </div>
    </BrowserRouter>
  )
}

export default App