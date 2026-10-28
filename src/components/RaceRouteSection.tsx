import React, { useState } from 'react';
import { CheckCircle2, ZoomIn, X, Maximize2 } from 'lucide-react';

export const RaceRouteSection: React.FC = () => {
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  return (
    <section id="ruta-5k" className="pt-6 pb-6 px-4 max-w-7xl mx-auto">
      {/* Main Container: High-fidelity Visual Route Map */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-lime-500/30">
        
        {/* Route Card Header with Prominent Large Title & Details */}
        <div className="border-b border-neutral-800/80 pb-5 mb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-lime-400 via-lime-500 to-lime-600 text-black flex items-center justify-center font-bebas text-3xl sm:text-4xl shadow-xl shadow-lime-400/25 shrink-0">
                5K
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-white tracking-wider leading-none">
                    OHANA GO <span className="text-lime-400 text-glow-lime">HALLOWEEN</span>
                  </h2>
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-black uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm">
                    RUTA OFICIAL
                  </span>
                </div>
                {/* Important route details in small clear text */}
                <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                  De la <strong className="text-white">Plaza de Armas de Tarapoto</strong> (Concentración 5:30 PM • Partida 7:00 PM) hasta <strong className="text-white">Entre Jarras (Jr. Lima cda. 13)</strong>. Recorrido 100% asfaltado e iluminado.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="px-3.5 py-1.5 rounded-xl bg-lime-950/60 border border-lime-500/40 text-xs font-bold text-lime-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400" />
                Puntos de Control & Guía Policial
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-300">
                Tarapoto • 5.00 km exactos
              </span>
            </div>
          </div>
        </div>

        {/* Visual Map Layout Graphic */}
        <div className="relative w-full rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 p-4 sm:p-6 overflow-hidden">
          
          {/* Subtle street grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:28px_28px] opacity-25 pointer-events-none" />

          {/* Tropical palm corner accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Map Vector with exact circuit geometry */}
          <div className="relative z-10 w-full max-w-4xl mx-auto py-4">
            <svg
              className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              viewBox="0 0 900 620"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Glow filter for neon yellow/lime route */}
                <filter id="routeNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur1" />
                  <feGaussianBlur stdDeviation="14" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* City blocks silhouettes (Tarapoto street grid) */}
              <g stroke="#262626" strokeWidth="2" strokeDasharray="3 3" opacity="0.6">
                {/* Grid diagonal lines representing streets */}
                <path d="M 120 520 L 320 280" />
                <path d="M 200 560 L 400 320" />
                <path d="M 280 600 L 480 360" />
                <path d="M 360 620 L 560 380" />
                <path d="M 440 620 L 640 400" />
                <path d="M 520 620 L 720 420" />

                <path d="M 200 320 L 480 560" />
                <path d="M 280 260 L 560 500" />
                <path d="M 360 200 L 640 440" />
                <path d="M 440 140 L 720 380" />
                <path d="M 520 80 L 800 320" />
              </g>

              {/* River/stream silhouette near La Collpa (right edge) */}
              <path
                d="M 880 180 Q 860 280 875 360 Q 885 450 860 540"
                stroke="#0284c7"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* ROUTE LINE: Yellow/Lime Neon Path */}
              {/* Dark base outline */}
              <path
                d="
                  M 670 470
                  L 760 540
                  L 820 490
                  L 740 420
                  L 790 320
                  L 480 140
                  L 260 50
                  L 150 70
                  L 180 280
                  L 190 360
                  L 160 385
                "
                stroke="#171717"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Glowing Route Line */}
              <path
                d="
                  M 670 470
                  L 760 540
                  L 820 490
                  L 740 420
                  L 790 320
                  L 480 140
                  L 260 50
                  L 150 70
                  L 180 280
                  L 190 360
                  L 160 385
                "
                stroke="#ccff00"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#routeNeonGlow)"
              />

              {/* Direction Arrows along the circuit */}
              <g fill="#000">
                {/* Jr. Maynas arrow */}
                <polygon points="720,505 710,500 715,512" fill="#000" />
                {/* Jr. Moyobamba arrow */}
                <polygon points="785,510 790,522 798,512" fill="#000" />
                {/* Av Circunvalacion arrow 1 */}
                <polygon points="630,225 642,230 635,240" fill="#000" />
                {/* Av Circunvalacion arrow 2 */}
                <polygon points="360,95 372,102 368,112" fill="#000" />
                {/* Av Circunvalacion south arrow */}
                <polygon points="175,220 178,206 186,218" fill="#000" />
              </g>

              {/* Street Label Tags */}
              {/* 1. Jr. Maynas */}
              <g transform="translate(685, 520) rotate(35)">
                <rect x="-8" y="-12" width="95" height="22" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" />
                <text x="5" y="3" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Jr. Maynas</text>
              </g>

              {/* 2. Jr. Moyobamba */}
              <g transform="translate(775, 480) rotate(-40)">
                <rect x="-8" y="-12" width="115" height="22" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" />
                <text x="3" y="3" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Jr. Moyobamba</text>
              </g>

              {/* 3. Jr. Alegría A. Morey */}
              <g transform="translate(735, 400) rotate(-40)">
                <rect x="-8" y="-12" width="145" height="22" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" />
                <text x="2" y="3" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Jr. Alegría A. Morey</text>
              </g>

              {/* 4. La Collpa Landmark */}
              <g transform="translate(795, 345)">
                <rect x="-10" y="-14" width="85" height="26" rx="8" fill="#1c0f38" stroke="#f97316" strokeWidth="2" />
                <text x="4" y="3" fill="#f97316" fontSize="12" fontWeight="900" fontFamily="sans-serif">La Collpa</text>
                {/* Cutlery / landmark icon */}
                <circle cx="100" cy="0" r="14" fill="#ea580c" />
                <text x="96" y="5" fill="#fff" fontSize="12">🍽️</text>
              </g>

              {/* 5. Av. Circunvalación (East stretch) */}
              <g transform="translate(620, 240) rotate(-30)">
                <rect x="-10" y="-14" width="145" height="24" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" />
                <text x="4" y="3" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Av. Circunvalación</text>
              </g>

              {/* 6. Av. Circunvalación (Top stretch) */}
              <g transform="translate(380, 105) rotate(-22)">
                <rect x="-10" y="-14" width="145" height="24" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" />
                <text x="4" y="3" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Av. Circunvalación</text>
              </g>

              {/* 7. Av. Circunvalación (West stretch) */}
              <g transform="translate(130, 200) rotate(80)">
                <rect x="-10" y="-14" width="145" height="24" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" />
                <text x="4" y="3" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Av. Circunvalación</text>
              </g>

              {/* 8. Jr. Paraíso */}
              <g transform="translate(145, 350) rotate(-35)">
                <rect x="-8" y="-12" width="85" height="22" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" />
                <text x="5" y="3" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Jr. Paraíso</text>
              </g>

              {/* INICIO MARKER: Plaza de Armas de Tarapoto */}
              <g transform="translate(670, 470)">
                {/* Glowing ring */}
                <circle cx="0" cy="0" r="28" fill="#15803d" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="16" fill="#22c55e" stroke="#ffffff" strokeWidth="4" />
                <circle cx="0" cy="0" r="8" fill="#14532d" />

                {/* Banner box */}
                <g transform="translate(-160, -60)">
                  <rect x="0" y="0" width="150" height="52" rx="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))" />
                  <text x="10" y="18" fill="#713f12" fontSize="11" fontWeight="900" fontFamily="sans-serif">INICIO</text>
                  <text x="10" y="32" fill="#000000" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Plaza de Armas</text>
                  <text x="10" y="44" fill="#451a03" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Concentración 5:30 PM (Partida 7 PM)</text>
                </g>
              </g>

              {/* LLEGADA MARKER: Entre Jarras (Jr. Lima cda. 13) */}
              <g transform="translate(160, 385)">
                {/* Glowing ring */}
                <circle cx="0" cy="0" r="28" fill="#ea580c" opacity="0.4" className="animate-ping" />
                <circle cx="0" cy="0" r="16" fill="#f97316" stroke="#ffffff" strokeWidth="4" />
                <circle cx="0" cy="0" r="8" fill="#7c2d12" />

                {/* Banner box */}
                <g transform="translate(30, -55)">
                  <rect x="0" y="0" width="170" height="54" rx="10" fill="#ea580c" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.6))" />
                  <text x="12" y="18" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="sans-serif">🏁 LLEGADA</text>
                  <text x="12" y="33" fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Entre Jarras</text>
                  <text x="12" y="47" fill="#ffedd5" fontSize="10" fontWeight="bold" fontFamily="sans-serif">(Jr. Lima cda. 13)</text>
                </g>
              </g>

              {/* Compass North Arrow */}
              <g transform="translate(850, 40)">
                <circle cx="0" cy="0" r="22" fill="#000" stroke="#404040" strokeWidth="2" />
                <path d="M 0 -14 L 6 8 L 0 4 L -6 8 Z" fill="#ffffff" />
                <text x="-4" y="-18" fill="#ffffff" fontSize="11" fontWeight="bold">N</text>
              </g>
            </svg>
          </div>

          {/* Interactive Zoom Indicator Button */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-black/85 hover:bg-black text-lime-400 hover:text-white border border-lime-400/50 backdrop-blur-md text-xs font-bold transition flex items-center gap-2 shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
              title="Ampliar mapa oficial 5K"
            >
              <ZoomIn className="w-4 h-4 text-lime-400 animate-pulse" />
              <span>🔍 Toca para ampliar el mapa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen HD Zoom Modal for Route Map */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl">
          <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-neutral-950 border border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="font-bebas text-2xl text-white tracking-wider">
                  Circuito Oficial 5K <span className="text-lime-400">Tarapoto</span>
                </span>
                <span className="text-[10px] bg-lime-400 text-black px-2 py-0.5 rounded font-black uppercase">
                  Alta Resolución
                </span>
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Scrollable / Zoomable SVG */}
            <div className="flex-1 overflow-auto rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 p-4 flex items-center justify-center min-h-[350px]">
              <div className="w-full max-w-5xl">
                <svg
                  className="w-full h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                  viewBox="0 0 900 620"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="modalRouteNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur1" />
                      <feGaussianBlur stdDeviation="14" result="blur2" />
                      <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grid Lines */}
                  <g stroke="#333333" strokeWidth="2" strokeDasharray="3 3" opacity="0.7">
                    <path d="M 120 520 L 320 280" />
                    <path d="M 200 560 L 400 320" />
                    <path d="M 280 600 L 480 360" />
                    <path d="M 360 620 L 560 380" />
                    <path d="M 440 620 L 640 400" />
                    <path d="M 520 620 L 720 420" />
                    <path d="M 200 320 L 480 560" />
                    <path d="M 280 260 L 560 500" />
                    <path d="M 360 200 L 640 440" />
                    <path d="M 440 140 L 720 380" />
                    <path d="M 520 80 L 800 320" />
                  </g>

                  {/* River */}
                  <path d="M 880 180 Q 860 280 875 360 Q 885 450 860 540" stroke="#0284c7" strokeWidth="16" strokeLinecap="round" opacity="0.6" />

                  {/* Route Underlay */}
                  <path d="M 670 470 L 760 540 L 820 490 L 740 420 L 790 320 L 480 140 L 260 50 L 150 70 L 180 280 L 190 360 L 160 385" stroke="#0a0a0a" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Route Neon */}
                  <path d="M 670 470 L 760 540 L 820 490 L 740 420 L 790 320 L 480 140 L 260 50 L 150 70 L 180 280 L 190 360 L 160 385" stroke="#ccff00" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" filter="url(#modalRouteNeonGlow)" />

                  {/* Arrows */}
                  <g fill="#000">
                    <polygon points="720,505 710,500 715,512" />
                    <polygon points="785,510 790,522 798,512" />
                    <polygon points="630,225 642,230 635,240" />
                    <polygon points="360,95 372,102 368,112" />
                    <polygon points="175,220 178,206 186,218" />
                  </g>

                  {/* Labels */}
                  <g transform="translate(685, 520) rotate(35)"><rect x="-8" y="-12" width="95" height="22" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" /><text x="5" y="3" fill="#ffffff" fontSize="12" fontWeight="bold">Jr. Maynas</text></g>
                  <g transform="translate(775, 480) rotate(-40)"><rect x="-8" y="-12" width="115" height="22" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" /><text x="3" y="3" fill="#ffffff" fontSize="12" fontWeight="bold">Jr. Moyobamba</text></g>
                  <g transform="translate(735, 400) rotate(-40)"><rect x="-8" y="-12" width="145" height="22" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" /><text x="2" y="3" fill="#ffffff" fontSize="11" fontWeight="bold">Jr. Alegría A. Morey</text></g>
                  <g transform="translate(795, 345)"><rect x="-10" y="-14" width="85" height="26" rx="8" fill="#1c0f38" stroke="#f97316" strokeWidth="2" /><text x="4" y="3" fill="#f97316" fontSize="12" fontWeight="900">La Collpa</text><circle cx="100" cy="0" r="14" fill="#ea580c" /><text x="96" y="5" fill="#fff" fontSize="12">🍽️</text></g>
                  <g transform="translate(620, 240) rotate(-30)"><rect x="-10" y="-14" width="145" height="24" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" /><text x="4" y="3" fill="#ffffff" fontSize="12" fontWeight="bold">Av. Circunvalación</text></g>
                  <g transform="translate(380, 105) rotate(-22)"><rect x="-10" y="-14" width="145" height="24" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" /><text x="4" y="3" fill="#ffffff" fontSize="12" fontWeight="bold">Av. Circunvalación</text></g>
                  <g transform="translate(130, 200) rotate(80)"><rect x="-10" y="-14" width="145" height="24" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" /><text x="4" y="3" fill="#ffffff" fontSize="12" fontWeight="bold">Av. Circunvalación</text></g>
                  <g transform="translate(145, 350) rotate(-35)"><rect x="-8" y="-12" width="85" height="22" rx="6" fill="#1c0f38" stroke="#a855f7" strokeWidth="2" /><text x="5" y="3" fill="#ffffff" fontSize="11" fontWeight="bold">Jr. Paraíso</text></g>

                  {/* INICIO */}
                  <g transform="translate(670, 470)">
                    <circle cx="0" cy="0" r="28" fill="#15803d" opacity="0.4" />
                    <circle cx="0" cy="0" r="16" fill="#22c55e" stroke="#ffffff" strokeWidth="4" />
                    <circle cx="0" cy="0" r="8" fill="#14532d" />
                    <g transform="translate(-160, -60)">
                      <rect x="0" y="0" width="150" height="52" rx="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
                      <text x="10" y="18" fill="#713f12" fontSize="11" fontWeight="900">INICIO</text>
                      <text x="10" y="32" fill="#000000" fontSize="11" fontWeight="bold">Plaza de Armas</text>
                      <text x="10" y="44" fill="#451a03" fontSize="8" fontWeight="bold">Concentración 5:30 PM (Partida 7 PM)</text>
                    </g>
                  </g>

                  {/* LLEGADA */}
                  <g transform="translate(160, 385)">
                    <circle cx="0" cy="0" r="28" fill="#ea580c" opacity="0.4" />
                    <circle cx="0" cy="0" r="16" fill="#f97316" stroke="#ffffff" strokeWidth="4" />
                    <circle cx="0" cy="0" r="8" fill="#7c2d12" />
                    <g transform="translate(30, -55)">
                      <rect x="0" y="0" width="170" height="54" rx="10" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
                      <text x="12" y="18" fill="#ffffff" fontSize="11" fontWeight="900">🏁 LLEGADA</text>
                      <text x="12" y="33" fill="#ffffff" fontSize="14" fontWeight="bold">Entre Jarras</text>
                      <text x="12" y="47" fill="#ffedd5" fontSize="10" fontWeight="bold">(Jr. Lima cda. 13)</text>
                    </g>
                  </g>

                  {/* North */}
                  <g transform="translate(850, 40)">
                    <circle cx="0" cy="0" r="22" fill="#000" stroke="#404040" strokeWidth="2" />
                    <path d="M 0 -14 L 6 8 L 0 4 L -6 8 Z" fill="#ffffff" />
                    <text x="-4" y="-18" fill="#ffffff" fontSize="11" fontWeight="bold">N</text>
                  </g>
                </svg>
              </div>
            </div>

            <div className="pt-3 text-center text-xs text-neutral-400">
              Circuito 100% asfaltado e iluminado • Tarapoto • San Martín
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
