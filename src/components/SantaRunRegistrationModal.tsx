import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Percent, Heart, MessageCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { RunnerRegistration, PaymentMethod } from '../types/race';
import { isPreviousOhanaParticipant, INITIAL_REGISTRATIONS } from '../data/initialRegistrations';
import confetti from 'canvas-confetti';

interface SantaRunRegistrationModalProps {
  onClose: () => void;
  onSuccess: (newRegistration: RunnerRegistration) => void;
}

export const SantaRunRegistrationModal: React.FC<SantaRunRegistrationModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    whatsapp: '',
    email: '',
    tShirtSize: 'M',
    gender: 'Mixto' as const,
    age: 25,
    runningClub: 'Ohana Go',
    emergencyContactName: '',
    emergencyContactPhone: '',
    paymentMethod: 'Yape' as PaymentMethod,
    paymentReference: '',
    disclaimerAccepted: true,
  });

  const [hasDiscount, setHasDiscount] = useState(false);
  const [recognizedRunnerName, setRecognizedRunnerName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live check when DNI changes
  useEffect(() => {
    const cleanDni = formData.dni.trim();
    if (cleanDni.length >= 8) {
      const match = INITIAL_REGISTRATIONS.find((r) => r.documentNumber.trim() === cleanDni);
      if (match) {
        setHasDiscount(true);
        setRecognizedRunnerName(`${match.firstName} ${match.lastName}`);
        // Auto-fill names if empty
        if (!formData.firstName) {
          setFormData((prev) => ({
            ...prev,
            firstName: match.firstName,
            lastName: match.lastName,
            email: prev.email || match.email || '',
            whatsapp: prev.whatsapp || match.whatsapp || '',
            emergencyContactName: prev.emergencyContactName || match.emergencyContactName || '',
            emergencyContactPhone: prev.emergencyContactPhone || match.emergencyContactPhone || '',
          }));
        }
      } else {
        setHasDiscount(false);
        setRecognizedRunnerName(null);
      }
    } else {
      setHasDiscount(false);
      setRecognizedRunnerName(null);
    }
  }, [formData.dni]);

  const finalAmount = hasDiscount ? 59.50 : 70.00;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.dni.trim() || formData.dni.trim().length < 8) {
      setErrorMessage('Por favor ingresa un número de DNI válido (mínimo 8 dígitos).');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('Por favor ingresa tus nombres y apellidos completos.');
      return;
    }

    if (!formData.whatsapp.trim()) {
      setErrorMessage('Por favor ingresa tu número de WhatsApp para coordinar tu dorsal y entrega de kit.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique registration ID and ticket for Turkey Raffle
      const timestampId = Date.now().toString().slice(-4);
      const regId = `SR-2026-${timestampId}`;
      const turkeyTicket = `PAVO-SR2026-${timestampId}`;

      const newRegistration: RunnerRegistration = {
        id: regId,
        registrationNumber: parseInt(timestampId, 10) || 1,
        bibNumber: parseInt(timestampId, 10) || 1,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        documentType: 'DNI',
        documentNumber: formData.dni.trim(),
        email: formData.email.trim() || 'contacto@ohanago.pro',
        whatsapp: formData.whatsapp.trim(),
        age: Number(formData.age) || 25,
        gender: formData.gender,
        city: 'Tarapoto',
        district: 'Tarapoto',
        department: 'San Martín',
        runningClub: formData.runningClub.trim() || 'Ohana Go',
        tShirtSize: formData.tShirtSize,
        emergencyContactName: formData.emergencyContactName.trim() || 'Familiar',
        emergencyContactPhone: formData.emergencyContactPhone.trim() || formData.whatsapp.trim(),
        willWearCostume: true,
        costumeName: 'Santa Hat & Running Kit',
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference.trim() || `YAPE-SR-${timestampId}`,
        paymentStatus: 'Pendiente de Verificación',
        createdAt: new Date().toISOString(),
        disclaimerAccepted: true,
        modality: 'Presencial',
        confirmedAtStart: false,
        finishedAtMeta: false,
        medalDelivered: false,
        // Santa Run specific
        edition: 'santa-run-2026',
        hasPreviousDiscount: hasDiscount,
        amountPaid: finalAmount,
        turkeyRaffleTicket: turkeyTicket,
        kitClaimed: false,
        santaCapDelivered: false,
        backpackDelivered: false,
      };

      // Broadcast event
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      onSuccess(newRegistration);
    } catch (err) {
      setErrorMessage('Ocurrió un error al procesar tu inscripción. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border-2 border-red-600/50 rounded-3xl p-5 sm:p-8 shadow-2xl my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
              <span>🎅 OHANA GO</span>
            </div>
            <h3 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide leading-none">
              Inscripción Oficial <span className="text-red-500">Santa Run 2026</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Sábado 19 de Diciembre · 7:00 P.M. · Tarapoto
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live discount banner when DNI matches previous edition */}
        {hasDiscount && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/90 via-neutral-900 to-red-950/90 border border-red-500/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-bebas text-2xl font-black flex items-center justify-center shrink-0 shadow-md shadow-red-600/40">
              15%
            </div>
            <div className="text-xs text-left">
              <span className="font-bold text-white block">
                ¡Beneficio Exclusivo Ohana Go Activado!
              </span>
              <span className="text-neutral-300">
                {recognizedRunnerName ? `¡Hola ${recognizedRunnerName}! ` : ''}Por ser corredor de una edición anterior, tu tarifa tiene 15% de descuento: 
                <strong className="text-red-400 ml-1">S/ 59.50</strong> (en vez de S/ 70.00).
              </span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Row 1: DNI & Telefono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1 font-bold">
                DNI / Documento *
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="Ingresa tu DNI"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 transition font-mono"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Si corriste la Halloween 5K, se te aplicará el 15% de descuento automáticamente.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1 font-bold">
                WhatsApp de Contacto *
              </label>
              <input
                type="tel"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="Ej: 902227356"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 transition font-mono"
              />
            </div>
          </div>

          {/* Row 2: Nombres & Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1 font-bold">
                Nombres *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Tus nombres"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1 font-bold">
                Apellidos *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Tus apellidos"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* Row 3: Talla de Polo & Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1 font-bold">
                Talla de Polo Oficial (Dry-Fit) *
              </label>
              <select
                value={formData.tShirtSize}
                onChange={(e) => setFormData({ ...formData, tShirtSize: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500 transition"
              >
                <option value="S">S (Small - Unisex)</option>
                <option value="M">M (Medium - Unisex)</option>
                <option value="L">L (Large - Unisex)</option>
                <option value="XL">XL (Extra Large - Unisex)</option>
                <option value="XXL">XXL (Doble Extra Large)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1 font-bold">
                Correo Electrónico (Opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tuemail@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* Payment Box */}
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-neutral-300 font-bold">
                Monto a Pagar:
              </span>
              <span className="font-bebas text-3xl text-white">
                S/ {finalAmount.toFixed(2)}
              </span>
            </div>

            <div className="text-xs text-neutral-400 space-y-1 pt-2 border-t border-neutral-800/80">
              <p>• <strong className="text-emerald-400">Yape Oficial (Solo Yape):</strong> <strong className="text-white font-mono text-sm">963 408 328</strong></p>
              <p>• Titular: <strong className="text-white">GISELA SANTA CRUZ</strong></p>
              <p>• Coordinación WhatsApp: <strong className="text-red-400 font-mono">+51 902 227 356</strong></p>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1 font-bold">
                Número de Operación / Código Yape (Opcional)
              </label>
              <input
                type="text"
                value={formData.paymentReference}
                onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                placeholder="Ej: YAPE-849204"
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Kit & Turkey Recap */}
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-[11px] text-neutral-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Incluye Medalla Finisher Oficial 6K, Polo Dry-Fit, Gorra Navideña, Mochila, Pulsera Oficial, Hidratación y tu Ticket Oficial para el <strong>Sorteo del Pavo</strong> en la Concha Acústica.
            </span>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bebas text-2xl uppercase tracking-wider transition-all duration-200 transform hover:scale-[1.01] active:scale-95 shadow-xl shadow-red-600/30 font-black cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Procesando...' : `Confirmar Inscripción (S/ ${finalAmount.toFixed(2)})`}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
