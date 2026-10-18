import React, { useState, useEffect } from 'react';
import { Award, ZoomIn, X } from 'lucide-react';

export const FinisherMedalCard: React.FC = () => {
  // Inicializa con la foto guardada en localStorage o con la imagen oficial estática servida por el backend
  const [medalImage, setMedalImage] = useState<string>(() => {
    return localStorage.getItem('ohana_medal_photo_v2') || '/official-medal.png';
  });
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    // 1. Cargar primero de localStorage si existe
    const local = localStorage.getItem('ohana_medal_photo_v2');
    if (local) {
      setMedalImage(local);
    }

    // 2. Consultar al servidor (/api/medal) para garantizar la versión más actualizada en cualquier navegador
    fetch('/api/medal')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data && data.image) {
          setMedalImage(data.image);
          localStorage.setItem('ohana_medal_photo_v2', data.image);
        } else if (local) {
          // Si el servidor aún no la tiene pero el admin ya la tenía, persistirla en el backend
          fetch('/api/medal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: local }),
          }).catch(() => {});
        }
      })
      .catch((err) => {
        console.warn('Conexión con /api/medal:', err);
      });

    // 3. Escuchar actualizaciones en tiempo real realizadas desde el panel de administración
    const handleUpdate = () => {
      const saved = localStorage.getItem('ohana_medal_photo_v2');
      if (saved) setMedalImage(saved);
      fetch('/api/medal')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.image) {
            setMedalImage(data.image);
          }
        })
        .catch(() => {});
    };

    window.addEventListener('ohana_medal_updated', handleUpdate);
    return () => window.removeEventListener('ohana_medal_updated', handleUpdate);
  }, []);

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-lime-400/40 p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-lime-400 hover:shadow-[0_0_40px_rgba(163,230,53,0.3)]">
      {/* Background Neon Glow Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-lime-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-lime-500/25 transition-all" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="font-bebas text-3xl sm:text-4xl tracking-wider text-white uppercase flex items-center justify-center gap-2">
          Medalla <span className="text-lime-400 text-glow-lime">Finisher 5K</span>
        </h3>
        <p className="text-xs text-neutral-400 font-medium">
          Diseño oficial para todos los que crucen la meta en Entre Jarras
        </p>
      </div>

      {/* Main Medal Photo Display */}
      <div className="relative mx-auto my-2 w-full max-w-[280px] flex flex-col items-center justify-center">
        <div className="relative group/photo flex flex-col items-center w-full">
          <div className="relative rounded-2xl overflow-hidden border-2 border-lime-400/70 shadow-[0_0_35px_rgba(163,230,53,0.35)] bg-black/90 p-2 w-full flex items-center justify-center min-h-[260px]">
            {/* Ambient lighting */}
            <div className="absolute inset-0 bg-radial-[at_center] from-transparent via-transparent to-black/60 pointer-events-none" />
            
            <img
              src={medalImage || '/official-medal.png'}
              alt="Medalla Finisher Oficial OHANA GO 5K"
              onError={(e) => {
                // Fallback directo a la ruta pública del archivo
                const target = e.currentTarget;
                if (target.src !== window.location.origin + '/official-medal.png') {
                  target.src = '/official-medal.png';
                }
              }}
              className="w-full max-h-[380px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] transition-transform duration-300 group-hover/photo:scale-105 cursor-pointer"
              onClick={() => setIsZoomed(true)}
            />

            {/* Hover overlay for zoom */}
            <button
              onClick={() => setIsZoomed(true)}
              className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/80 text-lime-400 hover:text-white border border-lime-400/40 backdrop-blur-md opacity-0 group-hover/photo:opacity-100 transition cursor-pointer"
              title="Ver medalla ampliada"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer details */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
        <span className="flex items-center gap-1 text-neutral-300">
          <Award className="w-4 h-4 text-amber-400" />
          Medalla oficial con relieve
        </span>
        <span className="text-lime-400 font-bold">
          Cinta oficial
        </span>
      </div>

      {/* Modal: Fullscreen View of the Medal */}
      {isZoomed && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg">
          <div className="relative max-w-lg w-full flex flex-col items-center">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-12 right-0 p-2 text-neutral-300 hover:text-white bg-neutral-800 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative p-2 rounded-3xl bg-neutral-900 border-2 border-lime-400 shadow-[0_0_50px_rgba(163,230,53,0.4)]">
              <img
                src={medalImage || '/official-medal.png'}
                alt="Medalla Finisher Oficial OHANA GO 5K"
                className="max-h-[80vh] w-auto rounded-2xl object-contain"
              />
            </div>
            <p className="text-xs text-lime-400 font-bold uppercase tracking-wider mt-3">
              Medalla Finisher Oficial • Tarapoto 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
