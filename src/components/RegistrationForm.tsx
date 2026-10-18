import React, { useState } from 'react';
import { RunnerRegistration, DocumentType, Gender, PaymentMethod } from '../types/race';
import { 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  X,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationFormProps {
  onRegistrationSuccess: (registration: RunnerRegistration) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegistrationSuccess }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentType: 'DNI' as DocumentType,
    documentNumber: '',
    email: '',
    whatsapp: '',
    age: '',
    gender: 'Masculino' as Gender,
    city: 'Tarapoto',
    district: 'Tarapoto Cercado',
    runningClub: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodType: '',
    medicalConditions: '',
    willWearCostume: false,
    costumeName: '',
    paymentMethod: 'Yape' as PaymentMethod,
    paymentReference: '',
    paymentProofImage: '',
    disclaimerAccepted: false,
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, paymentProofImage: 'La imagen no debe superar los 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, paymentProofImage: reader.result as string }));
        setErrors(prev => {
          const rest = { ...prev };
          delete rest.paymentProofImage;
          return rest;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Ingresa tus nombres';
    if (!formData.lastName.trim()) newErrors.lastName = 'Ingresa tus apellidos';
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'Ingresa tu documento';
    } else if (formData.documentType === 'DNI' && !/^\d{8}$/.test(formData.documentNumber.trim())) {
      newErrors.documentNumber = 'El DNI debe tener 8 dígitos numéricos';
    }
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Ingresa tu celular WhatsApp';
    } else if (!/^\d{9}$/.test(formData.whatsapp.replace(/\D/g, ''))) {
      newErrors.whatsapp = 'Debe ser un número válido de 9 dígitos';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    const ageNum = parseInt(formData.age, 10);
    if (!formData.age || isNaN(ageNum) || ageNum < 12 || ageNum > 90) {
      newErrors.age = 'Ingresa una edad válida (12 a 90 años)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Indica un contacto de emergencia';
    }
    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Teléfono del contacto de emergencia';
    }
    if (formData.willWearCostume && !formData.costumeName.trim()) {
      newErrors.costumeName = 'Cuéntanos brevemente tu disfraz para el concurso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.paymentMethod !== 'Efectivo / Presencial' && !formData.paymentReference.trim()) {
      newErrors.paymentReference = 'Ingresa el número de operación o referencia del pago';
    }
    if (!formData.disclaimerAccepted) {
      newErrors.disclaimerAccepted = 'Debes aceptar los términos y deslinde de salud para participar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: document.getElementById('formulario-registro')?.offsetTop || 0, behavior: 'smooth' });
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: document.getElementById('formulario-registro')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#a3e635', '#f97316', '#a855f7', '#ffffff']
        });
      } catch (err) {
        console.error(err);
      }

      const registrationData: Omit<RunnerRegistration, 'id' | 'registrationNumber' | 'bibNumber' | 'createdAt'> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        documentType: formData.documentType,
        documentNumber: formData.documentNumber.trim(),
        email: formData.email.trim().toLowerCase(),
        whatsapp: formData.whatsapp.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        city: formData.city.trim(),
        district: formData.district.trim(),
        runningClub: formData.runningClub.trim() || 'Independiente',
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        bloodType: formData.bloodType.trim(),
        medicalConditions: formData.medicalConditions.trim(),
        willWearCostume: formData.willWearCostume,
        costumeName: formData.costumeName.trim(),
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference.trim() || 'PAGO-PRESENCIAL',
        paymentProofImage: formData.paymentProofImage,
        paymentStatus: formData.paymentMethod === 'Efectivo / Presencial' ? 'Pendiente de Verificación' : 'Verificado',
        disclaimerAccepted: formData.disclaimerAccepted,
      };

      // Import addRegistration dynamically or pass to parent
      import('../data/initialRegistrations').then(({ addRegistration }) => {
        const saved = addRegistration(registrationData);
        setIsSubmitting(false);
        onRegistrationSuccess(saved);
      });
    }, 800);
  };

  return (
    <section id="formulario-registro" className="pt-4 pb-3 px-4 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Inscripciones Oficiales Abiertas
        </div>
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider uppercase">
          Formulario de <span className="text-lime-400 text-glow-lime">Inscripción</span>
        </h2>
        <p className="text-neutral-400 text-sm md:text-base mt-1">
          Completa tus datos en 3 sencillos pasos y obtén tu <strong>Pase Oficial de Inscripción</strong> al instante.
        </p>
      </div>

      {/* Steps Breadcrumb */}
      <div className="flex items-center justify-between mb-5 px-2 max-w-xl mx-auto">
        <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 1 ? 'text-lime-400' : 'text-neutral-600'}`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bebas text-xl border transition-all ${
            currentStep >= 1 ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.4)]' : 'bg-neutral-900 text-neutral-500 border-neutral-800'
          }`}>
            1
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Datos Runner</span>
        </div>

        <div className={`h-1 flex-1 mx-3 rounded-full transition-all ${currentStep >= 2 ? 'bg-lime-400' : 'bg-neutral-800'}`} />

        <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 2 ? 'text-lime-400' : 'text-neutral-600'}`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bebas text-xl border transition-all ${
            currentStep >= 2 ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.4)]' : 'bg-neutral-900 text-neutral-500 border-neutral-800'
          }`}>
            2
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Seguridad & Disfraz</span>
        </div>

        <div className={`h-1 flex-1 mx-3 rounded-full transition-all ${currentStep >= 3 ? 'bg-lime-400' : 'bg-neutral-800'}`} />

        <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 3 ? 'text-lime-400' : 'text-neutral-600'}`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bebas text-xl border transition-all ${
            currentStep >= 3 ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.4)]' : 'bg-neutral-900 text-neutral-500 border-neutral-800'
          }`}>
            3
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Pago S/ 50</span>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative">
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: DATOS PERSONALES */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <User className="w-5 h-5 text-lime-400" />
                <h3 className="font-bebas text-2xl text-white tracking-wide uppercase">
                  Paso 1: Información del Corredor / Corredora
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Documento */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Tipo de Documento *
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                  >
                    <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                    <option value="Carnet de Extranjería">Carnet de Extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>

                {/* Número de Documento */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    maxLength={formData.documentType === 'DNI' ? 8 : 15}
                    placeholder={formData.documentType === 'DNI' ? '8 dígitos (Ej: 72849102)' : 'Número de documento'}
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value.replace(/\s/g, '') })}
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                      errors.documentNumber ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                    }`}
                  />
                  {errors.documentNumber && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.documentNumber}
                    </p>
                  )}
                </div>

                {/* Nombres */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    placeholder="Tus nombres completos"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                      errors.firstName ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Apellidos */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    placeholder="Tus apellidos completos"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                      errors.lastName ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.lastName}
                    </p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
                    <span>Celular WhatsApp (Perú) *</span>
                    <span className="text-[10px] text-lime-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Envío de pase oficial
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-xs font-bold text-neutral-500 select-none">
                      +51
                    </span>
                    <input
                      type="tel"
                      maxLength={9}
                      placeholder="9XXXXXXXX"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                      className={`w-full bg-neutral-950 border pl-12 pr-4 py-3 rounded-xl text-white text-sm focus:outline-none transition ${
                        errors.whatsapp ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                      }`}
                    />
                  </div>
                  {errors.whatsapp && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.whatsapp}
                    </p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    placeholder="tu.correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                      errors.email ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Edad & Género */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Edad (Años) *
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={95}
                    placeholder="Ej: 26"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                      errors.age ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                    }`}
                  />
                  {errors.age && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.age}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Género *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Prefiero no especificar</option>
                  </select>
                </div>

                {/* Ciudad / Distrito */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Distrito / Ciudad *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                  >
                    <option value="Tarapoto Cercado">Tarapoto Cercado</option>
                    <option value="Morales">Morales</option>
                    <option value="Banda de Shilcayo">Banda de Shilcayo</option>
                    <option value="Lamas">Lamas</option>
                    <option value="Juanjuí / Bellavista">Juanjuí / Bellavista</option>
                    <option value="Moyobamba">Moyobamba</option>
                    <option value="Otra Ciudad">Otra Ciudad (Turista / Visitante)</option>
                  </select>
                </div>

                {/* Running Club */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    ¿Perteneces a un Running Club o Team? (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Ohana Go, Selva Runners, o déjalo Libre"
                    value={formData.runningClub}
                    onChange={(e) => setFormData({ ...formData, runningClub: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>

              {/* Botón Siguiente */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-lime-400/20 flex items-center gap-2 cursor-pointer"
                >
                  Continuar al Paso 2
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SEGURIDAD & DISFRAZ */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-lime-400" />
                <h3 className="font-bebas text-2xl text-white tracking-wide uppercase">
                  Paso 2: Seguridad Médica & Concurso de Disfraz
                </h3>
              </div>

              {/* Concurso de Disfraz */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-neutral-900 border border-purple-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bebas text-lg text-white uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      ¿Participarás en el Concurso de Disfraz de Halloween?
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      ¡Habrá premios en efectivo y regalos de auspiciadores para los mejores disfraces en la meta de Entre Jarras!
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="costumeCheckbox"
                    checked={formData.willWearCostume}
                    onChange={(e) => setFormData({ ...formData, willWearCostume: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-700 text-lime-400 focus:ring-lime-400 accent-lime-400 cursor-pointer mt-1"
                  />
                </div>

                {formData.willWearCostume && (
                  <div className="mt-3 pt-3 border-t border-neutral-800">
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
                      ¿Cuál será tu temática o idea de disfraz? *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Calavera Neón, Bruja Veloz, Gladiador, Vampiro..."
                      value={formData.costumeName}
                      onChange={(e) => setFormData({ ...formData, costumeName: e.target.value })}
                      className={`w-full bg-neutral-950 border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition ${
                        errors.costumeName ? 'border-red-500' : 'border-purple-500/50 focus:border-purple-400'
                      }`}
                    />
                    {errors.costumeName && (
                      <p className="text-red-400 text-xs mt-1">{errors.costumeName}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Contacto de Emergencia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Nombre del Contacto de Emergencia *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: María Pérez (Familiar)"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                      errors.emergencyContactName ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                    }`}
                  />
                  {errors.emergencyContactName && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.emergencyContactName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Teléfono del Contacto de Emergencia *
                  </label>
                  <input
                    type="tel"
                    placeholder="9XXXXXXXX"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                      errors.emergencyContactPhone ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                    }`}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.emergencyContactPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Grupo Sanguíneo (Opcional)
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                  >
                    <option value="">No conozco / Prefiero omitir</option>
                    <option value="O+">O Positivo (O+)</option>
                    <option value="O-">O Negativo (O-)</option>
                    <option value="A+">A Positivo (A+)</option>
                    <option value="A-">A Negativo (A-)</option>
                    <option value="B+">B Positivo (B+)</option>
                    <option value="AB+">AB Positivo (AB+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Alergias o Condiciones Médicas (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Asma leve, alergia a penicilina, ninguna..."
                    value={formData.medicalConditions}
                    onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>

              {/* Botones de navegación */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bebas text-lg uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Paso 1
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-lime-400/20 flex items-center gap-2 cursor-pointer"
                >
                  Continuar al Pago
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAGO S/ 50 Y CONFIRMACIÓN */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <CreditCard className="w-5 h-5 text-lime-400" />
                <h3 className="font-bebas text-2xl text-white tracking-wide uppercase">
                  Paso 3: Pago de Inscripción (S/ 50.00)
                </h3>
              </div>

              {/* Price summary ribbon */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/20 via-neutral-900 to-lime-500/10 border border-orange-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Total a Pagar</span>
                  <div className="font-bebas text-3xl sm:text-4xl text-white">
                    S/ <span className="text-lime-400 text-glow-lime">50.00</span>
                  </div>
                  <span className="text-xs text-neutral-300">Incluye Medalla Finisher + Hidratación + Neón + Sorteos</span>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-lime-400 text-black">
                    Cupo 5K Asegurado
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Selecciona tu Forma de Pago *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Yape', 'Plin', 'Transferencia BCP', 'Efectivo / Presencial'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method })}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        formData.paymentMethod === method
                          ? 'bg-neutral-800 border-lime-400 text-lime-400 font-bold shadow-[0_0_15px_rgba(163,230,53,0.2)]'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="font-bebas text-lg leading-none">{method}</span>
                      <span className="text-[10px] uppercase opacity-75">
                        {method === 'Yape' ? 'Inmediato' : method === 'Plin' ? 'Cero Comisión' : method === 'Transferencia BCP' ? 'Banco BCP' : 'En la Entrega'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment instructions based on selected method */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                {formData.paymentMethod === 'Yape' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
                        Instrucciones de Yape
                      </span>
                      <span className="text-xs text-neutral-400">Titular: OHANA GO RUNNING / TARAPOTO</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <div>
                        <span className="text-xs text-neutral-400 block">Número de Yape:</span>
                        <span className="font-mono text-xl text-white font-bold tracking-wider">
                          942 851 234
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('942851234', 'yape')}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-lime-400 text-xs font-bold rounded-lg border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedKey === 'yape' ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'yape' ? '¡Copiado!' : 'Copiar Número'}
                      </button>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'Plin' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                        Instrucciones de Plin
                      </span>
                      <span className="text-xs text-neutral-400">Titular: OHANA GO / TARAPOTO</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <div>
                        <span className="text-xs text-neutral-400 block">Número de Plin:</span>
                        <span className="font-mono text-xl text-white font-bold tracking-wider">
                          942 851 234
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('942851234', 'plin')}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 text-xs font-bold rounded-lg border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedKey === 'plin' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'plin' ? '¡Copiado!' : 'Copiar Número'}
                      </button>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'Transferencia BCP' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-orange-400 tracking-wider">
                        Cuenta Ahorros Soles BCP
                      </span>
                      <span className="text-xs text-neutral-400">OHANA GO TARAPOTO</span>
                    </div>

                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase block">N° Cuenta BCP:</span>
                          <span className="font-mono text-sm text-white font-bold">550-98214300-0-12</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('55098214300012', 'bcp-cta')}
                          className="px-2.5 py-1 bg-neutral-800 text-xs text-orange-400 rounded border border-neutral-700 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'bcp-cta' ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-800 pt-2">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase block">CCI (Interbancario):</span>
                          <span className="font-mono text-xs text-neutral-300">002-550-00982143000012-20</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('0025500098214300001220', 'bcp-cci')}
                          className="px-2.5 py-1 bg-neutral-800 text-xs text-orange-400 rounded border border-neutral-700 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'bcp-cci' ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'Efectivo / Presencial' && (
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      💡 <strong>Pago Presencial:</strong> Tu inscripción quedará pre-registrada. Podrás abonar tus <strong>S/ 50</strong> en efectivo al presentarte antes de la largada en Plaza de Armas o en Entre Jarras.
                    </p>
                  </div>
                )}

                {/* Código de Operación */}
                {formData.paymentMethod !== 'Efectivo / Presencial' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Número de Operación / Código de Referencia *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 819203 o YAP-092817"
                      value={formData.paymentReference}
                      onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                      className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                        errors.paymentReference ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                      }`}
                    />
                    {errors.paymentReference && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.paymentReference}
                      </p>
                    )}
                  </div>
                )}

                {/* Subida de Voucher de Pago */}
                {formData.paymentMethod !== 'Efectivo / Presencial' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Adjuntar Captura del Comprobante (Opcional pero acelera la validación)
                    </label>

                    {formData.paymentProofImage ? (
                      <div className="relative p-2 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={formData.paymentProofImage}
                            alt="Comprobante"
                            className="w-16 h-16 object-cover rounded-xl border border-neutral-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-lime-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Voucher cargado
                            </span>
                            <span className="text-[10px] text-neutral-400 block mt-0.5">Listo para revisión</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentProofImage: '' })}
                          className="p-2 bg-neutral-800 hover:bg-red-900/60 text-neutral-400 hover:text-red-300 rounded-xl transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-800 hover:border-lime-400/60 rounded-2xl bg-neutral-900/60 cursor-pointer transition">
                        <Upload className="w-8 h-8 text-neutral-500 mb-2" />
                        <span className="text-xs font-bold text-neutral-300">
                          Haz clic para subir captura de pantalla de tu pago
                        </span>
                        <span className="text-[10px] text-neutral-500 mt-1">PNG, JPG hasta 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Deslinde de Responsabilidad & Términos */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.disclaimerAccepted}
                    onChange={(e) => setFormData({ ...formData, disclaimerAccepted: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-700 text-lime-400 focus:ring-lime-400 accent-lime-400 cursor-pointer mt-0.5"
                  />
                  <div className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-white font-semibold block mb-0.5">
                      Declaración de Buena Salud y Deslinde Deportivo *
                    </span>
                    Declaro estar en condiciones físicas óptimas para participar en la corrida nocturna 5K, asumo mi propia responsabilidad y acepto el reglamento de seguridad de Ohana Go 2026.
                  </div>
                </label>
                {errors.disclaimerAccepted && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.disclaimerAccepted}
                  </p>
                )}
              </div>

              {/* Botones de Envío */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bebas text-lg uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Paso 2
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-gradient-to-r from-lime-400 via-lime-500 to-lime-400 hover:from-lime-300 hover:to-lime-400 text-black font-bebas text-2xl uppercase tracking-wider rounded-xl transition shadow-xl shadow-lime-400/30 flex items-center gap-2 cursor-pointer glow-neon-lime disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>Generando Pase Oficial...</>
                  ) : (
                    <>
                      <HeartHandshake className="w-6 h-6" />
                      ¡Confirmar Inscripción & Obtener Pase Oficial!
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </section>
  );
};
