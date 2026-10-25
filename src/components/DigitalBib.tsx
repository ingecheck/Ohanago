import React, { useRef, useState, useEffect } from 'react';
import { RunnerRegistration } from '../types/race';
import { Printer, Share2, CheckCircle2, QrCode, Award, Droplets, Sparkles, Gift } from 'lucide-react';
import QRCode from 'qrcode';

interface DigitalBibProps {
  registration: RunnerRegistration;
  showActions?: boolean;
}

export const DigitalBib: React.FC<DigitalBibProps> = ({ registration, showActions = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [bibQrUrl, setBibQrUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generate real scannable QR code containing runner ID and document number
    const codeData = registration.id || registration.documentNumber || `RUNNER-${registration.registrationNumber}`;
    QRCode.toDataURL(codeData, {
      width: 256,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setBibQrUrl(url))
      .catch((err) => console.error('Error generating bib QR:', err));
  }, [registration]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Ya tengo mi Pase Oficial para la OHANA GO 5K Por Halloween en Tarapoto! 🎃🏃‍♂️\n\n` +
      `Código de Registro: ${registration.id}\n` +
      `Participante: ${registration.firstName} ${registration.lastName}\n` +
      `Distancia: 5K\n` +
      `Fecha: Sábado 31 de Octubre 2026 - 7:00 P.M.\n` +
      `Partida: Plaza de Armas Tarapoto\n` +
      `Llegada: Entre Jarras (Medalla Finisher & Sorteos)\n\n` +
      `Inscríbete tú también aquí: https://ohanago.pro`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Official Athlete Accreditation Pass */}
      <div
        ref={cardRef}
        className="printable-pass relative w-full max-w-md bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white rounded-3xl p-6 shadow-2xl border-2 border-lime-400/60 overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bebas text-2xl tracking-wider text-white">
                OHANA <span className="text-lime-400 font-extrabold">GO</span>
              </span>
              <span className="bg-orange-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm font-marker">
                5K HALLOWEEN
              </span>
            </div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              PASE OFICIAL DE PARTICIPANTE • TARAPOTO 2026
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-lime-400 text-black font-bebas text-lg px-2.5 py-0.5 rounded-lg tracking-wider font-extrabold">
              5K
            </span>
            <div className="text-[9px] font-bold text-neutral-400 uppercase mt-0.5">
              31 OCT • 7:00 PM
            </div>
          </div>
        </div>

        {/* Center: Participant Details */}
        <div className="py-2 text-center relative border-b border-neutral-800/80 pb-4">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest block mb-1">
            PARTICIPANTE REGISTRADO
          </span>
          <div className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide leading-tight">
            {registration.firstName} {registration.lastName}
          </div>
          <div className="text-xs font-mono text-lime-400 font-bold mt-1">
            {registration.documentType}: {registration.documentNumber}
          </div>
          {registration.runningClub && (
            <div className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5 font-medium">
              Team: {registration.runningClub}
            </div>
          )}
        </div>

        {/* Unique Registration Code Badge */}
        <div className="my-4 p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Código de Registro
            </span>
            <span className="font-mono text-lg font-black text-white">
              {registration.id}
            </span>
          </div>
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${
            registration.paymentStatus === 'Verificado'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              : 'bg-amber-950 text-amber-400 border border-amber-500/40'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {registration.paymentStatus}
          </span>
        </div>

        {/* Event Logistics & Included Benefits */}
        <div className="space-y-2 mb-4 text-xs text-neutral-300 bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Partida:</span>
            <span className="text-white font-bold">Plaza de Armas Tarapoto (7:00 PM)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Llegada:</span>
            <span className="text-orange-400 font-bold">Entre Jarras (Jr. Lima cda. 13)</span>
          </div>
          {registration.willWearCostume && (
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[11px]">
              <span className="text-purple-400 font-bold">🎃 Disfraz Concurso:</span>
              <span className="text-white font-medium truncate max-w-[200px]">{registration.costumeName || 'Inscrito al concurso'}</span>
            </div>
          )}
        </div>

        {/* Included benefits icons bar */}
        <div className="grid grid-cols-4 gap-1.5 py-2 text-center text-[10px] text-neutral-400 border-t border-neutral-800">
          <div className="flex flex-col items-center">
            <Award className="w-4 h-4 text-amber-400 mb-0.5" />
            <span>Medalla</span>
          </div>
          <div className="flex flex-col items-center">
            <Droplets className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span>Hidratación</span>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-lime-400 mb-0.5" />
            <span>Artículo Neón</span>
          </div>
          <div className="flex flex-col items-center">
            <Gift className="w-4 h-4 text-purple-400 mb-0.5" />
            <span>Sorteos</span>
          </div>
        </div>

        {/* Bottom Bar: QR Code & Verification */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-lime-400 block">
              Válido para Canje de Medalla
            </span>
            <span className="text-[9px] text-neutral-400">
              Presenta este pase en la meta en Entre Jarras
            </span>
          </div>
          <div className="w-12 h-12 bg-white text-black rounded-xl p-0.5 flex items-center justify-center overflow-hidden border border-lime-400/50 shadow-sm">
            {bibQrUrl ? (
              <img src={bibQrUrl} alt="QR Pase Oficial" className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-8 h-8 text-black" />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition border border-neutral-700 hover:border-lime-400 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-lime-400" />
            Imprimir / Guardar Pase
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Compartir en WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};
