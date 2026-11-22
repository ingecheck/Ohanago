import React, { useState } from 'react';
import { Shirt, MessageCircle, Maximize2, X } from 'lucide-react';

interface MerchItem {
  name: string;
  category: string;
  description: string;
  tag: string;
  sizes: string;
  image: string;
  imageStyle: 'contain' | 'halloween-crop';
  isPrimary?: boolean;
}

export const OhanaMerchSection: React.FC = () => {
  const [modalItem, setModalItem] = useState<MerchItem | null>(null);

  const featuredPolos: MerchItem[] = [
    {
      name: 'Polo Oficial Santa Run 2026',
      category: 'Nueva Indumentaria Principal · Unisex',
      description:
        'Nueva indumentaria oficial de temporada en tejido dry-fit microperforado blanco de alta transpirabilidad. Emblema SANTA RUN · OHANA GO en el pecho, siluetas de palmeras amazónicas y trazos dinámicos en rojo navideño.',
      tag: 'Principal · 2026',
      sizes: 'S · M · L · XL · XXL',
      image: '/assets/aistudio/polo_santa_run_oficial.jpeg',
      imageStyle: 'contain',
      isPrimary: true,
    },
    {
      name: 'Polo Técnico Oficial Halloween 5K',
      category: 'Indumentaria Edición Halloween · Unisex',
      description:
        'Tejido dry-fit microperforado ultra transpirable para clima cálido. Diseño oficial en negro carbón con gráfica tropical de palmeras, trazos dinámicos en verde neón y lema oficial "Muévete. Conecta. Vive."',
      tag: 'Edición Halloween',
      sizes: 'S · M · L · XL · XXL',
      image: '/assets/aistudio/image_3ab86647.png',
      imageStyle: 'halloween-crop',
      isPrimary: false,
    },
  ];

  return (
    <section id="merch-oficial" className="py-14 sm:py-20 px-4 bg-black border-t border-neutral-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Shirt className="w-3.5 h-3.5 text-red-400" />
              <span>Indumentaria & Merch Oficial</span>
            </div>
            <h2 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-wide">
              EQUÍPATE CON LOS COLORES DE <span className="text-red-500">LA MANADA</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Descubre nuestra indumentaria técnica oficial: la nueva colección Santa Run 2026 y el polo clásico edición Halloween 5K.
            </p>
          </div>

          <a
            href="https://wa.me/51902227356?text=%C2%A1Hola%20Ohana%20Go!%20Quiero%20consultar%20la%20nueva%20indumentaria%20oficial%20Santa%20Run%20y%20el%20merch%20disponible."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bebas text-lg uppercase tracking-wider transition font-black flex items-center gap-2 self-start cursor-pointer shadow-lg shadow-red-600/30 border border-red-400/30"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Pedir Catálogo por WhatsApp</span>
          </a>
        </div>

        {/* Two Featured Official Polos (1st: Santa Run Principal, 2nd: Halloween) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredPolos.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-3xl bg-neutral-950 p-5 sm:p-6 flex flex-col justify-between transition group ${
                item.isPrimary
                  ? 'border-2 border-red-500/70 shadow-[0_18px_55px_rgba(220,38,38,0.18)]'
                  : 'border border-neutral-800 hover:border-red-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">
                    {item.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      item.isPrimary
                        ? 'bg-red-600 text-white border-red-400'
                        : 'bg-neutral-900 text-lime-300 border-lime-500/30'
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>

                <div
                  className="relative h-80 sm:h-96 rounded-2xl overflow-hidden mb-5 border border-neutral-800 group/img bg-black cursor-pointer"
                  onClick={() => setModalItem(item)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className={
                      item.imageStyle === 'halloween-crop'
                        ? 'w-full h-full object-cover object-[center_88%] scale-[1.18] origin-bottom group-hover/img:scale-[1.23] transition-transform duration-500'
                        : 'w-full h-full object-contain bg-black group-hover/img:scale-[1.03] transition-transform duration-500'
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-60 group-hover/img:opacity-40 transition" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white">
                    <span className="bg-black/85 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-neutral-800">
                      {item.isPrimary ? 'Nueva Colección Santa Run' : 'Edición Halloween 5K'}
                    </span>
                    <span className="bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <Maximize2 className="w-3 h-3" /> Ver completo
                    </span>
                  </div>
                </div>

                <h3 className="font-bebas text-3xl text-white uppercase tracking-wide group-hover:text-red-400 transition">
                  {item.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-2">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-900 mt-5 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono text-[11px]">{item.sizes}</span>
                <a
                  href={`https://wa.me/51902227356?text=${encodeURIComponent(`¡Hola Ohana Go! Deseo consultar disponibilidad y tallas para: ${item.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-red-600 text-neutral-200 hover:text-white font-mono text-[11px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer border border-neutral-800 hover:border-red-500"
                >
                  <span>Consultar</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal to preview selected shirt image in large resolution */}
      {modalItem && modalItem.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setModalItem(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-neutral-950 border border-red-500/30 rounded-3xl overflow-hidden p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-neutral-800">
              <div>
                <h4 className="font-bebas text-2xl text-white uppercase tracking-wide">
                  {modalItem.name}
                </h4>
                <p className="text-xs font-mono text-neutral-400">
                  {modalItem.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-hidden rounded-2xl bg-black">
              <div className="w-full max-h-[70vh] overflow-hidden rounded-xl flex items-center justify-center bg-black">
                <img
                  src={modalItem.image}
                  alt={modalItem.name}
                  className={
                    modalItem.imageStyle === 'halloween-crop'
                      ? 'w-full max-h-[70vh] object-cover object-[center_88%] scale-[1.18] origin-bottom rounded-xl'
                      : 'w-full max-h-[70vh] object-contain rounded-xl'
                  }
                />
              </div>
            </div>

            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800">
              <span className="text-xs font-mono text-neutral-400">
                Tallas disponibles: {modalItem.sizes}
              </span>
              <a
                href={`https://wa.me/51902227356?text=${encodeURIComponent(`¡Hola Ohana Go! Quiero coordinar mi talla y compra de: ${modalItem.name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bebas text-lg uppercase tracking-wider font-black transition cursor-pointer shadow-lg shadow-red-600/30"
              >
                Pedir mi Polo por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
