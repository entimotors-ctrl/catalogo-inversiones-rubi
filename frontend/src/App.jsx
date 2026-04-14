import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import CatalogoPublico from './pages/CatalogoPublico'
import PanelAdmin from './pages/PanelAdmin'
import Login from './pages/Login'
import ErrorBoundary from './components/ErrorBoundary'
import RedesFlotantes from './components/RedesFlotantes'

// Componente para proteger rutas privadas
function RutaProtegida({ children }) {
  const auth = localStorage.getItem('auth')
  if (!auth) {
    return <Navigate to="/login" replace />
  }
  return children
}

// 1. Creamos este componente para decidir si mostrar o no las Redes Flotantes
function NavegacionGlobal() {
  const location = useLocation();
  
  // Definimos las rutas donde NO queremos ver los botones flotantes
  const ocultarEnRutas = ['/admin', '/login'];
  
  // Si la ruta actual está en la lista negra, no renderizamos nada
  if (ocultarEnRutas.includes(location.pathname)) {
    return null;
  }

  // Si es el catálogo público (/), se muestran los botones
  return <RedesFlotantes />;
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

        {/* 2. Este componente ahora controla la visibilidad inteligentemente */}
        <NavegacionGlobal /> 
      </div>
    </BrowserRouter>
  )
}

export default App