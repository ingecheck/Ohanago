import React, { useState } from 'react';
import { Sparkles, Bell, Clock, MapPin, Trophy, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';

interface UpcomingRaceTeaserProps {
  onNotifyWhatsApp?: () => void;
}

export const UpcomingRaceTeaser: React.FC<UpcomingRaceTeaserProps> = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      // open WhatsApp with prefilled message
      const text = encodeURIComponent(`¡Hola Ohana Go! Quiero ser de los primeros en recibir la primicia y preventa de la próxima carrera oficial. Mi contacto es: ${emailOrPhone.trim()}`);
      window.open(`https://wa.me/51902227356?text=${text}`, '_blank');
    }, 600);
  };

  return (
    <section id="ediciones" className="py-12 sm:py-16 px-4 max-w-6xl mx-auto w-full scroll-mt-20">
      <div className="relative rounded-3xl p-6 sm:p-10 md:p-12 bg-gradient-to-b from-neutral-900 via-black to-neutral-950 border border-neutral-800 shadow-2xl shadow-black/80 overflow-hidden">
        {/* Glow ambient background (Subtle) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/[0.03] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-lime-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          {/* Tag & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-lime-400" />
              <span>Próxima Gran Carrera • Edición en Preparación</span>
            </div>

            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-mono">
              Temporada 2026 - 2027
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-3xl space-y-3 mb-8">
            <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wide uppercase leading-tight">
              LO QUE VIENE SERÁ <span className="text-lime-400 underline decoration-lime-400/40 underline-offset-4">INCREÍBLE</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
              Aún no revelamos la fecha exacta ni el circuito final, pero prepárate: la siguiente edición oficial de <strong>OHANA GO</strong> subirá el listón con una experiencia nocturna/sunset que no olvidarás.
            </p>
          </div>

          {/* Mystery Teaser Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 relative overflow-hidden group hover:border-lime-400/40 transition">
              <div className="flex items-center gap-2 text-lime-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Circuitos</span>
              </div>
              <span className="font-bebas text-2xl text-white block">Urbano & Trail Running</span>
              <p className="text-[11px] text-neutral-400 mt-1">Rutas mixtas por asfalto, naturaleza y senderos con pura competencia sana.</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 relative overflow-hidden group hover:border-lime-400/40 transition">
              <div className="flex items-center gap-2 text-lime-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Modalidades</span>
              </div>
              <span className="font-bebas text-2xl text-white block">5K · 10K & Trail</span>
              <p className="text-[11px] text-neutral-400 mt-1">Desafíos diseñados para todos los niveles de atletas y clubes.</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 relative overflow-hidden group hover:border-lime-400/40 transition">
              <div className="flex items-center gap-2 text-lime-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Kit Exclusivo</span>
              </div>
              <span className="font-bebas text-2xl text-white block">Medalla de Colección</span>
              <p className="text-[11px] text-neutral-400 mt-1">Polo dry-fit premium, chip de cronometraje e hidratación.</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 relative overflow-hidden group hover:border-lime-400/40 transition">
              <div className="flex items-center gap-2 text-lime-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Apertura</span>
              </div>
              <span className="font-bebas text-2xl text-lime-400 block">Preventa en Breve</span>
              <p className="text-[11px] text-neutral-400 mt-1">Cupos limitados con precio especial de prelanzamiento.</p>
            </div>
          </div>

          {/* Action Box: WhatsApp Alert & Priority List */}
          <div className="p-5 sm:p-7 rounded-2xl bg-neutral-950 border border-lime-400/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-lime-400 text-xs font-mono font-bold uppercase">
                <Bell className="w-4 h-4" />
                <span>Lista de Espera VIP</span>
              </div>
              <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide">
                Sé el primero en enterarte antes del lanzamiento oficial
              </h3>
              <p className="text-xs text-neutral-400 max-w-lg">
                Los miembros de la lista de espera reciben acceso a la preventa 24 horas antes que el público general.
              </p>
            </div>

            <div className="w-full md:w-auto shrink-0">
              {subscribed ? (
                <div className="px-5 py-3 rounded-xl bg-lime-950 border border-lime-400/60 text-lime-300 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-lime-400" />
                  <span>¡Redirigiendo a WhatsApp Oficial de Ohana Go!</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Tu WhatsApp o Correo"
                    className="w-full sm:w-64 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-lime-400 transition"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-lg uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 font-black shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Avisarme por WhatsApp</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
