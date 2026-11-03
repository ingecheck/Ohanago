import React from 'react';
import { Shirt, Sparkles, ShoppingBag, MessageCircle, Check } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const OhanaMerchSection: React.FC = () => {
  const items = [
    {
      name: 'Polo Técnico Oficial Ohana Pro',
      category: 'Indumentaria de Competencia',
      description: 'Tejido dry-fit ultra ligero, microperforado para el calor de la selva, acabado negro carbón con logo Ohana Go en verde neón y reflectivo de seguridad posterior.',
      tag: 'Más Vendido',
      sizes: 'S · M · L · XL',
    },
    {
      name: 'Visera Running Ohana Stealth',
      category: 'Accesorios de Ruta',
      description: 'Estructura flexible de secado rápido con banda interior absorbente anti-sudor y ajuste elástico con detalles neón.',
      tag: 'Edición Club',
      sizes: 'Talla Única Ajustable',
    },
    {
      name: 'Calcetines Técnicos 5K / 10K',
      category: 'Protección & Rendimiento',
      description: 'Compresión media en el arco plantar, puntera anti-ampollas y soporte de tobillo para carreras urbanas y senderos.',
      tag: 'Nuevo',
      sizes: '38-40 · 41-43',
    },
  ];

  return (
    <section id="merch-oficial" className="py-12 sm:py-16 px-4 max-w-6xl mx-auto w-full scroll-mt-20 border-t border-neutral-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-950/60 border border-lime-400/40 text-lime-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Shirt className="w-3.5 h-3.5" />
            <span>Indumentaria & Merch Oficial</span>
          </div>
          <h2 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-wide">
            EQUÍPATE CON LOS COLORES DE <span className="text-lime-400">LA MANADA</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Prendas diseñadas exclusivamente para soportar las rutas de calor, sudor y velocidad con el estilo icónico negro y neón de OHANA GO.
          </p>
        </div>

        <a
          href="https://wa.me/51957342934?text=%C2%A1Hola%20Ohana%20Go!%20Quiero%20consultar%20el%20cat%C3%A1logo%20de%20polos%20y%20merch%20oficial."
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-lg uppercase tracking-wider transition font-black flex items-center gap-2 self-start cursor-pointer shadow-md shadow-lime-400/20"
        >
          <MessageCircle className="w-4 h-4 text-black" />
          <span>Pedir Catálogo por WhatsApp</span>
        </a>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 flex flex-col justify-between hover:border-lime-400/40 transition group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase text-neutral-400">
                  {item.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-lime-950 text-lime-400 border border-lime-500/40 text-[10px] font-mono font-bold">
                  {item.tag}
                </span>
              </div>

              {/* Athletic garment visualizer */}
              <div className="h-44 rounded-2xl bg-black border border-neutral-800/80 mb-4 flex flex-col items-center justify-center p-4 relative overflow-hidden group-hover:border-lime-400/30 transition">
                <div className="absolute inset-0 bg-lime-400/5 group-hover:bg-lime-400/10 transition" />
                <BrandLogo size="md" className="group-hover:scale-105 transition-transform duration-300" />
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-3">
                  OHANA GO RUN CLUB
                </span>
              </div>

              <h3 className="font-bebas text-2xl text-white uppercase tracking-wide group-hover:text-lime-400 transition">
                {item.name}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mt-2">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800/80 mt-5 flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Tallas: {item.sizes}</span>
              <a
                href={`https://wa.me/51957342934?text=${encodeURIComponent(`¡Hola! Deseo información sobre: ${item.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime-400 hover:text-lime-300 font-bold flex items-center gap-1"
              >
                <span>Consultar</span>
                <span>→</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
