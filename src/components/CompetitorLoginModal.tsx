import React, { useState } from 'react';
import { Sparkles, User, AlertCircle, X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { RunnerRegistration } from '../types/race';
import { INITIAL_REGISTRATIONS } from '../data/initialRegistrations';
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

    // 2. Client-side fallback from INITIAL_REGISTRATIONS & localStorage
    try {
      let allList: RunnerRegistration[] = INITIAL_REGISTRATIONS;
      const stored = localStorage.getItem('ohana_registrations');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allList = parsed;
          }
        } catch (e) {}
      }

      const match = allList.find((r) => {
        const rDni = String(r.documentNumber || '').trim().toLowerCase().replace(/[\s\.\-#]/g, '');
        const rDigits = String(r.documentNumber || '').replace(/\D/g, '');

        return (
          (clean && rDni === clean) ||
          (cleanDigits && rDigits === cleanDigits) ||
          (cleanDigits && cleanDigits.length >= 7 && rDigits.endsWith(cleanDigits))
        );
      });

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
      <div className="relative w-full max-w-md bg-gradient-to-b from-neutral-950 via-purple-950/40 to-neutral-950 border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-800/80 rounded-full transition cursor-pointer hover:border-lime-400 border border-neutral-700"
          title="Cerrar y volver a la página de inicio"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center mb-3 shadow-xl shadow-purple-600/30 border border-purple-400/40 text-3xl">
            🎒
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-500/40 inline-block mb-1.5">
            Portal del Atleta Oficial
          </span>
          <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider uppercase leading-none">
            Mi Espacio <span className="text-lime-400">OHANA GO</span>
          </h3>
          <p className="text-xs text-neutral-300 mt-2">
            Ingresa tu número de DNI para acceder a tu pase digital oficial, credencial y validación de asistencia en partida.
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
              <span className="text-[10px] text-lime-400 font-semibold lowercase">8 dígitos</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
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
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-purple-500/40 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition text-sm font-semibold tracking-wider font-mono"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">
              💡 Ingresa el DNI con el que te registraste en la nómina oficial.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
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
