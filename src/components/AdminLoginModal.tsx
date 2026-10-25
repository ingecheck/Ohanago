import React, { useState } from 'react';
import { checkAdminLogin } from '../data/auth';
import { Shield, KeyRound, User, AlertCircle, X, Lock } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState('');

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
      setAdminError('Usuario o contraseña de organizador incorrectos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center mb-3 shadow-lg shadow-lime-400/10">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider uppercase leading-none">
            Panel de Organización
          </h3>
          <p className="text-xs text-neutral-400 mt-2">
            Acceso exclusivo para el comité organizador de OHANA GO 5K Tarapoto.
          </p>
        </div>

        {/* Error Alert */}
        {adminError && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{adminError}</span>
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Usuario de Administrador
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (adminError) setAdminError('');
                }}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-lime-400 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (adminError) setAdminError('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-lime-400 transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Shield className="w-5 h-5" />
            Ingresar al Panel
          </button>
        </form>
      </div>
    </div>
  );
};
