import React, { useRef, useState, useEffect } from 'react';
import { RunnerRegistration } from '../types/race';
import { Printer, Share2, CheckCircle2, QrCode, Award, Droplets, Sparkles, Gift, ArrowLeft, Shirt, ShoppingBag } from 'lucide-react';
import QRCode from 'qrcode';

interface DigitalBibProps {
  registration: RunnerRegistration;
  showActions?: boolean;
  onBack?: () => void;
}

export const DigitalBib: React.FC<DigitalBibProps> = ({
  registration,
  showActions = true,
  onBack,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [bibQrUrl, setBibQrUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generate real scannable QR code containing universal verification URL
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ohanago.pro';
    const codeData = `${origin}/?runner=${encodeURIComponent(registration.id)}&dni=${encodeURIComponent(registration.documentNumber)}`;
    QRCode.toDataURL(codeData, {
      width: 280,
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
      `¡Ya tengo mi Pase Oficial para la SANTA RUN TARAPOTO 2026 con OHANA GO! 🎅🏃‍♂️💨\n\n` +
      `Código de Registro: ${registration.id}\n` +
      `Participante: ${registration.firstName} ${registration.lastName}\n` +
      `DNI: ${registration.documentNumber}\n` +
      `Fecha: Sábado 19 de Diciembre 2026\n` +
      `Horario: 7:00 P.M. (Partida Nocturna)\n` +
      `Partida: Parque de la Av. Aviación\n` +
      `Llegada: Concha Acústica\n` +
      `Kit Incluido: Medalla Finisher + Polo Oficial + Gorro Santa + Mochila + Sorteo de Pavo 🦃\n\n` +
      `Consulta tu pase oficial en: https://ohanago.pro`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Official Athlete Accreditation Pass */}
      <div
        ref={cardRef}
        className="printable-pass relative w-full max-w-md bg-gradient-to-b from-[#0B131E] via-[#0D1624] to-[#070D14] text-white rounded-3xl p-6 shadow-2xl border-2 border-red-500/70 overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-red-950/60 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bebas text-2xl tracking-wider text-white">
                OHANA <span className="text-red-500 font-extrabold">GO</span>
              </span>
              <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm font-mono shadow-sm">
                🎅 SANTA RUN
              </span>
            </div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              PASE OFICIAL DE PARTICIPANTE • TARAPOTO 2026
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-red-600 text-white font-bebas text-lg px-2.5 py-0.5 rounded-lg tracking-wider font-extrabold shadow-md">
              19 DIC
            </span>
            <div className="text-[9px] font-bold text-neutral-400 uppercase mt-0.5">
              7:00 P.M.
            </div>
          </div>
        </div>

        {/* Center: Participant Details */}
        <div className="py-2 text-center relative border-b border-white/10 pb-4">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest block mb-1">
            PARTICIPANTE REGISTRADO
          </span>
          <div className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide leading-tight">
            {registration.firstName} {registration.lastName}
          </div>
          <div className="text-xs font-mono text-amber-400 font-bold mt-1">
            {registration.documentType}: {registration.documentNumber}
          </div>
          {registration.tShirtSize && (
            <div className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5 font-medium">
              Talla Polo Oficial: <strong className="text-white">{registration.tShirtSize}</strong>
            </div>
          )}
        </div>

        {/* Unique Registration Code Badge */}
        <div className="my-4 p-3 bg-slate-900/90 rounded-2xl border border-red-500/30 flex items-center justify-between">
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
        <div className="space-y-2 mb-4 text-xs text-neutral-300 bg-slate-950/70 p-3 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Partida:</span>
            <span className="text-white font-bold">Parque de la Av. Aviación (7:00 PM)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Llegada:</span>
            <span className="text-red-400 font-bold">Concha Acústica</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
            <span className="text-amber-400 font-bold">🦃 Sorteo Especial:</span>
            <span className="text-white font-medium">Pavo Navideño con tu DNI</span>
          </div>
        </div>

        {/* Included benefits icons bar */}
        <div className="grid grid-cols-5 gap-1 py-2 text-center text-[9px] text-neutral-300 border-t border-white/10">
          <div className="flex flex-col items-center">
            <Award className="w-4 h-4 text-amber-400 mb-0.5" />
            <span>Medalla</span>
          </div>
          <div className="flex flex-col items-center">
            <Droplets className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span>Hidratación</span>
          </div>
          <div className="flex flex-col items-center">
            <Shirt className="w-4 h-4 text-red-400 mb-0.5" />
            <span>Polo Oficial</span>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-rose-400 mb-0.5" />
            <span>Gorro Santa</span>
          </div>
          <div className="flex flex-col items-center">
            <ShoppingBag className="w-4 h-4 text-emerald-400 mb-0.5" />
            <span>Mochila</span>
          </div>
        </div>

        {/* Bottom Bar: QR Code & Verification */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-red-400 block">
              Válido para Acreditación & Kit
            </span>
            <span className="text-[9px] text-neutral-400">
              Presenta este pase el día de la carrera
            </span>
          </div>
          <div className="w-12 h-12 bg-white text-black rounded-xl p-0.5 flex items-center justify-center overflow-hidden border border-red-500/50 shadow-sm">
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
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-red-300 rounded-xl text-xs font-bold transition border border-red-500/40 shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-red-400" />
              <span>← Volver a Mi Resumen</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition border border-white/20 hover:border-red-400 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
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
