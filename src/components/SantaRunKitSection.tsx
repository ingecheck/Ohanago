import React from 'react';
import { Gift, Award, Droplets, Shirt, Sparkles, MessageCircle, CheckCircle2, Ticket, Percent } from 'lucide-react';

interface SantaRunKitSectionProps {
  onRegisterClick: () => void;
}

export const SantaRunKitSection: React.FC<SantaRunKitSectionProps> = ({ onRegisterClick }) => {
  const kitItems = [
    {
      icon: '🏅',
      title: 'Medalla Finisher Oficial',
      description: 'Medalla conmemorativa oficial en alto relieve de colección Santa Run Tarapoto 2026.',
      tag: 'Garantizada en Meta',
    },
    {
      icon: '💧',
      title: 'Hidratación en Ruta & Meta',
      description: 'Puntos de hidratación con agua e isotónica durante el recorrido y llegada en la Concha Acústica.',
      tag: 'Abastecimiento',
    },
    {
      icon: '👕',
      title: 'Polo Oficial Dry-Fit',
      description: 'Polo técnico microperforado blanco con arte navideño de palmeras, trazos rojos y corte ergonómico.',
      tag: 'Tallas S a XXL',
    },
    {
      icon: '🎅',
      title: 'Gorra Navideña',
      description: 'Gorro festivo de Santa para correr y llenar las calles de Tarapoto de magia navideña.',
      tag: 'Edición Festiva',
    },
    {
      icon: '🎒',
      title: 'Mochila Deportiva',
      description: 'Mochila morral deportiva ultra liviana para guardar tus implementos y kit de competencia.',
      tag: 'Exclusiva Ohana',
    },
  ];

  return (
    <section id="kit-navideno" className="py-14 sm:py-20 px-4 max-w-6xl mx-auto w-full scroll-mt-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Gift className="w-3.5 h-3.5 text-red-400" />
          <span>Equipamiento Oficial de Competencia</span>
        </div>
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight leading-none">
          TU KIT INCLUYE & <span className="text-red-500 text-glow-red">SORTEO DEL PAVO</span>
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 mt-3 leading-relaxed">
          Todo lo necesario para vivir una noche inolvidable en la <strong>Santa Run Tarapoto 2026</strong>. Cada inscripción incluye el kit completo y tu ticket para el gran sorteo navideño.
        </p>
      </div>

      {/* Main Grid: Kit Flyer + 5 Items List + Pricing Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
        
        {/* Left Column: Official Kit Flyer from User Upload */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative group max-w-sm sm:max-w-md w-full rounded-3xl overflow-hidden border-2 border-red-600/40 shadow-[0_0_50px_rgba(220,38,38,0.2)] bg-black">
            <img
              src="/assets/aistudio/SANT_RUN_db4462d2.jpeg"
              alt="Kit Oficial Santa Run Tarapoto 2026 - Incluye Sorteo de un Pavo"
              className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-red-600 text-white font-bebas text-lg uppercase tracking-wider shadow-lg">
              19 DIC · 7:00 PM
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Elements & Grand Turkey Raffle */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 5 Elements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {kitItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 hover:border-red-500/40 transition flex items-start gap-3.5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bebas text-xl text-white uppercase tracking-wide leading-tight">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">
                    {item.description}
                  </p>
                  <span className="inline-block text-[10px] font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/60">
                    {item.tag}
                  </span>
                </div>
              </div>
            ))}

            {/* Special Highlight: Turkey Raffle Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950 via-neutral-950 to-neutral-900 border-2 border-red-500/60 shadow-lg shadow-red-600/15 flex items-start gap-3.5 sm:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md shadow-red-600/30">
                🎁
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bebas text-2xl text-white uppercase tracking-wide leading-tight flex items-center gap-2">
                    <span>SORTEO DE UN PAVO NAVIDEÑO</span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-500/40">
                      En Vivo en Meta
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Con tu inscripción recibes un ticket oficial para participar en el sorteo de un pavo navideño listo para celebrar con tu familia, realizado al llegar a la Concha Acústica.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & 15% Discount Card */}
          <div className="p-6 rounded-3xl bg-neutral-900/90 border-2 border-red-600/50 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                  Tarifa Oficial de Inscripción
                </span>
                <div className="flex items-baseline justify-center sm:justify-start gap-3">
                  <span className="font-bebas text-5xl sm:text-6xl text-white font-black leading-none">
                    S/ 70.00
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    Kit Completo + Pase Oficial
                  </span>
                </div>

                {/* 15% discount badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-red-950 border border-red-500/40 text-xs font-mono text-red-300">
                  <Percent className="w-3.5 h-3.5 text-red-400" />
                  <span>
                    <strong>15% OFF (S/ 59.50)</strong> para inscritos de ediciones anteriores
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onRegisterClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bebas text-2xl uppercase tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl shadow-red-600/30 font-black cursor-pointer shrink-0"
              >
                Inscribirme Ahora
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
