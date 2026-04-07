import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import CatalogoPublico from './pages/CatalogoPublico'
import CatalogoDemo from './pages/CatalogoDemo'
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<CatalogoPublico />} />
          <Route path="/demo" element={<CatalogoDemo />} />
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
