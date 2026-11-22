import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Phone,
  Upload,
  Camera,
  X,
  Eye,
  Loader2,
  Check,
  CreditCard,
  Heart,
} from 'lucide-react';
import { RunnerRegistration, DocumentType, Gender } from '../types/race';
import { getStoredRegistrations, saveRegistrations } from '../data/initialRegistrations';
import {
  saveRegistrationFirestore,
  fetchRegistrationsFirestore,
  mergeRegistrationsLists,
  reserveNextSantaRunNumber,
} from '../utils/checkinManager';
import {
  syncRunnerMediaViaAppsScript,
  readImageFileHighQuality,
} from '../services/googleDriveService';
import { trackEvent } from '../utils/analytics';

export type RiojaCategory = 'Kids 2K' | 'Libre 5K';

interface RiojaRegistrationFormProps {
  selectedCategory: RiojaCategory;
  onCategoryChange: (category: RiojaCategory) => void;
  onRegistrationSuccess?: (registration: RunnerRegistration) => void;
  onOpenCompetitorLogin?: () => void;
}

export const RiojaRegistrationForm: React.FC<RiojaRegistrationFormProps> = ({
  selectedCategory,
  onCategoryChange,
  onRegistrationSuccess,
  onOpenCompetitorLogin,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Mixto');
  const [email, setEmail] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Voucher upload state
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [voucherFileName, setVoucherFileName] = useState('');
  const [voucherFileSize, setVoucherFileSize] = useState('');
  const [isReadingVoucher, setIsReadingVoucher] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Personal photo upload state
  const [personalPhotoPreview, setPersonalPhotoPreview] = useState<string | null>(null);
  const [personalPhotoFileName, setPersonalPhotoFileName] = useState('');
  const [personalPhotoSize, setPersonalPhotoSize] = useState('');
  const [isReadingPhoto, setIsReadingPhoto] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState('Procesando Inscripción...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedYape, setCopiedYape] = useState(false);

  const categoryPrice = selectedCategory === 'Kids 2K' ? 25.0 : 35.0;

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(null), 7000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  const handleVoucherChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVoucherFileName(file.name);
    const sizeKb = Math.round(file.size / 1024);
    setVoucherFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
    setIsReadingVoucher(true);
    try {
      const highQualityData = await readImageFileHighQuality(file);
      setVoucherPreview(highQualityData);
    } catch {
      setErrorMessage('No se pudo leer la imagen del comprobante. Intenta con otro archivo.');
    } finally {
      setIsReadingVoucher(false);
    }
  };

  const handlePersonalPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPersonalPhotoFileName(file.name);
    const sizeKb = Math.round(file.size / 1024);
    setPersonalPhotoSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
    setIsReadingPhoto(true);
    try {
      const highQualityData = await readImageFileHighQuality(file);
      setPersonalPhotoPreview(highQualityData);
    } catch {
      setErrorMessage('No se pudo leer tu foto personal. Intenta con otra imagen.');
    } finally {
      setIsReadingPhoto(false);
    }
  };

  const handleCopyYape = () => {
    try {
      navigator.clipboard?.writeText('963408328');
      setCopiedYape(true);
      setTimeout(() => setCopiedYape(false), 2500);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Por favor ingresa nombres y apellidos completos.');
      return;
    }
    if (!documentNumber.trim() || documentNumber.trim().length < 6) {
      setErrorMessage('Ingresa un número de documento válido (DNI / CE / Pasaporte).');
      return;
    }
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 9) {
      setErrorMessage('Ingresa un número de WhatsApp de 9 dígitos para coordinar tu kit.');
      return;
    }
    if (!disclaimerAccepted) {
      setErrorMessage('Debes aceptar el deslinde de responsabilidad de Santa Run Rioja 2026.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStage('Reservando tu número oficial en Rioja...');

    try {
      const now = new Date().toISOString();
      const localStored = getStoredRegistrations();
      let cloudStored: RunnerRegistration[] = [];
      try {
        cloudStored = await Promise.race([
          fetchRegistrationsFirestore(),
          new Promise<RunnerRegistration[]>((resolve) => setTimeout(() => resolve([]), 3500)),
        ]);
      } catch {}

      const stored = mergeRegistrationsLists(localStored, cloudStored);
      // Reserva atómica independiente para Santa Run Rioja 2026 (nunca repite números ni choca con Tarapoto)
      const nextRiojaNum = await reserveNextSantaRunNumber(stored, 'santa-run-rioja-2026');
      const uniqueId = `SRR-2026-${String(nextRiojaNum).padStart(4, '0')}`;

      const newRunner: RunnerRegistration = {
        id: uniqueId,
        edition: 'santa-run-rioja-2026',
        raceCategory: selectedCategory,
        registrationNumber: nextRiojaNum,
        bibNumber: nextRiojaNum,
        createdAt: now,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        documentType,
        documentNumber: documentNumber.trim(),
        whatsapp: whatsapp.trim(),
        age: Number(age) || (selectedCategory === 'Kids 2K' ? 10 : 25),
        gender,
        email: email.trim(),
        department: 'San Martín',
        city: 'Rioja',
        district: 'Rioja',
        runningClub: 'Sacha Runners / Ohana Go',
        emergencyContactName: '',
        emergencyContactPhone: '',
        willWearCostume: false,
        paymentMethod: 'Yape',
        paymentReference: paymentReference.trim() || `YAPE-RIOJA-${Date.now().toString().slice(-4)}`,
        amountPaid: categoryPrice,
        hasPreviousDiscount: false,
        paymentStatus: 'No Verificado',
        disclaimerAccepted: true,
        modality: 'Presencial',
        confirmedAtStart: false,
        finishedAtMeta: false,
        medalDelivered: false,
      };

      // 1. Fotos y constancias van EXCLUSIVAMENTE a Google Drive (jamás a Firestore)
      if (voucherPreview || personalPhotoPreview) {
        setSubmitStage('Subiendo fotos directo a Google Drive...');
        try {
          const driveFields = await Promise.race([
            syncRunnerMediaViaAppsScript({
              ...newRunner,
              voucherUrl: voucherPreview || undefined,
              personalPhotoUrl: personalPhotoPreview || undefined,
            }),
            new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('DRIVE_TIMEOUT')), 18000)
            ),
          ]);

          if (driveFields) {
            if (driveFields.driveVoucherFileId) {
              newRunner.driveVoucherFileId = driveFields.driveVoucherFileId;
              newRunner.driveVoucherUrl = driveFields.driveVoucherUrl;
            }
            if (driveFields.drivePhotoFileId) {
              newRunner.drivePhotoFileId = driveFields.drivePhotoFileId;
              newRunner.drivePhotoUrl = driveFields.drivePhotoUrl;
            }
          }
        } catch {
          // Si falló la red hacia Drive, igual guardamos los datos escritos en Firestore sin bloquear al participante
        }
      }

      setSubmitStage('Guardando tu inscripción oficial...');
      let finalRecord: RunnerRegistration = newRunner;

      // 2. Endpoint backend con timeout estricto de 2s (Hostinger estático sigue a Firestore)
      const apiController = new AbortController();
      const apiTimeout = setTimeout(() => apiController.abort(), 2000);
      try {
        const res = await fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRunner),
          signal: apiController.signal,
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const savedRecord = await res.json();
          if (savedRecord && savedRecord.id) {
            finalRecord = savedRecord;
          }
        }
      } catch {
        // Static Hostinger hosting: Firestore + localStorage sync handles persistence
      } finally {
        clearTimeout(apiTimeout);
      }

      const updatedList = [finalRecord, ...stored.filter((r) => r.id !== finalRecord.id)];
      saveRegistrations(updatedList);
      try {
        localStorage.setItem('ohana_active_competitor', JSON.stringify(finalRecord));
      } catch {}

      // 3. Guardar SOLO datos escritos en orden en Cloud Firestore (0 fotos en la BD)
      await Promise.race([
        saveRegistrationFirestore(finalRecord),
        new Promise<void>((resolve) => setTimeout(resolve, 8000)),
      ]);

      trackEvent({
        type: 'runner_login',
        runner: finalRecord,
        title: `Nueva Inscripción Rioja (${selectedCategory})`,
        description: `${finalRecord.firstName} ${finalRecord.lastName} (${finalRecord.documentNumber}) · ${selectedCategory}`,
      });

      // Reset form cleanly
      setFirstName('');
      setLastName('');
      setDocumentNumber('');
      setWhatsapp('');
      setAge('');
      setEmail('');
      setPaymentReference('');
      setVoucherPreview(null);
      setVoucherFileName('');
      setVoucherFileSize('');
      setPersonalPhotoPreview(null);
      setPersonalPhotoFileName('');
      setPersonalPhotoSize('');
      setDisclaimerAccepted(false);

      if (onRegistrationSuccess) {
        onRegistrationSuccess(finalRecord);
      }
    } catch (err) {
      console.error('Error registrando en Rioja:', err);
      setErrorMessage('Ocurrió un inconveniente al registrar tu solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="inscripcion-rioja"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#080808]"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-mono font-bold uppercase tracking-[0.26em] text-amber-400">
            Inscripción Oficial en Línea · Rioja 2026
          </p>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white uppercase tracking-wide mt-2 leading-none">
            INSCRÍBETE A <span className="text-red-500">SANTA RUN RIOJA</span>
          </h2>
          <p className="text-sm text-neutral-300 mt-3 max-w-xl mx-auto">
            Elige tu categoría, completa tus datos y adjunta tu constancia de Yape. Tu solicitud se sincroniza en vivo con el equipo de OHANA GO y Sacha Runners.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-950 border border-white/15 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8"
        >
          {/* Step 1: Category Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">
              1. Elige tu Categoría Oficial *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              <button
                type="button"
                onClick={() => onCategoryChange('Kids 2K')}
                className={`p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                  selectedCategory === 'Kids 2K'
                    ? 'bg-red-950/40 border-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-black border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Categoría Infantil
                    </span>
                    <h3 className="font-bebas text-3xl text-white uppercase tracking-wide mt-0.5 leading-none">
                      KIDS 2K
                    </h3>
                  </div>
                  <span className="font-bebas text-3xl text-amber-400 tabular-nums whitespace-nowrap shrink-0">
                    S/ 25.00
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                  Incluye medalla finisher, gorra navideña, hidratación, panetón, chocolate, pulsera y acceso al show infantil.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onCategoryChange('Libre 5K')}
                className={`p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                  selectedCategory === 'Libre 5K'
                    ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-600/15'
                    : 'bg-black border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold">
                      Categoría General
                    </span>
                    <h3 className="font-bebas text-3xl text-white uppercase tracking-wide mt-0.5 leading-none">
                      LIBRE 5K
                    </h3>
                  </div>
                  <span className="font-bebas text-3xl text-white tabular-nums whitespace-nowrap shrink-0">
                    S/ 35.00
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                  Incluye medalla finisher, gorra navideña, hidratación, panetón, chocolate, pulsera y show infantil familiar.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Participant Data */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">
                2. Datos del Participante
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Nombres *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej: Valeria Sofía"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej: Pérez Vásquez"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Documento *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="DNI">DNI</option>
                  <option value="Carnet de Extranjería">Carnet de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  N° Documento *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={12}
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value.trim())}
                  placeholder="8 dígitos"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={12}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="999 000 000"
                    className="w-full bg-black border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Edad *
                </label>
                <input
                  type="number"
                  required
                  min={3}
                  max={95}
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={selectedCategory === 'Kids 2K' ? 'Ej: 9' : 'Ej: 26'}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Género
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="Mixto">Prefiero no indicar</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Correo (Opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Personal Photo (Optional, straight to Drive) */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">
                  3. Foto del Participante para Marco Oficial (Opcional)
                </span>
              </div>
            </div>

            {personalPhotoPreview ? (
              <div className="p-3.5 rounded-2xl bg-black border border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={personalPhotoPreview}
                    alt="Vista previa foto personal"
                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <p className="text-xs font-bold text-amber-300">Foto lista para Google Drive</p>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      {personalPhotoFileName} · {personalPhotoSize}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPersonalPhotoPreview(null);
                      setPersonalPhotoFileName('');
                      setPersonalPhotoSize('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Quitar
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-5 rounded-2xl border border-dashed border-neutral-700 hover:border-amber-400/70 bg-black/60 cursor-pointer transition text-center">
                <Camera className="w-6 h-6 text-amber-400 mb-1.5" />
                <span className="text-xs font-bold text-white">
                  {isReadingPhoto ? 'Procesando foto...' : 'Seleccionar foto personal (se guarda directo en Drive)'}
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5">JPG, PNG o WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePersonalPhotoChange}
                  disabled={isReadingPhoto}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Step 4: Payment via Yape + Voucher Upload */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">
                4. Pago Yape y Comprobante
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-black border border-emerald-500/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Yape Oficial OHANA GO · Santa Run Rioja
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
                    963 408 328
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyYape}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold cursor-pointer hover:bg-emerald-900 transition"
                  >
                    {copiedYape ? '✓ Copiado' : 'Copiar N°'}
                  </button>
                </div>
                <p className="text-xs text-neutral-400">
                  Titular: <strong className="text-neutral-200">Gisela Santa Cruz</strong> · Consultas WhatsApp:{' '}
                  <strong className="text-neutral-200 font-mono">+51 902 227 356</strong>
                </p>
              </div>

              <div className="bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-left sm:text-right shrink-0 w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Monto {selectedCategory}
                </span>
                <span className="font-bebas text-4xl text-amber-400 tabular-nums leading-none">
                  S/ {categoryPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  N° Operación / Referencia Yape (Opcional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Ej: 482910 o nombre del titular"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Adjuntar Voucher Yape (Opcional)
                </label>
                {voucherPreview ? (
                  <div className="px-3.5 py-2 rounded-xl bg-black border border-emerald-500/50 flex items-center justify-between gap-2 h-[46px]">
                    <span className="text-xs font-bold text-emerald-300 truncate">
                      ✓ {voucherFileName} ({voucherFileSize})
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowVoucherModal(true)}
                        className="p-1.5 rounded-lg bg-neutral-900 text-neutral-200 hover:text-white cursor-pointer"
                        title="Ver voucher"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVoucherPreview(null);
                          setVoucherFileName('');
                          setVoucherFileSize('');
                        }}
                        className="p-1.5 rounded-lg bg-red-950/70 text-red-200 hover:bg-red-900 cursor-pointer"
                        title="Quitar voucher"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-4 h-[46px] rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-black cursor-pointer transition text-xs font-bold text-emerald-300">
                    <Upload className="w-4 h-4" />
                    <span>{isReadingVoucher ? 'Leyendo voucher...' : 'Subir captura de Yape'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleVoucherChange}
                      disabled={isReadingVoucher}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Al inscribirte aparecerás como <strong className="text-amber-300">No Verificado</strong> hasta que la organización revise tu comprobante en Drive o WhatsApp (+51 902 227 356) y valide tu inscripción manualmente.
            </p>
          </div>

          {/* Disclaimer */}
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-black border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-red-600 shrink-0"
            />
            <span className="text-xs text-neutral-300 leading-relaxed">
              Acepto el reglamento y deslinde de responsabilidad de{' '}
              <strong className="text-white">SANTA RUN RIOJA 2026</strong> (OHANA GO & Sacha Runners). Declaro que el participante se encuentra en condiciones físicas aptas para el recorrido del domingo 20 de diciembre.
            </span>
          </label>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bebas text-2xl sm:text-3xl tracking-wider uppercase transition shadow-xl shadow-red-600/25 flex items-center justify-center gap-3 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{submitStage}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>
                  Confirmar Inscripción · {selectedCategory} (S/ {categoryPrice.toFixed(2)})
                </span>
              </>
            )}
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span>Corre y regala Sonrisas · Rioja 2026</span>
            </span>
            {onOpenCompetitorLogin && (
              <button
                type="button"
                onClick={onOpenCompetitorLogin}
                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
              >
                ¿Ya te inscribiste? Ver mi pase en Mi Espacio
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Voucher Preview Modal */}
      {showVoucherModal && voucherPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-neutral-950 border border-emerald-500/50 rounded-3xl p-5">
            <button
              type="button"
              onClick={() => setShowVoucherModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-neutral-900 text-neutral-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-bebas text-2xl text-white uppercase mb-3">Comprobante Yape Adjuntado</h4>
            <img
              src={voucherPreview}
              alt="Vista previa voucher Yape"
              className="w-full max-h-[65vh] object-contain rounded-xl bg-black"
            />
          </div>
        </div>
      )}

      {/* Personal Photo Preview Modal */}
      {showPhotoModal && personalPhotoPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-neutral-950 border border-amber-500/50 rounded-3xl p-5">
            <button
              type="button"
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-neutral-900 text-neutral-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-bebas text-2xl text-white uppercase mb-3">Tu Foto Personal</h4>
            <img
              src={personalPhotoPreview}
              alt="Vista previa foto personal"
              className="w-full max-h-[65vh] object-contain rounded-xl bg-black"
            />
          </div>
        </div>
      )}
    </section>
  );
};
