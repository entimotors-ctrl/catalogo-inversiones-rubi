import { useEffect, useState } from 'react';
import api from '../services/api';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaArrowUp, FaMapMarkerAlt, FaShare } from 'react-icons/fa';

const RedesFlotantes = () => {
  const [config, setConfig] = useState(null);
  const [showScroll, setShowScroll] = useState(false);
  const [abierto, setAbierto] = useState(false);

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

  const botonesRedes = [
    config.whatsapp && {
      href: `https://wa.me/${config.whatsapp.replace(/\D/g, '')}`,
      icon: <FaWhatsapp size={20} />,
      bg: 'bg-[#25D366]',
      shadow: 'shadow-[0_4px_15px_rgba(37,211,102,0.5)]',
      label: 'WhatsApp',
    },
    config.google_maps && {
      href: config.google_maps,
      icon: <FaMapMarkerAlt size={18} />,
      bg: 'bg-blue-600',
      shadow: 'shadow-[0_4px_15px_rgba(37,99,235,0.5)]',
      label: 'Ubicación',
    },
    config.tiktok && {
      href: config.tiktok,
      icon: <FaTiktok size={17} />,
      bg: 'bg-black border border-white/20',
      shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.6)]',
      label: 'TikTok',
    },
    config.facebook && {
      href: config.facebook,
      icon: <FaFacebook size={19} />,
      bg: 'bg-[#1877F2]',
      shadow: 'shadow-[0_4px_15px_rgba(24,119,242,0.5)]',
      label: 'Facebook',
    },
    config.instagram && {
      href: config.instagram,
      icon: <FaInstagram size={19} />,
      bg: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
      shadow: 'shadow-[0_4px_15px_rgba(238,42,123,0.5)]',
      label: 'Instagram',
    },
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.4) translateY(20px); }
          70%  { transform: scale(1.1) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes popOut {
          0%   { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.4) translateY(20px); }
        }
        @keyframes scrollIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .btn-pop-in  { animation: popIn  0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .btn-pop-out { animation: popOut 0.2s ease-in forwards; }
        .scroll-in   { animation: scrollIn 0.3s ease forwards; }
      `}</style>

      {/* Contenedor principal — flex column, el orden visual es: redes → toggle → flecha */}
      <div className="fixed bottom-4 right-3 md:bottom-8 md:right-6 z-[9999] flex flex-col items-center gap-3">

        {/* Botones de redes desplegables */}
        <div className="flex flex-col items-center gap-3">
          {botonesRedes.map((btn, i) => (
            <a
              key={btn.label}
              href={btn.href}
              target="_blank"
              rel="noreferrer"
              title={btn.label}
              className={`
                w-11 h-11 rounded-full flex items-center justify-center text-white
                ${btn.bg} ${btn.shadow}
                transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:brightness-110 active:scale-95
                ${abierto ? 'btn-pop-in' : 'btn-pop-out pointer-events-none'}
              `}
              style={{
                animationDelay: abierto
                  ? `${i * 0.06}s`
                  : `${(botonesRedes.length - 1 - i) * 0.04}s`,
              }}
            >
              {btn.icon}
            </a>
          ))}
        </div>

        {/* Botón principal toggle */}
        <button
          onClick={() => setAbierto(prev => !prev)}
          title={abierto ? 'Cerrar' : 'Redes sociales'}
          className={`
            w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl
            transition-all duration-300 hover:scale-110 active:scale-95
            ${abierto
              ? 'bg-rose-600 shadow-[0_4px_20px_rgba(225,29,72,0.6)] rotate-[135deg]'
              : 'bg-zinc-900 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rotate-0'}
          `}
          style={{ transition: 'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease' }}
        >
          <FaShare size={20} />
        </button>

        {/* Flecha scroll arriba — siempre debajo del toggle, se ajusta sola */}
        {showScroll && (
          <button
            onClick={subirArriba}
            title="Volver arriba"
            className="scroll-in w-10 h-10 rounded-full bg-zinc-900/90 backdrop-blur-md border border-white/10 text-rose-500 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 hover:bg-zinc-800 active:scale-95"
          >
            <FaArrowUp size={14} />
          </button>
        )}

      </div>
    </>
  );
};

export default RedesFlotantes;