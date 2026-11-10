import React, { useState } from 'react';
import { Sparkles, User, AlertCircle, X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { RunnerRegistration } from '../types/race';
import { INITIAL_REGISTRATIONS, getStoredRegistrations } from '../data/initialRegistrations';
import { trackEvent } from '../utils/analytics';

interface CompetitorLoginModalProps {
  onSuccess: (runner: RunnerRegistration) => void;
  onClose: () => void;
}

export const CompetitorLoginModal: React.FC<CompetitorLoginModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [dniInput, setDniInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = dniInput.trim();
    if (!raw) {
      setErrorMessage('Por favor ingresa tu número de DNI.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const clean = raw.toLowerCase().replace(/[\s\.\-#]/g, '');
    const cleanDigits = raw.replace(/\D/g, '');

    try {
      // 1. Try server endpoint
      const res = await fetch('/api/competitor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: raw }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.runner) {
          onSuccess(data.runner);
          return;
        }
      } else {
        const data = await res.json().catch(() => null);
        if (data?.error) {
          // keep for fallback check
        }
      }
    } catch (netErr) {
      // Continue to local fallback
    }

    // 2. Client-side fallback from getStoredRegistrations (syncs replacements & additions)
    try {
      const allList: RunnerRegistration[] = getStoredRegistrations();

      const matches = allList.filter((r) => {
        const rDni = String(r.documentNumber || '').trim().toLowerCase().replace(/[\s\.\-#]/g, '');
        const rDigits = String(r.documentNumber || '').replace(/\D/g, '');
        const rEmail = String(r.email || '').trim().toLowerCase();

        return (
          (clean && rDni === clean) ||
          (cleanDigits && rDigits === cleanDigits) ||
          (clean && rEmail === clean) ||
          (cleanDigits && cleanDigits.length >= 7 && rDigits.endsWith(cleanDigits))
        );
      });

      // Si tiene inscripciones en ambos eventos, prioriza Santa Run 2026 o la más reciente
      const match = matches.find((r) => r.edition === 'santa-run-2026' || r.id.startsWith('SR-')) || matches[0];

      if (match) {
        trackEvent({
          type: 'runner_login',
          runner: match,
          title: 'Atleta consultó Mi Espacio',
          description: `${match.firstName} ${match.lastName} (DNI: ${match.documentNumber}) revisó su credencial`,
        });
        onSuccess(match);
        return;
      }
    } catch (fallbackErr) {}

    setErrorMessage('No encontramos ninguna inscripción con el DNI ingresado. Por favor verifica los 8 dígitos e intenta de nuevo.');
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-gradient-to-b from-neutral-950 via-neutral-900 to-black border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(239,68,68,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-full transition cursor-pointer hover:border-red-400 border border-neutral-800"
          title="Cerrar y volver a la página de inicio"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center mb-3 shadow-xl shadow-red-600/30 border border-red-400/40 text-3xl">
            🎒
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-red-300 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/40 inline-block mb-1.5">
            Portal del Atleta Oficial
          </span>
          <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider uppercase leading-none">
            Mi Espacio <span className="text-red-500">OHANA GO</span>
          </h3>
          <p className="text-xs text-neutral-300 mt-2">
            Ingresa tu número de DNI para acceder a tu código QR y escanearlo con el personal en Aviación para tu acreditación y kit.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/90 border border-red-500/60 rounded-2xl text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center justify-between">
              <span>Número de DNI</span>
              <span className="text-[10px] text-amber-400 font-semibold lowercase">8 dígitos</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-red-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                maxLength={12}
                value={dniInput}
                onChange={(e) => {
                  setDniInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ingresa tu DNI (Ej: 47605471)"
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition text-sm font-semibold tracking-wider font-mono"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">
              💡 Ingresa el DNI con el que te registraste en la nómina oficial.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2 font-black"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Buscando tu DNI...</span>
              </>
            ) : (
              <>
                <span>Ingresar con mi DNI</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
