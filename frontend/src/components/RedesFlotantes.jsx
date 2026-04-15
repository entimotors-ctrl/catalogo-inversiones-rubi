import { useEffect, useState } from 'react';
import api from '../services/api';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaArrowUp, FaMapMarkerAlt } from 'react-icons/fa';

const RedesFlotantes = () => {
  const [config, setConfig] = useState(null);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await api.get('/configuracion');
        if (res.data) setConfig(res.data);
      } catch (err) {
        console.warn("Usando configuración por defecto");
      }
    };
    
    const handleScroll = () => setShowScroll(window.scrollY > 400);

    cargarDatos();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const subirArriba = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!config) return null;

  const estiloIcono = "w-11 h-11 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-xl md:text-2xl transition-all hover:scale-110 active:scale-95";

  return (
    <div className="fixed bottom-6 right-4 md:bottom-10 md:right-6 z-[9999] flex flex-col gap-3 md:gap-4 items-center">
      
      {showScroll && (
        <button 
          onClick={subirArriba}
          className={`${estiloIcono} bg-zinc-900/80 backdrop-blur-md border border-white/10 text-rose-500 mb-1`}
          title="Volver arriba"
        >
          <FaArrowUp />
        </button>
      )}

      {config.whatsapp && (
        <a 
          href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} 
          target="_blank" rel="noreferrer" 
          className={`${estiloIcono} bg-[#25D366] shadow-[0_10px_30px_rgba(37,211,102,0.4)]`}
          title="WhatsApp Ventas"
        >
          <FaWhatsapp size={28} />
        </a>
      )}

      {/* CAMBIO AQUÍ: Usamos google_maps en lugar de ubicacion */}
      {config.google_maps && (
        <a 
          href={config.google_maps} 
          target="_blank" rel="noreferrer" 
          className={`${estiloIcono} bg-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.4)] border-2 border-white/20`}
          title="Ver Ubicación en Mapa"
        >
          <FaMapMarkerAlt size={22} />
        </a>
      )}

      {config.tiktok && (
        <a href={config.tiktok} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} bg-black border border-white/10`}>
          <FaTiktok size={20} />
        </a>
      )}

      {config.facebook && (
        <a href={config.facebook} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} bg-[#1877F2]`}>
          <FaFacebook size={22} />
        </a>
      )}

      {config.instagram && (
        <a href={config.instagram} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]`}>
          <FaInstagram size={22} />
        </a>
      )}
    </div>
  );
};

export default RedesFlotantes;