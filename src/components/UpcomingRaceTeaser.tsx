import React from 'react';
import { Trophy, Droplets, Shirt, Sparkles, Gift, ShoppingBag, CheckCircle2, MessageCircle, ArrowRight, Star } from 'lucide-react';

interface UpcomingRaceTeaserProps {
  onRegisterClick?: () => void;
}

export const UpcomingRaceTeaser: React.FC<UpcomingRaceTeaserProps> = ({
  onRegisterClick,
}) => {
  const kitItems = [
    {
      icon: Trophy,
      name: 'Medalla Finisher Oficial',
      desc: 'Aleación maciza de colección con relieve conmemorativo Santa Run 2026.',
      badge: 'Metálica 3D',
    },
    {
      icon: Droplets,
      name: 'Hidratación Completa',
      desc: 'Puntos de abastecimiento en circuito y meta para rendir al máximo.',
      badge: 'En Ruta & Meta',
    },
    {
      icon: Shirt,
      name: 'Polo Oficial Santa Run',
      desc: 'Tejido dry-fit microperforado blanco con arte de palmeras y trazos rojos.',
      badge: 'Dry-Fit Unisex',
    },
    {
      icon: Sparkles,
      name: 'Gorra Navideña (Gorro Santa)',
      desc: 'El toque festivo icónico para iluminar la marea roja nocturna.',
      badge: 'Edición Navideña',
    },
    {
      icon: ShoppingBag,
      name: 'Mochila Deportiva',
      desc: 'Mochila liviana y resistente para transportar tu kit y pertenencias.',
      badge: 'Oficial Evento',
    },
    {
      icon: Gift,
      name: 'Sorteo de un Pavo Navideño',
      desc: 'Participas automáticamente con tu número de inscripción oficial.',
      badge: 'Premio Especial',
    },
  ];

  return (
    <section id="ediciones" className="py-12 sm:py-20 px-4 max-w-6xl mx-auto w-full scroll-mt-20">
      <div className="relative rounded-3xl p-6 sm:p-10 md:p-12 bg-gradient-to-b from-[#09111C] via-[#0B1422] to-[#070D14] border border-red-500/30 shadow-[0_20px_60px_rgba(212,36,38,0.2)] overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          {/* Tag & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>🎅 TU KIT OFICIAL · SANTA RUN TARAPOTO 2026</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>19 DE DICIEMBRE</span>
              </span>
            </div>
          </div>

          {/* Headline & Pricing Badge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
            <div className="lg:col-span-7 space-y-3">
              <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wide uppercase leading-tight">
                TODO LO QUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">INCLUYE TU KIT</span>
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans max-w-2xl">
                Prepárate para vivir una noche inolvidable. Al inscribirte recibes todo el equipamiento oficial de Santa Run más tu derecho a cronometraje, hidratación y el gran sorteo del pavo navideño.
              </p>
            </div>

            {/* Glowing Price Box matching the official poster */}
            <div className="lg:col-span-5 flex flex-col items-center sm:items-end justify-center">
              <div className="w-full max-w-sm rounded-3xl p-5 bg-gradient-to-b from-red-950/90 to-slate-950 border-2 border-red-500 shadow-[0_0_40px_rgba(255,30,39,0.35)] text-center relative">
                <span className="text-[11px] font-mono uppercase tracking-widest text-red-200 font-bold block mb-1">
                  INVERSIÓN GENERAL
                </span>
                <div className="font-bebas text-5xl sm:text-6xl text-white font-black tracking-tight leading-none my-1 drop-shadow-md">
                  S/ 70.00
                </div>

                {/* 15% discount for previous editions */}
                <div className="mt-3 pt-3 border-t border-red-500/40 rounded-2xl bg-black/60 p-2.5 flex items-center justify-between text-left gap-2">
                  <span className="font-bebas text-2xl text-amber-400 font-black shrink-0 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    15% OFF
                  </span>
                  <p className="text-[11px] text-neutral-300 leading-tight">
                    <strong className="text-white block">Participantes anteriores OHANA GO</strong>
                    <span>(Ej. Halloween 5K con tu DNI)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of 6 Kit Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {kitItems.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-red-500/50 transition-all duration-300 group backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bebas text-xl text-white uppercase tracking-wide group-hover:text-red-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Official Kit & Pricing Image Banner */}
          <div className="rounded-3xl overflow-hidden border border-red-500/30 shadow-2xl relative max-w-3xl mx-auto mb-8 group">
            <img
              src="/assets/aistudio/santa_run_kit_pricing.jpeg"
              alt="Tu Kit Oficial Santa Run Tarapoto 2026 - S/ 70.00"
              className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-700"
            />
          </div>

          {/* Bottom CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bebas text-2xl uppercase tracking-wider transition-all duration-300 shadow-xl shadow-red-600/30 font-black cursor-pointer flex items-center justify-center gap-2.5 border border-red-400/40"
            >
              <span>Completar Formulario de Inscripción</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href={`https://wa.me/51902227356?text=${encodeURIComponent('¡Hola Ohana Go! Quiero información para inscribirme a la Santa Run Tarapoto 2026 (S/ 70.00).')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-neutral-200 hover:text-white font-bebas text-xl uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Consultar por WhatsApp (+51 902 227 356)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
