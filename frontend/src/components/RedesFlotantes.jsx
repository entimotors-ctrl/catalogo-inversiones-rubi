import { useEffect, useState } from 'react';
import api from '../services/api';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaArrowUp } from 'react-icons/fa';

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

  const estiloIcono = "w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-all hover:scale-110 active:scale-95";

  return (
    <div className="fixed bottom-10 right-6 z-[9999] flex flex-col gap-4 items-center">
      
      {/* BOTÓN VOLVER ARRIBA */}
      {showScroll && (
        <button 
          onClick={subirArriba}
          className={`${estiloIcono} bg-zinc-800 border border-white/20 text-rose-500 animate-bounce mb-2`}
          title="Volver arriba"
        >
          <FaArrowUp />
        </button>
      )}

      {/* WHATSAPP */}
      {config.whatsapp && (
        <a 
          href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} 
          target="_blank" rel="noreferrer" 
          className={`${estiloIcono} w-14 h-14 md:w-16 md:h-16 bg-[#25D366] shadow-[0_10px_30px_rgba(37,211,102,0.4)] text-3xl`}
        >
          <FaWhatsapp />
        </a>
      )}

      {/* TIKTOK - ¡Agregado ahora! */}
      {config.tiktok && (
        <a href={config.tiktok} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} bg-black border border-white/10 shadow-lg`}>
          <FaTiktok />
        </a>
      )}

      {/* FACEBOOK */}
      {config.facebook && (
        <a href={config.facebook} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} bg-[#1877F2] shadow-lg`}>
          <FaFacebook />
        </a>
      )}

      {/* INSTAGRAM */}
      {config.instagram && (
        <a href={config.instagram} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-lg`}>
          <FaInstagram />
        </a>
      )}
    </div>
  );
};

export default RedesFlotantes;