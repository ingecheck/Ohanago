import React, { useState } from 'react';
import { checkAdminLogin } from '../data/auth';
import { Shield, KeyRound, User, AlertCircle, X, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { RunnerRegistration } from '../types/race';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
  onCompetitorSuccess?: (runner: RunnerRegistration) => void;
  initialTab?: 'admin' | 'competitor';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onSuccess,
  onClose,
  onCompetitorSuccess,
  initialTab = 'admin',
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'competitor'>(initialTab);

  // Admin states (clean, without displaying credentials)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Competitor states
  const [competitorQuery, setCompetitorQuery] = useState('');
  const [competitorError, setCompetitorError] = useState('');
  const [isSearchingCompetitor, setIsSearchingCompetitor] = useState(false);

  // Handle Admin submit
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setAdminError('Ingresa el usuario de administración.');
      return;
    }
    if (!password) {
      setAdminError('Por favor ingresa la contraseña.');
      return;
    }

    const ok = checkAdminLogin(username.trim(), password);
    if (ok) {
      setAdminError('');
      onSuccess();
    } else {
      setAdminError('Usuario o contraseña incorrectos.');
    }
  };

  // Handle Competitor submit
  const handleCompetitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = competitorQuery.trim();
    if (!query) {
      setCompetitorError('Ingresa tu número de DNI o número de dorsal.');
      return;
    }

    setIsSearchingCompetitor(true);
    setCompetitorError('');

    try {
      const res = await fetch('/api/competitor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.runner) {
        if (onCompetitorSuccess) {
          onCompetitorSuccess(data.runner);
        }
      } else {
        setCompetitorError(
          data.error || 'No se encontró un competidor registrado con ese documento o dorsal.'
        );
      }
    } catch (err) {
      // Local fallback in case network has issues
      const localRegistrationsStr = localStorage.getItem('ohana_go_5k_tarapoto_registrations_v5');
      if (localRegistrationsStr) {
        try {
          const list: RunnerRegistration[] = JSON.parse(localRegistrationsStr);
          const clean = query.toLowerCase();
          const match = list.find(
            (r) =>
              String(r.documentNumber).toLowerCase() === clean ||
              String(r.registrationNumber) === clean ||
              String(r.bibNumber) === clean ||
              String(r.id).toLowerCase() === clean ||
              (r.email && String(r.email).toLowerCase() === clean) ||
              (r.whatsapp && String(r.whatsapp).replace(/\D/g, '') === clean.replace(/\D/g, '')) ||
              `${r.firstName} ${r.lastName}`.toLowerCase().includes(clean)
          );
          if (match && onCompetitorSuccess) {
            onCompetitorSuccess(match);
            return;
          }
        } catch (e) {}
      }
      setCompetitorError('No se encontró un competidor registrado con ese documento o dorsal.');
    } finally {
      setIsSearchingCompetitor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-950 rounded-2xl mb-6 border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setAdminError('');
            }}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-neutral-800 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-lime-400" />
            Organizador
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('competitor');
              setCompetitorError('');
            }}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'competitor'
                ? 'bg-lime-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mi Espacio 🎒
          </button>
        </div>

        {/* TAB 1: ACCESO ADMINISTRADOR (Clean, no credentials on screen) */}
        {activeTab === 'admin' && (
          <div>
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-bebas text-3xl text-white tracking-wider uppercase">
                Panel de Administración
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Ingreso exclusivo para el equipo organizador de OHANA GO.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Usuario de Administración
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario"
                    autoComplete="username"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>

              {adminError && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-lime-400/20 cursor-pointer mt-2"
              >
                Ingresar al Panel
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MI ESPACIO 🎒 (Corredor registrado) */}
        {activeTab === 'competitor' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-bebas text-3xl text-white tracking-wider uppercase">
                Mi Espacio 🎒
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Accede a tu pase digital, número de dorsal y check-in de partida.
              </p>
            </div>

            <form onSubmit={handleCompetitorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Número de DNI o Número de Dorsal
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={competitorQuery}
                    onChange={(e) => setCompetitorQuery(e.target.value)}
                    placeholder="Ej: 72849102 o Dorsal 1"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Ingresa el documento o número correlativo asignado durante tu inscripción.
                </p>
              </div>

              {competitorError && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{competitorError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSearchingCompetitor}
                className="w-full py-3.5 bg-gradient-to-r from-lime-400 to-lime-300 hover:from-lime-300 hover:to-lime-200 text-black font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-lime-400/20 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSearchingCompetitor ? 'Buscando...' : 'Entrar a Mi Cuenta de Corredor'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
