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

  // Estilos con animaciones suave
  const estiloIcono = "w-10 h-10 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-lg md:text-2xl transition-all hover:scale-125 active:scale-95 opacity-80 hover:opacity-100 animate-bounce hover:animate-none";

  return (
    <>
    <style>{`
      @keyframes floatUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-float { animation: floatUp 0.5s ease-out forwards; }
      .float-0 { animation-delay: 0s; }
      .float-1 { animation-delay: 0.1s; }
      .float-2 { animation-delay: 0.2s; }
      .float-3 { animation-delay: 0.3s; }
      .float-4 { animation-delay: 0.4s; }
      .float-5 { animation-delay: 0.5s; }
    `}</style>
    <div className="fixed bottom-4 right-3 md:bottom-10 md:right-6 z-[9999] flex flex-col gap-2 md:gap-4 items-center">
      
      {showScroll && (
        <button 
          onClick={subirArriba}
          className={`${estiloIcono} animate-float float-0 bg-zinc-900/90 backdrop-blur-md border border-white/10 text-rose-500 mb-1`}
          title="Volver arriba"
        >
          <FaArrowUp />
        </button>
      )}

      {config.whatsapp && (
        <a 
          href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} 
          target="_blank" rel="noreferrer" 
          className={`${estiloIcono} animate-float float-1 bg-[#25D366] shadow-[0_5px_15px_rgba(37,211,102,0.3)]`}
          title="WhatsApp Ventas"
        >
          <FaWhatsapp className="text-[20px] md:text-[28px]" />
        </a>
      )}

      {config.google_maps && (
        <a 
          href={config.google_maps} 
          target="_blank" rel="noreferrer" 
          className={`${estiloIcono} animate-float float-2 bg-blue-600 shadow-[0_5px_15px_rgba(37,99,235,0.3)] border border-white/20`}
          title="Ver Ubicación en Mapa"
        >
          <FaMapMarkerAlt className="text-[18px] md:text-[22px]" />
        </a>
      )}

      {config.tiktok && (
        <a href={config.tiktok} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} animate-float float-3 bg-black border border-white/10`}>
          <FaTiktok className="text-[16px] md:text-[20px]" />
        </a>
      )}

      {config.facebook && (
        <a href={config.facebook} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} animate-float float-4 bg-[#1877F2]`}>
          <FaFacebook className="text-[18px] md:text-[22px]" />
        </a>
      )}

      {config.instagram && (
        <a href={config.instagram} target="_blank" rel="noreferrer" 
           className={`${estiloIcono} animate-float float-5 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]`}>
          <FaInstagram className="text-[18px] md:text-[22px]" />
        </a>
      )}
    </div>
    </>
  );
};

export default RedesFlotantes;