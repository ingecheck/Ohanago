import React, { useState, useEffect } from 'react';
import { Award, Sparkles, ShieldCheck, ZoomIn, X } from 'lucide-react';

export const FinisherMedalCard: React.FC = () => {
  const [medalImage, setMedalImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    // Si hay una foto guardada de la medalla, la carga de inmediato
    const loadSaved = () => {
      const saved = localStorage.getItem('ohana_medal_photo_v2');
      setMedalImage(saved || null);
    };

    loadSaved();

    // Escucha actualizaciones realizadas desde el panel de admin
    const handleUpdate = () => loadSaved();
    window.addEventListener('ohana_medal_updated', handleUpdate);
    return () => window.removeEventListener('ohana_medal_updated', handleUpdate);
  }, []);

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-lime-400/40 p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-lime-400 hover:shadow-[0_0_40px_rgba(163,230,53,0.3)]">
      {/* Background Neon Glow Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-lime-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-lime-500/25 transition-all" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badges */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-500/40">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          Medalla Oficial 2026
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-lime-400 bg-lime-950/60 px-2.5 py-1 rounded-full border border-lime-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Finisher Metálica
        </span>
      </div>

      <div className="text-center mb-4">
        <h3 className="font-bebas text-3xl sm:text-4xl tracking-wider text-white uppercase flex items-center justify-center gap-2">
          Medalla <span className="text-lime-400 text-glow-lime">Finisher 5K</span>
        </h3>
        <p className="text-xs text-neutral-400 font-medium">
          Diseño oficial para todos los que crucen la meta en Entre Jarras
        </p>
      </div>

      {/* Main Medal Display Container */}
      <div className="relative mx-auto my-2 w-full max-w-[280px] flex flex-col items-center justify-center">
        
        {medalImage ? (
          /* USER UPLOADED EXACT PHOTO WITH ILLUMINATION */
          <div className="relative group/photo flex flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-lime-400/60 shadow-[0_0_35px_rgba(163,230,53,0.35)] bg-black">
              {/* Backlight / Ambient smoke lighting */}
              <div className="absolute inset-0 bg-radial-[at_center] from-transparent via-transparent to-black/70 pointer-events-none" />
              
              <img
                src={medalImage}
                alt="Medalla Finisher Oficial OHANA GO 5K"
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
        ) : (
          /* EXACT FAITHFUL 1:1 RECREATION OF THE MEDAL PHOTO WITH ILLUMINATION */
          <div className="relative w-full flex flex-col items-center">
            
            {/* LANYARD RIBBON (Exact text and colors from the photo) */}
            <div className="relative w-36 h-28 -mb-4 z-0">
              {/* V-shape Ribbon Band */}
              <div className="w-full h-full flex justify-center">
                {/* Left side: OHANA GO */}
                <div className="w-16 h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-x border-neutral-700 p-1 flex flex-col items-center justify-center transform -rotate-6 origin-bottom-right shadow-2xl">
                  <span className="text-[10px] font-black tracking-widest text-white transform -rotate-90 origin-center font-bebas">
                    OHANA <span className="text-lime-400">GO</span>
                  </span>
                </div>
                {/* Right side: 5K HALLOWEEN TARAPOTO 2026 */}
                <div className="w-16 h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-x border-neutral-700 p-1 flex flex-col items-center justify-center transform rotate-6 origin-bottom-left shadow-2xl">
                  <div className="transform -rotate-90 origin-center flex items-center gap-1 whitespace-nowrap">
                    <span className="text-[11px] font-bebas text-lime-400 font-bold">5K</span>
                    <span className="text-[9px] font-marker text-orange-500">HALLOWEEN</span>
                    <span className="text-[7px] font-bold text-white tracking-widest">TARAPOTO 2026</span>
                  </div>
                </div>
              </div>

              {/* Metal Lanyard Hanger Ring */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-5 rounded-full border-2 border-neutral-400 bg-neutral-900 shadow-lg z-10" />
            </div>

            {/* 3D CUTOUT DIE-CAST METAL MEDAL BODY */}
            <div className="relative z-10 w-64 rounded-3xl bg-gradient-to-br from-neutral-300 via-neutral-800 to-neutral-950 p-2 shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(163,230,53,0.25)] border-2 border-neutral-400/80">
              {/* Inner metallic bezel */}
              <div className="relative rounded-2xl bg-neutral-950 p-2 overflow-hidden border border-neutral-700">
                
                {/* Dusk / Sunset Tropical Sky Gradient (Inside the 5K cutouts) */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gradient-to-b from-purple-900 via-orange-600 to-amber-500 border border-neutral-800">
                  
                  {/* Vector Scene: Sunset, Palms & Dual Runners Silhouette */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 180" fill="none">
                    {/* Glowing Sun / Moon */}
                    <circle cx="95" cy="115" r="26" fill="#fef08a" opacity="0.95" />
                    
                    {/* Mountain Silhouettes */}
                    <path d="M 0 150 Q 60 120 120 135 Q 180 115 240 150 L 240 180 L 0 180 Z" fill="#120c18" />
                    
                    {/* River Reflection */}
                    <path d="M 85 142 L 105 142 L 120 180 L 70 180 Z" fill="#ea580c" opacity="0.75" />
                    
                    {/* Palm Trees Left (inside the "5") */}
                    <path d="M 30 180 Q 35 130 45 90" stroke="#09090b" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 45 90 Q 20 85 5 100 M 45 90 Q 35 70 20 65 M 45 90 Q 60 70 75 75 M 45 90 Q 70 90 80 105" stroke="#09090b" strokeWidth="4" strokeLinecap="round" />
                    
                    {/* Palm Trees Right (inside the "K") */}
                    <path d="M 210 180 Q 205 130 195 85" stroke="#09090b" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 195 85 Q 170 80 160 95 M 195 85 Q 180 65 170 58 M 195 85 Q 215 65 225 72 M 195 85 Q 220 85 228 100" stroke="#09090b" strokeWidth="4" strokeLinecap="round" />
                    
                    {/* Male and Female Runners Silhouette (Exact like the photo) */}
                    <g fill="#0a0a0c" transform="translate(138, 98) scale(0.7)">
                      {/* Male Runner */}
                      <circle cx="20" cy="14" r="5.5" />
                      <path d="M 18 20 L 22 38 L 29 55 M 20 30 L 12 44 M 18 24 L 10 34 M 22 24 L 32 30" stroke="#0a0a0c" strokeWidth="3.5" strokeLinecap="round" />
                      {/* Female Runner with Ponytail */}
                      <circle cx="44" cy="16" r="5" />
                      <path d="M 40 15 Q 36 12 34 16" stroke="#0a0a0c" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 42 22 L 45 38 L 52 54 M 43 32 L 37 45 M 40 26 L 32 35 M 46 26 L 54 32" stroke="#0a0a0c" strokeWidth="3.5" strokeLinecap="round" />
                    </g>
                  </svg>

                  {/* Giant 3D Beveled "5K" Lettering Cutout Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="font-bebas text-7xl font-black text-white/10 tracking-tighter stroke-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                      5K
                    </span>
                  </div>

                  {/* Cutout Mask Simulation: The top 5K shape */}
                  <div className="absolute top-2 left-3 font-bebas text-4xl text-white font-extrabold tracking-tighter drop-shadow-md">
                    5
                  </div>
                  <div className="absolute top-2 right-3 font-bebas text-4xl text-white font-extrabold tracking-tighter drop-shadow-md">
                    K
                  </div>
                </div>

                {/* MIDDLE: 3D OHANA GO & HALLOWEEN LOGO OVERLAY */}
                <div className="relative -mt-6 z-20 bg-neutral-950/95 rounded-2xl p-2.5 border-2 border-neutral-700 shadow-2xl text-center">
                  <div className="font-bebas text-3xl tracking-wider text-white leading-none drop-shadow-md flex items-center justify-center gap-1">
                    OHANA <span className="text-lime-400 text-glow-lime">GO</span>
                  </div>
                  <div className="font-marker text-base text-orange-500 text-glow-orange leading-tight tracking-wider -mt-0.5">
                    HALLOWEEN
                  </div>

                  {/* BOTTOM HEXAGONAL CREST: FINISHER TARAPOTO • 2026 */}
                  <div className="mt-1 pt-1.5 border-t border-neutral-800 bg-neutral-900/90 rounded-lg p-1.5">
                    <span className="font-bebas text-xs tracking-widest text-neutral-200 uppercase font-black block">
                      FINISHER
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 block font-bold font-mono">
                      TARAPOTO • 2026
                    </span>
                    {/* Orange Bat Silhouette Icon */}
                    <div className="flex justify-center mt-1 text-orange-500">
                      <svg className="w-5 h-3 fill-current" viewBox="0 0 24 14">
                        <path d="M12 4 C10 1, 6 0, 0 3 C3 6, 4 9, 5 13 C8 11, 10 11, 12 13 C14 11, 16 11, 19 13 C20 9, 21 6, 24 3 C18 0, 14 1, 12 4 Z" />
                      </svg>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Footer details */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
        <span className="flex items-center gap-1 text-neutral-300">
          <Award className="w-4 h-4 text-amber-400" />
          Troquel metálico fundido con relieve
        </span>
        <span className="text-lime-400 font-bold">
          Cinta sublimada oficial
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
                src={medalImage}
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
