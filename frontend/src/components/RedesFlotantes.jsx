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

  // Ajuste de tamaño: w-10 en móvil (antes 11) y opacidad inicial de 80% para no tapar tanto
  const estiloIcono = "w-10 h-10 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-lg md:text-2xl transition-all hover:scale-110 active:scale-95 opacity-80 hover:opacity-100";

  return (
    <div className="fixed bottom-4 right-3 md:bottom-10 md:right-6 z-[9999] flex flex-col gap-2 md:gap-4 items-center">
      
      {showScroll && (
        <button 
          onClick={subirArriba}
          className={`${estiloIcono} bg-zinc-900/90 backdrop-blur-md border border-white/10 text-rose-500 mb-1`}
          title="Volver arriba"
        >
          <FaArrowUp />
        </button>
      )}

      {config.whatsapp && (
        <a 
          href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} 
          target="_blank" rel="noreferrer" 
          className={`${estiloIcono} bg-[#25D366] shadow-[0_5px_15px_rgba(37,211,102,0.3)]`}
          title="WhatsApp Ventas"
        >
          <FaWhatsapp className="text-[20px] md:text-[28px]" />
        </a>
      )}

      {config.google_maps && (
        <a 
          href={config.google_maps} 
          target="_blank" rel="noreferrer" 
          className={`${estiloIcono} bg-blue-600 shadow-[0_5px_15px_rgba(37,99,235,0.3)] border border-white/20`}
          title="Ver Ubicación en Mapa"
        >
          <FaMapMarkerAlt className="text-[18px] md:text-[22px]" />
        </a>
      )}

      {config.tiktok && (
        <a href={config.tiktok} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} bg-black border border-white/10`}>
          <FaTiktok className="text-[16px] md:text-[20px]" />
        </a>
      )}

      {config.facebook && (
        <a href={config.facebook} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} bg-[#1877F2]`}>
          <FaFacebook className="text-[18px] md:text-[22px]" />
        </a>
      )}

      {config.instagram && (
        <a href={config.instagram} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]`}>
          <FaInstagram className="text-[18px] md:text-[22px]" />
        </a>
      )}
    </div>
  );
};

export default RedesFlotantes;