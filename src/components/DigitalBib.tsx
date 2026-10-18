import React, { useRef } from 'react';
import { RunnerRegistration } from '../types/race';
import { Download, Printer, Share2, CheckCircle2, QrCode } from 'lucide-react';

interface DigitalBibProps {
  registration: RunnerRegistration;
  showActions?: boolean;
}

export const DigitalBib: React.FC<DigitalBibProps> = ({ registration, showActions = true }) => {
  const bibRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Ya estoy listo para la OHANA GO 5K Por Halloween en Tarapoto! 🎃🏃‍♂️\n\n` +
      `Mi número de dorsal oficial es: #${String(registration.bibNumber).padStart(4, '0')}\n` +
      `Corredor: ${registration.firstName} ${registration.lastName}\n` +
      `Distancia: 5K\n` +
      `Fecha: 31 de Octubre 2026 - 7:00 P.M.\n` +
      `Partida: Plaza de Armas Tarapoto\n` +
      `Llegada: Entre Jarras\n\n` +
      `Inscríbete tú también aquí: https://ohanago.pro`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Generate a mock barcode pattern based on document and bib
  const barcodePattern = Array.from({ length: 32 }, (_, i) => {
    const isThick = (registration.bibNumber * 7 + i * 13) % 3 === 0;
    return isThick ? 'w-1.5' : 'w-0.5';
  });

  return (
    <div className="flex flex-col items-center">
      {/* Dorsal Card */}
      <div
        ref={bibRef}
        className="printable-dorsal relative w-full max-w-md bg-white text-neutral-900 rounded-3xl p-5 shadow-2xl border-4 border-neutral-900 overflow-hidden"
      >
        {/* Safety pin perforation circles */}
        <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full bg-neutral-300 border border-neutral-500 shadow-inner" />
        <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-neutral-300 border border-neutral-500 shadow-inner" />
        <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full bg-neutral-300 border border-neutral-500 shadow-inner" />
        <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full bg-neutral-300 border border-neutral-500 shadow-inner" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bebas text-2xl tracking-wider text-black">
                OHANA GO <span className="text-lime-600 font-extrabold">&gt;</span>
              </span>
              <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-sm font-marker">
                HALLOWEEN
              </span>
            </div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-neutral-600">
              TARAPOTO • 2026
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-neutral-900 text-lime-400 font-bebas text-lg px-2.5 py-0.5 rounded-md tracking-wider">
              5K
            </span>
            <div className="text-[9px] font-bold text-neutral-500 uppercase mt-0.5">
              31 OCT • 7:00 PM
            </div>
          </div>
        </div>

        {/* Center: Giant Bib Number */}
        <div className="py-2 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
            <span className="font-bebas text-9xl">OHANA</span>
          </div>
          
          <div className="font-bebas text-8xl md:text-9xl leading-none text-neutral-950 font-black tracking-tight drop-shadow-sm select-none">
            {String(registration.bibNumber).padStart(4, '0')}
          </div>

          {/* Runner Name */}
          <div className="mt-1">
            <div className="font-bebas text-2xl md:text-3xl text-neutral-900 uppercase tracking-wide truncate max-w-full px-2">
              {registration.firstName} {registration.lastName}
            </div>
            {registration.runningClub && (
              <div className="text-xs font-bold text-neutral-600 uppercase tracking-widest mt-0.5">
                {registration.runningClub}
              </div>
            )}
          </div>
        </div>

        {/* Badges Bar: Category, Size, Costume */}
        <div className="grid grid-cols-3 gap-2 my-3 pt-2 border-t-2 border-neutral-200 text-center">
          <div className="bg-neutral-100 rounded-lg p-1.5 border border-neutral-300">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Talla Polo</span>
            <span className="text-sm font-black text-neutral-900 uppercase">{registration.tShirtSize}</span>
          </div>

          <div className="bg-neutral-100 rounded-lg p-1.5 border border-neutral-300">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Categoría</span>
            <span className="text-sm font-black text-neutral-900 uppercase">
              {registration.age < 18 ? 'Juvenil' : registration.age < 40 ? 'Libre 5K' : 'Master 5K'}
            </span>
          </div>

          <div className="bg-neutral-100 rounded-lg p-1.5 border border-neutral-300">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Disfraz</span>
            <span className="text-xs font-black text-orange-600 uppercase truncate block">
              {registration.willWearCostume ? 'Sí (Concurso)' : 'Runner'}
            </span>
          </div>
        </div>

        {/* Bottom Bar: Barcode, QR Code & Validation */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-300">
          {/* Simulated Barcode */}
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5 h-6">
              {barcodePattern.map((widthClass, index) => (
                <div key={index} className={`h-full bg-neutral-900 ${widthClass}`} />
              ))}
            </div>
            <span className="text-[9px] font-mono text-neutral-500 tracking-wider mt-0.5">
              ID: {registration.id} • DNI: {registration.documentNumber}
            </span>
          </div>

          {/* Verification Badge & QR */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                registration.paymentStatus === 'Verificado'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                {registration.paymentStatus}
              </span>
              <div className="text-[8px] text-neutral-400 mt-0.5">Llegada: Entre Jarras</div>
            </div>

            {/* Simulated QR Code box */}
            <div className="w-10 h-10 bg-neutral-900 text-white rounded p-1 flex items-center justify-center">
              <QrCode className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-semibold transition border border-neutral-700 hover:border-lime-400 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-lime-400" />
            Imprimir Dorsal
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition shadow-md cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Compartir en WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};
