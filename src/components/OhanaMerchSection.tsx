import React, { useState } from 'react';
import { Shirt, MessageCircle, Maximize2, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const OhanaMerchSection: React.FC = () => {
  const [modalImage, setModalImage] = useState<string | null>(null);

  const items = [
    {
      name: 'Polo Técnico Oficial Ohana Pro',
      category: 'Indumentaria Oficial Unisex',
      description: 'Tejido dry-fit microperforado ultra transpirable para clima cálido. Diseño oficial en negro carbón con gráfica tropical de palmeras, trazos dinámicos en verde neón y lema oficial "Muévete. Conecta. Vive."',
      tag: 'Diseño Oficial',
      sizes: 'S · M · L · XL · XXL',
      image: '/assets/aistudio/image_3ab86647.png',
      isGreenCap: false,
    },
    {
      name: 'Gorra Running Verde Ohana',
      category: 'Accesorios de Ruta',
      description: 'Gorra técnica de alto rendimiento en color verde neón oficial con visera curva anti-reflejo, paneles de ventilación lateral micro-mesh, banda absorbente anti-sudor y ajuste ergonómico reflectivo.',
      tag: 'Edición Ruta',
      sizes: 'Talla Única Ajustable',
      image: null,
      isGreenCap: true,
    },
    {
      name: 'Calcetines Técnicos Ohana Pro',
      category: 'Protección & Rendimiento',
      description: 'Compresión media en el arco plantar, puntera con costuras planas anti-ampollas y soporte reforzado de talón para asfalto y trail running.',
      tag: 'Rendimiento Pro',
      sizes: '38-40 · 41-43',
      image: null,
      isGreenCap: false,
    },
  ];

  return (
    <section id="merch-oficial" className="py-12 sm:py-16 px-4 max-w-6xl mx-auto w-full scroll-mt-20 border-t border-neutral-900 bg-black">
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
            Prendas diseñadas exclusivamente para soportar las rutas de calor, sudor y velocidad con el estilo icónico de OHANA GO.
          </p>
        </div>

        <a
          href="https://wa.me/51902227356?text=%C2%A1Hola%20Ohana%20Go!%20Quiero%20consultar%20el%20polo%20t%C3%A9cnico%20oficial%20y%20la%20gorra%20verde."
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bebas text-lg uppercase tracking-wider transition font-black flex items-center gap-2 self-start cursor-pointer shadow-lg shadow-red-600/30 border border-red-400/30"
        >
          <MessageCircle className="w-4 h-4 text-white" />
          <span>Pedir Catálogo por WhatsApp</span>
        </a>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-neutral-950 border border-neutral-800 p-5 sm:p-6 flex flex-col justify-between hover:border-red-500/50 transition group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase text-neutral-400">
                  {item.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold">
                  {item.tag}
                </span>
              </div>

              {/* Garment / Product Visualizer */}
              {item.image ? (
                <div
                  className="relative h-64 rounded-2xl overflow-hidden mb-4 border border-neutral-800 group/img bg-black cursor-pointer"
                  onClick={() => setModalImage(item.image)}
                >
                  {/* Preserves the young runners without top chopped letters */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-[center_88%] scale-[1.2] origin-bottom group-hover/img:scale-[1.25] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover/img:opacity-50 transition" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white">
                    <span className="bg-black/80 px-2 py-0.5 rounded backdrop-blur-sm border border-neutral-800">Diseño Oficial</span>
                    <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <Maximize2 className="w-3 h-3" /> Ver completo
                    </span>
                  </div>
                </div>
              ) : item.isGreenCap ? (
                /* Green Running Cap Visualizer */
                <div className="relative h-64 rounded-2xl overflow-hidden mb-4 border border-neutral-800 bg-gradient-to-b from-neutral-900 via-black to-neutral-950 flex flex-col items-center justify-center p-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
                    <BrandLogo size="sm" variant="crimson" />
                  </div>
                  <span className="text-sm font-bebas text-white uppercase tracking-wider">
                    Gorra Running Verde
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 mt-1">
                    Verde Deportivo con Visera Curva
                  </span>
                </div>
              ) : (
                /* Performance Socks Visualizer */
                <div className="relative h-64 rounded-2xl overflow-hidden mb-4 border border-neutral-800 bg-gradient-to-b from-neutral-900 via-black to-neutral-950 flex flex-col items-center justify-center p-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
                    <BrandLogo size="sm" variant="crimson" />
                  </div>
                  <span className="text-sm font-bebas text-white uppercase tracking-wider">
                    Soporte & Compresión
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 mt-1">
                    Negro Carbón con Vivos Deportivos
                  </span>
                </div>
              )}

              <h3 className="font-bebas text-2xl text-white uppercase tracking-wide group-hover:text-red-400 transition">
                {item.name}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mt-2">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-900 mt-5 flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">{item.sizes}</span>
              <a
                href={`https://wa.me/51902227356?text=${encodeURIComponent(`¡Hola Ohana Go! Deseo consultar disponibilidad y adquirir: ${item.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-red-600 text-neutral-200 hover:text-white font-mono text-[11px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer border border-neutral-800 hover:border-red-500"
              >
                <span>Consultar</span>
                <span>→</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal to preview shirt image in large resolution */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-neutral-950 border border-red-500/30 rounded-3xl overflow-hidden p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-neutral-800">
              <div>
                <h4 className="font-bebas text-2xl text-white uppercase tracking-wide">
                  Polo Técnico Oficial Ohana Pro
                </h4>
                <p className="text-xs font-mono text-neutral-400">
                  Edición Oficial · Muévete. Conecta. Vive.
                </p>
              </div>
              <button
                onClick={() => setModalImage(null)}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-hidden rounded-2xl bg-black">
              <div className="w-full max-h-[70vh] overflow-hidden rounded-xl flex items-center justify-center">
                <img
                  src={modalImage}
                  alt="Polo Técnico Oficial Ohana Pro"
                  className="w-full max-h-[70vh] object-cover object-[center_88%] scale-[1.18] origin-bottom rounded-xl"
                />
              </div>
            </div>

            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800">
              <span className="text-xs font-mono text-neutral-400">
                Tallas disponibles: S · M · L · XL · XXL
              </span>
              <a
                href={`https://wa.me/51902227356?text=${encodeURIComponent('¡Hola Ohana Go! Quiero coordinar mi talla y compra del Polo Técnico Oficial (Diseño con palmeras).')}`}
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
