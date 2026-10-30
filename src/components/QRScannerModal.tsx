import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, Sparkles, RefreshCw, CheckCircle2, ArrowLeft, User } from 'lucide-react';
export const MASTER_START_QR_TOKEN = 'OHANA-START-LINE-TARAPOTO-2026';

interface QRScannerModalProps {
  title: string;
  subtitle?: string;
  expectedType?: 'start_checkin' | 'any';
  allowManualInput?: boolean;
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  title,
  subtitle,
  expectedType = 'any',
  allowManualInput = false,
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
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(minEdge * 0.88);
            return { width: Math.max(edge, 280), height: Math.max(edge, 280) };
          },
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
          'No se pudo acceder a la cámara o el navegador no otorgó permisos. Por favor concede permisos de cámara en tu navegador para escanear el código QR.'
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
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-neutral-900 border-2 border-lime-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[94vh] overflow-y-auto">
        {/* Header navigation bar with Volver button */}
        <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-lime-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-lime-400/40 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-lime-400" />
            <span>← Volver</span>
          </button>

          <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-1 rounded-full border border-lime-400/30">
            Escaneo Rápido de Kit
          </span>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer"
            title="Cerrar escáner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider uppercase leading-none">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Camera Viewport (Large, Spacious Square Viewfinder) */}
        <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-neutral-800 mb-4 flex flex-col items-center justify-center min-h-[340px] sm:min-h-[400px] w-full aspect-square max-h-[440px] shadow-inner">
          <div id={containerId} className="w-full h-full min-h-[340px] sm:min-h-[400px]" />

          {/* Visual Target Frame Overlay with Lime Corners */}
          <div className="absolute inset-4 sm:inset-6 pointer-events-none border-2 border-dashed border-lime-400/30 rounded-2xl flex flex-col justify-between p-2">
            {/* Top Corners */}
            <div className="flex justify-between">
              <div className="w-8 h-8 border-t-4 border-l-4 border-lime-400 rounded-tl-xl shadow-[0_0_15px_rgba(163,230,53,0.8)]" />
              <div className="w-8 h-8 border-t-4 border-r-4 border-lime-400 rounded-tr-xl shadow-[0_0_15px_rgba(163,230,53,0.8)]" />
            </div>

            {/* Pulsing center guideline */}
            <div className="w-full text-center py-2 bg-black/60 backdrop-blur-sm rounded-xl border border-lime-400/30 mx-auto max-w-[280px]">
              <span className="text-[11px] font-bold text-lime-400 tracking-wide">
                Centra el código QR en este cuadro
              </span>
            </div>

            {/* Bottom Corners */}
            <div className="flex justify-between">
              <div className="w-8 h-8 border-b-4 border-l-4 border-lime-400 rounded-bl-xl shadow-[0_0_15px_rgba(163,230,53,0.8)]" />
              <div className="w-8 h-8 border-b-4 border-r-4 border-lime-400 rounded-br-xl shadow-[0_0_15px_rgba(163,230,53,0.8)]" />
            </div>
          </div>

          {successScanned && (
            <div className="absolute inset-0 bg-lime-950/95 flex flex-col items-center justify-center text-lime-400 p-6 text-center z-30">
              <CheckCircle2 className="w-20 h-20 mb-2 animate-bounce text-lime-400" />
              <span className="font-bebas text-3xl text-white">¡Código QR Detectado!</span>
              <span className="text-sm text-lime-300 font-semibold mt-1">Registrando entrega de kit en tiempo real...</span>
            </div>
          )}

          {cameraError && !successScanned && (
            <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center text-xs text-neutral-400 z-30">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="mb-2 text-neutral-300 font-medium">{cameraError}</p>
              {allowManualInput && (
                <span className="text-xs text-lime-400 font-bold">
                  Puedes ingresar el número de DNI manualmente abajo:
                </span>
              )}
            </div>
          )}
        </div>

        {/* Manual code input (only for authorized staff if allowManualInput is true, strictly hidden for competitors) */}
        {allowManualInput && (
          <form onSubmit={handleManualSubmit} className="mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Ingreso manual de código QR o DNI
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ej: 47605471 o OHA-2026-0003"
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
        )}



        {/* Bottom Back Button */}
        <div className="pt-3 border-t border-neutral-800 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-lime-400" />
            <span>← Volver y Cerrar Escáner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
