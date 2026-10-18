import React, { useState } from 'react';
import { checkAdminLogin, DEFAULT_ADMIN_INFO } from '../data/auth';
import { Shield, KeyRound, User, AlertCircle, X, Check, Lock } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onClose }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAutoFillNotice, setShowAutoFillNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor ingresa la contraseña.');
      return;
    }

    const ok = checkAdminLogin(username, password);
    if (ok) {
      setError('');
      onSuccess();
    } else {
      setError('Usuario o contraseña incorrectos. Usa las credenciales generadas abajo.');
    }
  };

  const handleUseDefaultCreds = () => {
    setUsername(DEFAULT_ADMIN_INFO.user);
    setPassword(DEFAULT_ADMIN_INFO.pass);
    setError('');
    setShowAutoFillNotice(true);
    setTimeout(() => setShowAutoFillNotice(false), 2000);
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

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-bebas text-3xl text-white tracking-wider uppercase">
            Acceso Panel Organizador
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Gestión interna de inscritos, verificación de pagos y exportación a Excel.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Usuario de Administrador
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
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
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-lime-400/20 cursor-pointer"
          >
            Iniciar Sesión en el Panel
          </button>
        </form>

        {/* Credentials Box Helper */}
        <div className="mt-6 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-lime-400" />
              Tus Credenciales de Acceso
            </span>
            <button
              type="button"
              onClick={handleUseDefaultCreds}
              className="text-[11px] font-bold text-lime-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              {showAutoFillNotice ? <Check className="w-3 h-3" /> : null}
              {showAutoFillNotice ? '¡Cargadas!' : 'Autorrellenar'}
            </button>
          </div>
          <div className="space-y-1 font-mono text-neutral-400 text-[11px]">
            <div>Usuario: <strong className="text-white">admin</strong> (o ohanago)</div>
            <div>Contraseña: <strong className="text-lime-400">ohana2026</strong></div>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2">
            * Podrás cambiar tu contraseña dentro del panel una vez que inicies sesión.
          </p>
        </div>

      </div>
    </div>
  );
};
