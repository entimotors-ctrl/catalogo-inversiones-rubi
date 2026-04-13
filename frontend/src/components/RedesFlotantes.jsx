import { useEffect, useState } from 'react';
import api from '../services/api';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

const RedesFlotantes = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/configuracion');
        if (res.data) setConfig(res.data);
      } catch (error) {
        console.error("Error cargando redes sociales");
      }
    };
    fetchConfig();
  }, []);

  if (!config) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {/* Botón de WhatsApp - El más importante */}
      {config.whatsapp && (
        <a
          href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center text-2xl"
          title="Contáctanos por WhatsApp"
        >
          <FaWhatsapp />
        </a>
      )}

      {/* Botón de Facebook */}
      {config.facebook && (
        <a
          href={config.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1877F2] text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-xl"
        >
          <FaFacebook />
        </a>
      )}

      {/* Botón de Instagram */}
      {config.instagram && (
        <a
          href={config.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-xl"
        >
          <FaInstagram />
        </a>
      )}

      {/* Botón de TikTok */}
      {config.tiktok && (
        <a
          href={config.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-xl border border-white/20"
        >
          <FaTiktok />
        </a>
      )}
    </div>
  );
};

export default RedesFlotantes;