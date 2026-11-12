import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Gift,
  ShieldCheck,
  CreditCard,
  User,
  Phone,
  Mail,
  Shirt,
  Heart,
  Loader2,
  Check,
  Percent,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  Lock,
  Eye
} from 'lucide-react';
import { RunnerRegistration, DocumentType, Gender, PaymentMethod } from '../types/race';
import { getStoredRegistrations } from '../data/initialRegistrations';
import { trackEvent } from '../utils/analytics';

interface RegistrationFormProps {
  onRegistrationSuccess?: (registration: RunnerRegistration) => void;
  onOpenCompetitorLogin?: () => void;
  onGoToRoute?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onRegistrationSuccess,
  onOpenCompetitorLogin,
}) => {
  // Form input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Mixto');
  const [tShirtSize, setTShirtSize] = useState('M');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Yape');
  const [paymentReference, setPaymentReference] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Voucher upload states (100% Optional)
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [voucherFileName, setVoucherFileName] = useState<string>('');
  const [voucherFileSize, setVoucherFileSize] = useState<string>('');
  const [isCompressingVoucher, setIsCompressingVoucher] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const processVoucherFile = (file: File) => {
    setVoucherFileName(file.name);
    const sizeKb = Math.round(file.size / 1024);
    setVoucherFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
    setIsCompressingVoucher(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawData = event.target?.result as string;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setVoucherPreview(compressed);
            setIsCompressingVoucher(false);
            return;
          }
          setVoucherPreview(rawData);
          setIsCompressingVoucher(false);
        };
        img.onerror = () => {
          setVoucherPreview(rawData);
          setIsCompressingVoucher(false);
        };
        img.src = rawData;
      } else {
        setVoucherPreview(rawData);
        setIsCompressingVoucher(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processVoucherFile(file);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherPreview(null);
    setVoucherFileName('');
    setVoucherFileSize('');
  };

  // Discount detection
  const [hasPreviousDiscount, setHasPreviousDiscount] = useState(false);
  const [discountChecked, setDiscountChecked] = useState(false);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Base price: S/ 70.00
  const regularPrice = 70.0;
  const discountRate = 0.15;
  const discountedPrice = 59.5;
  const finalPrice = hasPreviousDiscount ? discountedPrice : regularPrice;

  // Real-time check for previous edition discount when DNI is entered
  useEffect(() => {
    const cleanDni = documentNumber.trim().replace(/\D/g, '');
    if (cleanDni.length >= 8) {
      try {
        const stored = getStoredRegistrations();
        const found = stored.some(
          (r) => r.documentNumber?.replace(/\D/g, '') === cleanDni
        );
        setHasPreviousDiscount(found);
        setDiscountChecked(true);
      } catch (e) {
        setHasPreviousDiscount(false);
      }
    } else {
      setHasPreviousDiscount(false);
      setDiscountChecked(false);
    }
  }, [documentNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validations
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Por favor ingresa tus nombres y apellidos completos.');
      return;
    }
    if (!documentNumber.trim() || documentNumber.trim().length < 6) {
      setErrorMessage('Ingresa un número de documento válido (DNI / CE / Pasaporte).');
      return;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 9) {
      setErrorMessage('Ingresa un número de celular o WhatsApp de 9 dígitos para coordinar tu entrega.');
      return;
    }
    if (!disclaimerAccepted) {
      setErrorMessage('Debes aceptar el deslinde de responsabilidad y términos de participación.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const stored = getStoredRegistrations();
    const santaList = stored.filter((r) => r.edition === 'santa-run-2026' || r.id?.startsWith('SR-'));
    const nextSantaNum = santaList.length > 0
      ? Math.max(...santaList.map((r) => r.registrationNumber || 0)) + 1
      : 1;

    const newRunner: RunnerRegistration = {
      id: `SR-2026-${String(nextSantaNum).padStart(4, '0')}`,
      edition: 'santa-run-2026',
      registrationNumber: nextSantaNum,
      bibNumber: nextSantaNum,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      documentType,
      documentNumber: documentNumber.trim(),
      email: email.trim() || `${documentNumber.trim()}@ohanago.pro`,
      whatsapp: whatsapp.trim(),
      age: Number(age) || 25,
      gender,
      department: 'San Martín',
      city: 'Tarapoto',
      district: 'Tarapoto',
      runningClub: 'Santa Run Club',
      tShirtSize,
      amountPaid: finalPrice,
      hasPreviousDiscount,
      turkeyRaffleTicket: `PAVO-${String(nextSantaNum).padStart(4, '0')}`,
      emergencyContactName: emergencyContactName.trim() || 'Contacto de Emergencia',
      emergencyContactPhone: emergencyContactPhone.trim() || whatsapp.trim(),
      willWearCostume: true,
      costumeName: 'Gorra Navideña Santa',
      paymentMethod: 'Yape',
      paymentReference: paymentReference.trim() || `YAPE-SANTA-${Date.now().toString().slice(-4)}`,
      paymentProofImage: voucherPreview || undefined,
      voucherUrl: voucherPreview || undefined,
      paymentStatus: 'No Verificado',
      createdAt: now,
      disclaimerAccepted: true,
      modality: 'Presencial',
      confirmedAtStart: false,
      finishedAtMeta: false,
      medalDelivered: false,
    };

    try {
      // 1. Try server endpoint
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRunner),
      });

      if (res.ok) {
        const savedRecord = await res.json();
        try {
          const updatedList = [savedRecord, ...stored.filter((r) => r.id !== savedRecord.id)];
          localStorage.setItem('ohana_registrations', JSON.stringify(updatedList));
          localStorage.setItem('ohana_local_registrations', JSON.stringify(updatedList));
          localStorage.setItem('ohana_active_competitor', JSON.stringify(savedRecord));
        } catch (e) {}

        trackEvent({
          type: 'runner_login',
          runner: savedRecord,
          title: 'Nueva Inscripción Oficial',
          description: `${savedRecord.firstName} ${savedRecord.lastName} (${savedRecord.documentNumber})`,
        });
        if (onRegistrationSuccess) {
          onRegistrationSuccess(savedRecord);
        }
        return;
      }
    } catch (netErr) {
      // Continue to local storage fallback
    }

    // 2. Client fallback
    try {
      const updatedList = [newRunner, ...stored];
      localStorage.setItem('ohana_local_registrations', JSON.stringify(updatedList));
      trackEvent({
        type: 'runner_login',
        runner: newRunner,
        title: 'Nueva Inscripción Local',
        description: `${newRunner.firstName} ${newRunner.lastName} (${newRunner.documentNumber})`,
      });
      if (onRegistrationSuccess) {
        onRegistrationSuccess(newRunner);
      }
    } catch (err) {
      setErrorMessage('Hubo un error al procesar tu registro. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="formulario-registro" className="py-12 sm:py-20 px-4 max-w-4xl mx-auto scroll-mt-20">
      <div className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-black to-neutral-950 border-2 border-red-500/40 rounded-3xl p-6 sm:p-10 md:p-12 shadow-[0_20px_70px_rgba(212,36,38,0.25)] backdrop-blur-xl">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono font-bold uppercase tracking-widest mb-3 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>INSCRIPCIONES OFICIALES ABIERTAS</span>
            <span className="text-amber-400 font-black">★</span>
          </div>

          <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wide uppercase leading-none drop-shadow-md">
            INSCRIPCIÓN · <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">SANTA RUN TARAPOTO 2026</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto mt-3 leading-relaxed font-sans">
            Asegura tu cupo oficial, tu kit completo con medalla conmemorativa, polo oficial, gorro de Santa y mochila, y participa en el gran sorteo del pavo navideño.
          </p>
        </div>

        {/* Price & Discount Indicator */}
        <div className="mb-8 p-4 rounded-2xl bg-neutral-900/90 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-neutral-400 block font-bold">Inversión de Inscripción</span>
              <div className="flex items-baseline gap-2">
                <span className="font-bebas text-3xl sm:text-4xl text-white font-black">
                  S/ {finalPrice.toFixed(2)}
                </span>
                {hasPreviousDiscount && (
                  <span className="text-xs text-neutral-400 line-through font-mono">
                    S/ {regularPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {hasPreviousDiscount ? (
            <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-400" />
              <span><strong>¡15% de descuento aplicado!</strong> Reconocido como atleta Ohana Go</span>
            </div>
          ) : (
            <div className="text-xs text-neutral-400 font-mono text-center sm:text-right">
              <span>¿Corriste en ediciones previas? Ingresa tu DNI para validar tu 15% OFF</span>
            </div>
          )}
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500 text-red-200 text-xs sm:text-sm flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <h3 className="font-bebas text-xl text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <User className="w-4 h-4 text-red-400" />
              <span>1. Datos del Corredor</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1.5 font-bold">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej: Rafael Carlos"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1.5 font-bold">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej: García Mendoza"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition backdrop-blur-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1.5 font-bold">
                  Tipo Doc.
                </label>
                <select
                  name="documentType"
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                >
                  <option value="DNI">DNI</option>
                  <option value="Carnet de Extranjería">Carnet de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1.5 font-bold flex items-center justify-between">
                  <span>Número de Documento *</span>
                  {hasPreviousDiscount && (
                    <span className="text-[10px] text-amber-400 font-bold lowercase">★ 15% descuento verificado</span>
                  )}
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  id="documentNumber"
                  required
                  maxLength={12}
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej: 47372037"
                  className={`w-full px-4 py-3 rounded-xl bg-neutral-900 border text-white placeholder-neutral-500 text-sm focus:outline-none transition backdrop-blur-md ${
                    hasPreviousDiscount
                      ? 'border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                      : 'border-neutral-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1.5 font-bold">
                  Celular / WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  id="whatsapp"
                  required
                  maxLength={10}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="9XXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1.5 font-bold">
                  Edad
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  min={12}
                  max={90}
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Ej: 28"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1.5 font-bold">
                  Talla de Polo Oficial *
                </label>
                <select
                  name="tShirtSize"
                  id="tShirtSize"
                  value={tShirtSize}
                  onChange={(e) => setTShirtSize(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition font-bold"
                >
                  <option value="S">S (Small)</option>
                  <option value="M">M (Medium)</option>
                  <option value="L">L (Large)</option>
                  <option value="XL">XL (Extra Large)</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Details */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bebas text-xl text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <CreditCard className="w-4 h-4 text-red-400" />
              <span>2. Pago y Confirmación</span>
            </h3>

            <div className="p-4 rounded-2xl bg-black border border-red-500/30 text-xs text-neutral-300 space-y-2">
              <p className="font-bold text-white flex items-center justify-between">
                <span>Canal de Pago Oficial:</span>
                <span className="text-amber-400 font-mono text-sm">Monto a Pagar: S/ {finalPrice.toFixed(2)}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <strong className="text-white block">Yape Oficial (Solo Yape):</strong>
                  <span className="text-emerald-400 font-bold text-base block font-mono">963 408 328</span>
                  <span className="text-neutral-200 font-bold">Titular: GISELA SANTA CRUZ</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <strong className="text-white block">WhatsApp de Coordinación:</strong>
                  <span className="text-red-400 font-bold text-base block font-mono">+51 902 227 356</span>
                  <span className="text-neutral-400">Solo coordinaciones y consultas de la carrera</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1.5 font-bold">
                  Método Utilizado
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value="Yape"
                    readOnly
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono font-bold text-sm cursor-not-allowed select-none shadow-inner"
                  />
                  <div className="absolute right-3.5 top-3 flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Yape</span>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block font-sans">
                  El pago oficial es solo por Yape al <strong>963 408 328</strong> a nombre de <strong>GISELA SANTA CRUZ</strong>.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1.5 font-bold flex items-center justify-between">
                  <span>N° de Operación o Ref. de Pago</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Opcional</span>
                </label>
                <input
                  type="text"
                  name="paymentReference"
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Ej: 198274 ó Constancia Yape"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block font-sans">
                  Si no tienes el código a mano, puedes dejarlo vacío o adjuntar tu captura abajo.
                </span>
              </div>
            </div>

            {/* Upload Voucher / Constancia de Pago (100% Opcional) */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-neutral-200 uppercase font-bold flex items-center gap-2">
                  <Upload className="w-4 h-4 text-red-400" />
                  <span>Adjuntar Voucher / Constancia de Pago Yape</span>
                </label>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  Opcional
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Puedes adjuntar la captura de pantalla o foto de tu constancia de Yape o enviarla por WhatsApp al <strong>+51 902 227 356</strong>. Al inscribirte aparecerás como <strong>No Verificado</strong> hasta que la organización observe tu constancia y la valide manualmente.
              </p>

              {!voucherPreview ? (
                <label className="relative border-2 border-dashed border-neutral-700 hover:border-red-500/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer bg-neutral-950/70 hover:bg-neutral-900 transition-all group shadow-inner">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition shrink-0">
                      <ImageIcon className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-red-300 transition">
                        {isCompressingVoucher ? 'Procesando comprobante...' : 'Subir captura o foto del voucher Yape'}
                      </span>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        Formatos: JPG, PNG, WEBP o PDF • Se guarda automáticamente con tu inscripción
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-bold group-hover:bg-red-600 group-hover:text-white transition shadow-sm">
                      {isCompressingVoucher ? 'Cargando...' : 'Examinar Archivo'}
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleVoucherChange}
                    disabled={isCompressingVoucher}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-3.5 rounded-2xl bg-neutral-900 border-2 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {voucherPreview.startsWith('data:image/') ? (
                      <div
                        onClick={() => setShowVoucherModal(true)}
                        className="relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0 cursor-pointer group"
                        title="Clic para ampliar voucher"
                      >
                        <img
                          src={voucherPreview}
                          alt="Voucher Yape"
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-neutral-950 border border-neutral-700 flex items-center justify-center text-red-400 shrink-0">
                        <FileText className="w-7 h-7 text-amber-400" />
                      </div>
                    )}

                    <div className="truncate">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Voucher Yape adjuntado con éxito</span>
                      </div>
                      <span className="text-xs text-white font-mono block truncate max-w-[240px]">
                        {voucherFileName || 'comprobante_yape.jpg'}
                      </span>
                      {voucherFileSize && (
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          Tamaño: {voucherFileSize}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    {voucherPreview.startsWith('data:image/') && (
                      <button
                        type="button"
                        onClick={() => setShowVoucherModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-300" />
                        <span>Ver Voucher</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-500/40 transition flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-red-400" />
                      <span>Quitar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Terms & Acceptance */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-black border border-neutral-800 hover:border-neutral-700 transition cursor-pointer">
              <input
                type="checkbox"
                name="disclaimerAccepted"
                id="disclaimerAccepted"
                required
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-neutral-700 bg-neutral-900"
              />
              <span className="text-xs text-neutral-300 leading-relaxed">
                Acepto el reglamento y deslinde de responsabilidad de <strong>SANTA RUN TARAPOTO 2026</strong>. Declaro encontrarme en condiciones físicas aptas para participar en la carrera este sábado 19 de diciembre.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-bebas text-2xl uppercase tracking-wider transition-all duration-300 transform hover:scale-[1.01] active:scale-95 shadow-xl shadow-red-600/35 font-black cursor-pointer flex items-center justify-center gap-3 border border-red-400/40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span>Procesando Inscripción...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Confirmar Inscripción Oficial · S/ {finalPrice.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Existing Runners Mi Espacio Quick Access */}
        {onOpenCompetitorLogin && (
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <span>¿Ya te inscribiste? Escanea tu QR con el personal:</span>
            <button
              onClick={onOpenCompetitorLogin}
              className="text-red-300 hover:text-white font-bold underline cursor-pointer"
            >
              Ver mi QR en Mi Espacio 🎒
            </button>
          </div>
        )}
      </div>

      {/* Modal: Fullscreen Preview of Uploaded Voucher */}
      {showVoucherModal && voucherPreview && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-red-500 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowVoucherModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-400" />
              <h4 className="font-bebas text-2xl text-white uppercase tracking-wide">
                Constancia de Pago Yape
              </h4>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-neutral-800 max-h-[70vh] flex items-center justify-center">
              <img
                src={voucherPreview}
                alt="Vista previa del comprobante"
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <span>{voucherFileName} {voucherFileSize ? `• ${voucherFileSize}` : ''}</span>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
