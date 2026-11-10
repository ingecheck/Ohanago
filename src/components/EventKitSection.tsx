import React, { useState } from 'react';
import { Award, Droplets, Sparkles, Gift, Shirt, Backpack, CircleDot, ZoomIn, X } from 'lucide-react';
import { FinisherMedalCard } from './FinisherMedalCard';

interface EventKitSectionProps {
  onGoToRegister?: () => void;
}

export const EventKitSection: React.FC<EventKitSectionProps> = ({ onGoToRegister }) => {
  const [showPosterModal, setShowPosterModal] = useState(false);

  const kitItems = [
    {
      icon: Award,
      title: 'Medalla Finisher Oficial 6K',
      badge: 'Al Cruzar la Meta',
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/40',
      iconColor: 'text-amber-400',
      description: 'Medalla conmemorativa con diseño navideño y relieve tropical de Tarapoto 2026. Entregada inmediatamente a todos los finishers.',
      feature: 'Solo para los que crucen la meta en la Concha Acústica',
    },
    {
      icon: Droplets,
      title: 'Hidratación Oficial',
      badge: 'En Ruta & Meta',
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/40',
      iconColor: 'text-cyan-400',
      description: 'Puntos oficiales de hidratación con agua mineral en el recorrido nocturno y rehidratación completa en la meta.',
      feature: 'Agua fría y asistencia para todos los atletas',
    },
    {
      icon: Shirt,
      title: 'Polo Oficial Dry-Fit',
      badge: 'Diseño Exclusivo',
      color: 'from-red-500/20 to-rose-500/20',
      borderColor: 'border-red-500/40',
      iconColor: 'text-red-400',
      description: 'Polo técnico transpirable de alta calidad en color blanco con palmeras tropicales y branding oficial Santa Run Tarapoto 2026.',
      feature: 'Tallas S, M, L, XL a tu elección',
    },
    {
      icon: Sparkles,
      title: 'Gorra Navideña Santa',
      badge: 'Espíritu Festivo',
      color: 'from-rose-500/20 to-red-500/20',
      borderColor: 'border-rose-500/40',
      iconColor: 'text-rose-400',
      description: 'Gorro navideño de Santa Claus para iluminar las calles de Tarapoto en la marea roja nocturna más grande de la región.',
      feature: 'Uso durante el circuito y fotos oficiales',
    },
    {
      icon: Backpack,
      title: 'Mochila Deportiva Oficial',
      badge: 'Kit Conmemorativo',
      color: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'border-blue-500/40',
      iconColor: 'text-blue-400',
      description: 'Mochila conmemorativa compacta y resistente de Ohana Go para transportar tus accesorios deportivos y kit personal.',
      feature: 'Ideal para guardar pertenencias en carrera',
    },
    {
      icon: CircleDot,
      title: 'Pulsera Oficial del Evento',
      badge: 'Acceso Oficial',
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/40',
      iconColor: 'text-emerald-400',
      description: 'Pulsera oficial de participante para control en Aviación, paso en ruta, acceso al sorteo y entrega de medalla.',
      feature: 'Identificación oficial del corredor',
    },
  ];

  return (
    <section id="kit-evento" className="pt-10 pb-12 px-4 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Equipamiento Oficial Completo</span>
        </div>
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider uppercase">
          Tu Kit <span className="text-red-500">Incluye</span>
        </h2>
        <p className="text-neutral-300 text-sm md:text-base mt-2 max-w-2xl mx-auto font-sans">
          Todo lo necesario para vivir la experiencia de la <strong>Santa Run Tarapoto 2026 6K</strong> el Sábado 19 de Diciembre.
        </p>
      </div>

      {/* Official Poster & Big Turkey Raffle Banner */}
      <div className="max-w-5xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Poster preview clickable */}
        <div className="md:col-span-5 flex justify-center">
          <div
            onClick={() => setShowPosterModal(true)}
            className="relative group rounded-3xl overflow-hidden border-2 border-red-500/50 shadow-2xl bg-black cursor-pointer hover:border-red-400 transition-all hover:scale-[1.01]"
            title="Clic para ampliar el afiche oficial de beneficios y kit"
          >
            <img
              src="/assets/aistudio/OHANA_GO_PRINCIPAL_3d791120.jpeg"
              alt="Afiche Oficial Kit Santa Run 2026"
              className="w-full h-auto max-h-[380px] object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <span className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
                <ZoomIn className="w-4 h-4" /> Ampliar Afiche Oficial
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold">TU KIT INCLUYE (6 Elementos)</span>
              <span className="text-white text-[10px] bg-red-600 px-2 py-0.5 rounded-full font-bold">OFICIAL</span>
            </div>
          </div>
        </div>

        {/* Right: Turkey Raffle & Price Callout */}
        <div className="md:col-span-7 space-y-4">
          {/* Turkey Raffle Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/60 via-neutral-900 to-black border-2 border-amber-500/50 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-3xl shrink-0">
                🦃
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                  Gran Premio Especial en Concha Acústica
                </span>
                <h3 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide mt-0.5">
                  Sorteo de un Pavo Navideño
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  Todos los inscritos reciben automáticamente un ticket oficial numerado con su registro para participar en el sorteo en vivo durante el cierre en el escenario de la Concha Acústica.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Nov Discount */}
          <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-neutral-400 block font-bold uppercase">
                Inversión General
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-bebas text-4xl text-white font-black">
                  S/ 70.00
                </span>
                <span className="text-xs text-neutral-400 font-mono">tarifa regular</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-red-950/70 border border-red-500/40 text-left sm:text-right">
              <span className="text-xs font-bold text-red-300 block">
                15% de Descuento (S/ 59.50)
              </span>
              <span className="text-[11px] text-neutral-300 block mt-0.5">
                Para atletas de ediciones anteriores de OHANA GO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Kit Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto mb-10">
        {kitItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl bg-neutral-950/80 border ${item.borderColor} p-5 backdrop-blur-md transition-all duration-300 hover:bg-neutral-900 hover:scale-[1.01] hover:shadow-xl flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} border ${item.borderColor}`}>
                    <IconComponent className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bebas text-xl text-white tracking-wide uppercase">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/70 px-2 py-0.5 rounded border border-red-500/30">
                      {item.badge}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 mt-2 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="text-neutral-300 font-medium">
                  ✓ {item.feature}
                </span>
                <span className="text-emerald-400 font-bold uppercase text-[10px]">
                  Incluido
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finisher Medal Card */}
      <div className="max-w-md mx-auto">
        <FinisherMedalCard />
      </div>

      {/* Poster Zoom Modal */}
      {showPosterModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-red-500 rounded-3xl p-4 shadow-2xl space-y-3">
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center pt-2">
              <h4 className="font-bebas text-2xl text-white uppercase tracking-wide">
                Afiche Oficial · Beneficios & Kit Santa Run 2026
              </h4>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black max-h-[75vh] flex items-center justify-center">
              <img
                src="/assets/aistudio/OHANA_GO_PRINCIPAL_3d791120.jpeg"
                alt="Afiche Oficial Santa Run 2026"
                className="max-h-[72vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="text-center pt-1">
              <button
                onClick={() => setShowPosterModal(false)}
                className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
