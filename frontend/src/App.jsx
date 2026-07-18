import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import CatalogoPublico from './pages/CatalogoPublico'
import PanelAdmin from './pages/PanelAdmin'
import Login from './pages/Login'
import ErrorBoundary from './components/ErrorBoundary'
import RedesFlotantes from './components/RedesFlotantes'
import ChatAssistant from "./components/ChatAssistant/ChatAssistant";

// Componente para proteger rutas privadas
function RutaProtegida({ children }) {
  const auth = localStorage.getItem('auth')
  if (!auth) {
    return <Navigate to="/login" replace />
  }
  return children
}

// 1. Componente para decidir si mostrar o no las Redes Flotantes y el Asistente
function NavegacionGlobal() {
  const location = useLocation();

  // Definimos las rutas donde NO queremos ver los botones flotantes
  // ni el chat del asistente (ese es para clientes del catálogo, no para el admin)
  const ocultarEnRutas = ['/admin', '/login'];

  // Si la ruta actual está en la lista negra, no renderizamos nada
  if (ocultarEnRutas.includes(location.pathname)) {
    return null;
  }

  // Si es el catálogo público (/), se muestran los botones y el chat
  return (
    <>
      <RedesFlotantes />
      <ChatAssistant />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Añadimos overflow-x-hidden para evitar desplazamientos laterales en móviles */}
      <div className="min-h-screen bg-zinc-950 overflow-x-hidden">
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

        {/* Control de visibilidad de redes sociales y chat del asistente */}
        <NavegacionGlobal />
      </div>
    </BrowserRouter>
  )
}

export default App