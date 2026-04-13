import { useEffect, useState } from 'react';
import api from '../services/api';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaArrowUp } from 'react-icons/fa';

const RedesFlotantes = () => {
  const [config, setConfig] = useState(null);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    // 1. Cargar links desde el Manager
    const cargarConfig = async () => {
      try {
        const res = await api.get('/configuracion');
        if (res.data) setConfig(res.data);
      } catch (error) {
        console.warn("Error al cargar redes");
      }
    };
    
    // 2. Lógica para mostrar/ocultar el botón de subir
    const checkScroll = () => {
      if (window.pageYOffset > 400) setShowScroll(true);
      else setShowScroll(false);
    };

    cargarConfig();
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!config) return null;

  const btnBase = "w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-all hover:scale-110 active:scale-95";

  return (
    <div className="fixed bottom-10 right-6 z-[9999] flex flex-col gap-4 items-center">
      
      {/* BOTÓN VOLVER ARRIBA - Ahora vive aquí arriba del grupo */}
      {showScroll && (
        <button 
          onClick={scrollToTop}
          className={`${btnBase} bg-zinc-800 border border-white/20 text-rose-500 animate-bounce mb-2`}
        >
          <FaArrowUp />
        </button>
      )}

      {/* WHATSAPP */}
      {config.whatsapp && (
        <a 
          href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} 
          target="_blank" rel="noreferrer" 
          className={`${btnBase} w-14 h-14 md:w-16 md:h-16 bg-[#25D366] shadow-[0_10px_25px_rgba(37,211,102,0.4)] text-3xl`}
        >
          <FaWhatsapp />
        </a>
      )}

      {/* FACEBOOK */}
      {config.facebook && (
        <a href={config.facebook} target="_blank" rel="noreferrer" 
           className={`${btnBase} bg-[#1877F2] shadow-[0_10px_20px_rgba(24,119,242,0.3)]`}>
          <FaFacebook />
        </a>
      )}

      {/* INSTAGRAM */}
      {config.instagram && (
        <a href={config.instagram} target="_blank" rel="noreferrer" 
           className={`${btnBase} bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-[0_10px_20px_rgba(238,42,123,0.3)]`}>
          <FaInstagram />
        </a>
      )}
    </div>
  );
};

export default RedesFlotantes;