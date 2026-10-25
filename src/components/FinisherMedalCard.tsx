import React, { useState, useEffect } from 'react';
import { Award, ZoomIn, X, Sparkles, MapPin } from 'lucide-react';
import defaultOfficialMedal from '../assets/official-medal.png';

export const FinisherMedalCard: React.FC = () => {
  const [medalImage, setMedalImage] = useState<string>(defaultOfficialMedal);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    // 1. Fetch from server (/api/medal) to guarantee the real admin-uploaded photo
    const fetchMedal = () => {
      fetch('/api/medal')
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((data) => {
          if (data && data.image) {
            setMedalImage(data.image);
            setUpdatedAt(data.updatedAt || String(Date.now()));
            try {
              localStorage.setItem('ohana_medal_photo_v2', data.image);
            } catch (e) {}
          } else {
            // Keep the default permanent official medal
            setMedalImage(defaultOfficialMedal);
          }
        })
        .catch((err) => {
          console.warn('Conexión con /api/medal:', err);
          const local = localStorage.getItem('ohana_medal_photo_v2');
          if (local && local.startsWith('data:image')) {
            setMedalImage(local);
          } else {
            setMedalImage(defaultOfficialMedal);
          }
        });
    };

    fetchMedal();

    // 2. Real-time updates: poll every 3.5 seconds and on window focus for all devices/browsers
    const pollInterval = setInterval(fetchMedal, 3500);
    const handleUpdate = () => fetchMedal();

    window.addEventListener('ohana_medal_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('ohana_medal_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-lime-400/40 p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-lime-400 hover:shadow-[0_0_40px_rgba(163,230,53,0.25)]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title - clean, non-bulky, no 'metálica' */}
      <div className="text-center mb-4">
        <h3 className="font-bebas text-3xl sm:text-4xl tracking-wider text-white uppercase flex items-center justify-center gap-2">
          Medalla <span className="text-lime-400 text-glow-lime">Finisher 5K</span>
        </h3>
        <p className="text-xs text-neutral-400 font-medium">
          Exclusiva para todos los que crucen la meta en Entre Jarras
        </p>
      </div>

      {/* Main Medal Display */}
      <div className="relative mx-auto my-2 w-full max-w-[280px] flex flex-col items-center justify-center">
        <div className="relative group/photo flex flex-col items-center w-full">
          <div className="relative rounded-2xl overflow-hidden border-2 border-lime-400/70 shadow-[0_0_30px_rgba(163,230,53,0.3)] bg-black/90 p-2 w-full flex items-center justify-center min-h-[250px]">
            <img
              src={medalImage || defaultOfficialMedal}
              alt="Medalla Finisher Oficial OHANA GO 5K"
              className="w-full max-h-[350px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] transition-transform duration-300 group-hover/photo:scale-105 cursor-pointer"
              onClick={() => setIsZoomed(true)}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src !== defaultOfficialMedal) {
                  target.src = defaultOfficialMedal;
                }
              }}
            />
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
        <span className="flex items-center gap-1.5 text-neutral-300">
          <Award className="w-4 h-4 text-amber-400" />
          Medalla oficial con relieve
        </span>
        <span className="text-lime-400 font-bold">
          Cinta oficial
        </span>
      </div>

      {/* Modal: Fullscreen View of the Medal */}
      {isZoomed && medalImage && (
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
                src={medalImage || defaultOfficialMedal}
                alt="Medalla Finisher Oficial OHANA GO 5K"
                className="max-h-[80vh] w-auto rounded-2xl object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== defaultOfficialMedal) {
                    target.src = defaultOfficialMedal;
                  }
                }}
              />
            </div>
            <p className="text-xs text-lime-400 font-bold uppercase tracking-wider mt-3">
              Medalla Finisher Oficial • Tarapoto
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
