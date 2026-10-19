import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { MASTER_START_QR_TOKEN, OFFICIAL_POTION_LOCATIONS } from '../data/potionConfig';

interface QRScannerModalProps {
  title: string;
  subtitle?: string;
  expectedType?: 'start_checkin' | 'potion' | 'any';
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  title,
  subtitle,
  expectedType = 'any',
  onScanSuccess,
  onClose,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [successScanned, setSuccessScanned] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader-viewport';

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleCodeFound(decodedText);
          },
          () => {
            // Frame scan without QR - ignore
          }
        );
        setIsScanning(true);
      } catch (err: any) {
        console.warn('Camera error:', err);
        setCameraError(
          'No se pudo acceder a la cámara o el navegador no otorgó permisos. Puedes ingresar el código o usar los accesos de prueba abajo.'
        );
        setIsScanning(false);
      }
    };

    // Small delay to ensure container is mounted in DOM
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch((e) => console.warn('Scanner stop error:', e));
      }
    };
  }, []);

  const handleCodeFound = (text: string) => {
    if (successScanned) return;
    setSuccessScanned(true);

    // Stop scanner
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }

    // Play quick feedback
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (e) {}

    setTimeout(() => {
      onScanSuccess(text.trim());
    }, 400);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCodeFound(manualCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center mb-2">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider uppercase">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Camera Viewport */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-neutral-800 mb-4 flex flex-col items-center justify-center min-h-[260px]">
          <div id={containerId} className="w-full h-full min-h-[260px]" />

          {successScanned && (
            <div className="absolute inset-0 bg-lime-950/90 flex flex-col items-center justify-center text-lime-400 p-4 text-center z-20">
              <CheckCircle2 className="w-16 h-16 mb-2 animate-bounce" />
              <span className="font-bebas text-2xl text-white">¡Código QR Detectado!</span>
              <span className="text-xs text-lime-300">Procesando información...</span>
            </div>
          )}

          {cameraError && !successScanned && (
            <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center text-xs text-neutral-400">
              <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
              <p className="mb-2 text-neutral-300">{cameraError}</p>
              <span className="text-[11px] text-lime-400 font-bold">
                Usa el selector o ingresa el código manual abajo:
              </span>
            </div>
          )}
        </div>

        {/* Manual code input */}
        <form onSubmit={handleManualSubmit} className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
            Ingreso manual de código QR
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ej: OHANA-POTION-1-HIDRATACION"
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-lime-400"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black font-bebas text-base uppercase rounded-xl transition cursor-pointer"
            >
              Validar
            </button>
          </div>
        </form>

        {/* Quick simulator buttons for easy testing */}
        <div className="pt-3 border-t border-neutral-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2">
            Accesos de Prueba Rápida en el Evento:
          </span>

          {expectedType === 'start_checkin' || expectedType === 'any' ? (
            <button
              type="button"
              onClick={() => handleCodeFound(MASTER_START_QR_TOKEN)}
              className="w-full mb-2 p-2.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/40 text-lime-400 text-left flex items-center justify-between text-xs font-bold transition cursor-pointer"
            >
              <span>🏁 QR Maestro de Partida (Plaza de Armas)</span>
              <span className="text-[10px] bg-lime-400 text-black px-1.5 py-0.5 rounded font-black">Probar</span>
            </button>
          ) : null}

          {expectedType === 'potion' || expectedType === 'any' ? (
            <div className="space-y-1.5">
              <span className="text-[10px] text-neutral-500 font-semibold block">Simular Escaneo de Pociones (1 al 5):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {OFFICIAL_POTION_LOCATIONS.map((loc, idx) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleCodeFound(loc.qrToken)}
                    className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-left text-[11px] truncate transition cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate">QR {idx + 1}: {loc.name}</span>
                    <Sparkles className="w-3 h-3 text-lime-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
