import React, { useState } from 'react';
import { RunnerRegistration } from '../types/race';
import { DigitalBib } from './DigitalBib';
import { Search, AlertCircle } from 'lucide-react';

interface ConsultDorsalSectionProps {
  registrations: RunnerRegistration[];
}

export const ConsultDorsalSection: React.FC<ConsultDorsalSectionProps> = ({ registrations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundRunner, setFoundRunner] = useState<RunnerRegistration | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchTerm.trim().toLowerCase();
    if (!clean) return;

    setHasSearched(true);
    const result = registrations.find(
      (r) =>
        r.documentNumber.toLowerCase() === clean ||
        String(r.registrationNumber) === clean ||
        String(r.bibNumber) === clean ||
        r.id.toLowerCase() === clean ||
        (r.email && r.email.toLowerCase() === clean) ||
        (r.whatsapp && r.whatsapp.replace(/\D/g, '') === clean.replace(/\D/g, '')) ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(clean)
    );

    setFoundRunner(result || null);
  };

  return (
    <section id="consultar-inscripcion" className="pt-4 pb-3 px-4 max-w-4xl mx-auto scroll-mt-20">
      <div id="consultar-dorsal" />
      <div className="text-center mb-4">
        <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider uppercase">
          ¿Ya te inscribiste? <span className="text-cyan-400">Consulta tu Pase Oficial</span>
        </h2>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-neutral-900 border border-neutral-700 p-2 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 px-3 w-full">
            <Search className="w-5 h-5 text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Ingresa tu DNI o Código (Ej: 72849102)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-neutral-500 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bebas text-lg uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Result Display */}
      {hasSearched && (
        <div className="max-w-xl mx-auto">
          {foundRunner ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300">
                ✓ Registro encontrado exitosamente para <strong>{foundRunner.firstName} {foundRunner.lastName}</strong>
              </div>
              <DigitalBib registration={foundRunner} showActions={true} />
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center text-neutral-400">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <h4 className="font-bebas text-xl text-white uppercase">No se encontró registro</h4>
              <p className="text-xs mt-1">
                No hallamos ninguna inscripción con el término &quot;{searchTerm}&quot;. Verifica que hayas escrito correctamente tu DNI o realiza tu inscripción en el formulario de arriba.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
