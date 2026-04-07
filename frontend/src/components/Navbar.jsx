import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">
        <Link to="/" className="hover:text-gray-300">Catálogo Todo en Uno</Link>
      </div>
      <div className="space-x-4">
        <Link to="/" className="hover:text-gray-300 transition duration-200">Catálogo</Link>
        <Link to="/admin" className="hover:text-gray-300 transition duration-200">Administración</Link>
      </div>
    </nav>
  )
}

export default Navbar