import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, Sparkles, MapPin, Flag, ExternalLink } from 'lucide-react';
import { MASTER_START_QR_TOKEN, OFFICIAL_POTION_LOCATIONS } from '../data/potionConfig';

interface OfficialEventQRsModalProps {
  onClose: () => void;
}

export const OfficialEventQRsModal: React.FC<OfficialEventQRsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'start' | 'potions'>('all');
  const [startQrDataUrl, setStartQrDataUrl] = useState<string>('');
  const [potionQrDataUrls, setPotionQrDataUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate high resolution QR code for Start Line
    QRCode.toDataURL(MASTER_START_QR_TOKEN, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then((url) => setStartQrDataUrl(url));

    // Generate QR codes for all 5 Potion Locations
    const map: Record<string, string> = {};
    const promises = OFFICIAL_POTION_LOCATIONS.map(async (loc) => {
      const url = await QRCode.toDataURL(loc.qrToken, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      map[loc.id] = url;
    });

    Promise.all(promises).then(() => {
      setPotionQrDataUrls(map);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700 rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 font-bold uppercase text-[10px] tracking-wider border border-lime-400/30">
                Organización Técnica
              </span>
              <span className="text-neutral-400 text-xs font-semibold">Tarapoto 2026</span>
            </div>
            <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider uppercase mt-1">
              Códigos QR Oficiales del Evento
            </h3>
            <p className="text-xs text-neutral-400">
              Imprime o proyecta estos códigos en las zonas clave del evento para el check-in y el minijuego "Caldero de Pociones".
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-lime-400" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 py-3 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-lime-400 text-black'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            Todos los QRs (6)
          </button>
          <button
            onClick={() => setActiveTab('start')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'start'
                ? 'bg-lime-400 text-black'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            QR de Partida (Plaza de Armas)
          </button>
          <button
            onClick={() => setActiveTab('potions')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'potions'
                ? 'bg-lime-400 text-black'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            5 QRs Minijuego (Caldero)
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Start Line QR */}
          {(activeTab === 'all' || activeTab === 'start') && (
            <div className="p-6 rounded-3xl bg-neutral-950 border-2 border-lime-400/50 shadow-xl flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white p-3 rounded-2xl shrink-0 shadow-lg">
                {startQrDataUrl ? (
                  <img
                    src={startQrDataUrl}
                    alt="QR Oficial de Partida"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 bg-neutral-100 flex items-center justify-center text-black text-xs font-mono">
                    Generando QR...
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/40 text-xs font-black uppercase">
                  <Flag className="w-3.5 h-3.5" />
                  QR Maestro de Partida
                </div>
                <h4 className="font-bebas text-3xl text-white tracking-wider">
                  Check-in de Asistencia • Plaza de Armas
                </h4>
                <p className="text-xs text-neutral-300">
                  Ubicación: <strong>Arco de Salida en la Plaza Mayor de Tarapoto</strong> (7:00 PM).
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Los corredores escanean este código al llegar a la largada desde su celular para validar su presencia y confirmar sus datos oficiales.
                </p>
                <div className="pt-2 text-[11px] font-mono text-lime-400">
                  Código Token: <span className="text-white">{MASTER_START_QR_TOKEN}</span>
                </div>
              </div>
            </div>
          )}

          {/* 5 Potion QRs */}
          {(activeTab === 'all' || activeTab === 'potions') && (
            <div className="space-y-4">
              <h4 className="font-bebas text-2xl text-lime-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Los 5 Códigos QR del Minijuego "Caldero de Pociones"
              </h4>
              <p className="text-xs text-neutral-400 -mt-2">
                Ubica cada código en su zona correspondiente en Entre Jarras para que los corredores los descubran post-carrera.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OFFICIAL_POTION_LOCATIONS.map((loc, idx) => (
                  <div
                    key={loc.id}
                    className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center gap-4 hover:border-neutral-700 transition"
                  >
                    <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-md">
                      {potionQrDataUrls[loc.id] ? (
                        <img
                          src={potionQrDataUrls[loc.id]}
                          alt={loc.potionName}
                          className="w-32 h-32 object-contain"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-neutral-100 flex items-center justify-center text-black text-[10px] font-mono">
                          Generando...
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/30">
                        QR #{idx + 1} • {loc.name}
                      </span>
                      <h5 className="font-bebas text-xl text-white tracking-wide uppercase">
                        {loc.potionName}
                      </h5>
                      <div className="text-[11px] text-neutral-400 flex items-center justify-center sm:justify-start gap-1">
                        <MapPin className="w-3 h-3 text-lime-400 shrink-0" />
                        <span>{loc.zone}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 line-clamp-2">
                        {loc.description}
                      </p>
                      <div className="pt-1 text-[10px] font-mono text-neutral-400">
                        Rango: <span className="text-amber-400 font-bold">{loc.minCandies}-{loc.maxCandies} dulces</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
