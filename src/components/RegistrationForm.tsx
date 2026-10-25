import React, { useState } from 'react';
import { RunnerRegistration, DocumentType, Gender, PaymentMethod, RaceModality } from '../types/race';
import { 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  X,
  MapPin,
  Globe,
  Truck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationFormProps {
  onRegistrationSuccess: (registration: RunnerRegistration) => void;
}

const DEPARTMENTS_PERU = [
  'San Martín',
  'Lima',
  'Loreto',
  'Ucayali',
  'Amazonas',
  'La Libertad',
  'Lambayeque',
  'Piura',
  'Cajamarca',
  'Arequipa',
  'Cusco',
  'Junín',
  'Áncash',
  'Ica',
  'Huánuco',
  'Puno',
  'Tacna',
  'Otro Departamento / Extranjero'
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegistrationSuccess }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    modality: 'Presencial' as RaceModality,
    firstName: '',
    lastName: '',
    documentType: 'DNI' as DocumentType,
    documentNumber: '',
    email: '',
    whatsapp: '',
    age: '',
    gender: 'Masculino' as Gender,
    department: 'San Martín',
    city: 'Tarapoto',
    district: 'Tarapoto',
    shippingAddress: '',
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
      newErrors.documentNumber = 'El DNI debe tener 8 dígitos';
    }
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Ingresa tu celular WhatsApp';
    } else if (!/^\d{9}$/.test(formData.whatsapp.replace(/\D/g, ''))) {
      newErrors.whatsapp = 'Debe tener 9 dígitos';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    const ageNum = parseInt(formData.age, 10);
    if (!formData.age || isNaN(ageNum) || ageNum < 12 || ageNum > 90) {
      newErrors.age = 'Edad entre 12 y 90 años';
    }
    if (!formData.department.trim()) newErrors.department = 'Indica el departamento';
    if (!formData.city.trim()) newErrors.city = 'Indica tu ciudad o provincia';
    if (!formData.district.trim()) newErrors.district = 'Indica tu distrito';
    if (formData.modality === 'Virtual' && !formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Ingresa la dirección o agencia para enviar tu medalla y kit';
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
      newErrors.costumeName = 'Indica tu temática de disfraz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.paymentMethod !== 'Efectivo / Presencial' && !formData.paymentReference.trim()) {
      newErrors.paymentReference = 'Ingresa el número de operación o referencia';
    }
    if (!formData.disclaimerAccepted) {
      newErrors.disclaimerAccepted = 'Debes aceptar los términos y deslinde de salud';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a3e635', '#f97316', '#a855f7', '#ffffff']
      });
    } catch (err) {}

    const registrationData: Omit<RunnerRegistration, 'id' | 'registrationNumber' | 'createdAt'> = {
      modality: formData.modality,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      documentType: formData.documentType,
      documentNumber: formData.documentNumber.trim(),
      email: formData.email.trim().toLowerCase(),
      whatsapp: formData.whatsapp.trim(),
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      department: formData.department.trim(),
      city: formData.city.trim(),
      district: formData.district.trim(),
      shippingAddress: formData.shippingAddress.trim(),
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

    const { addRegistration } = await import('../data/initialRegistrations');
    const saved = await addRegistration(registrationData);
    setIsSubmitting(false);
    onRegistrationSuccess(saved);
  };

  return (
    <section id="formulario-registro" className="pt-4 pb-6 px-4 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider uppercase">
          Formulario de <span className="text-lime-400 text-glow-lime">Inscripción</span>
        </h2>
        <p className="text-neutral-400 text-sm md:text-base mt-1">
          Completa tus datos en 3 sencillos pasos y obtén tu <strong>Pase Oficial de Participante</strong> al instante.
        </p>
      </div>

      {/* Steps Breadcrumb */}
      <div className="flex items-center justify-between mb-6 px-2 max-w-xl mx-auto">
        <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 1 ? 'text-lime-400' : 'text-neutral-600'}`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bebas text-xl border transition-all ${
            currentStep >= 1 ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.4)]' : 'bg-neutral-900 text-neutral-500 border-neutral-800'
          }`}>
            1
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Datos & Modalidad</span>
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
          
          {/* STEP 1: MODALIDAD & DATOS PERSONALES */}
          {currentStep === 1 && (
            <div className="space-y-6">
              
              {/* MODALITY SELECTOR: Presencial vs Virtual */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Selecciona tu Modalidad de Participación *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Presencial Option */}
                  <div
                    onClick={() => setFormData({ ...formData, modality: 'Presencial' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.modality === 'Presencial'
                        ? 'bg-gradient-to-br from-lime-950/60 to-neutral-900 border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.2)]'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-5 h-5 ${formData.modality === 'Presencial' ? 'text-lime-400' : 'text-neutral-400'}`} />
                        <span className="font-bebas text-xl text-white tracking-wide uppercase">
                          Presencial en Tarapoto
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="modality"
                        checked={formData.modality === 'Presencial'}
                        onChange={() => setFormData({ ...formData, modality: 'Presencial' })}
                        className="accent-lime-400 w-4 h-4"
                      />
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Largada en vivo el <strong>31 de Octubre a las 7:00 PM</strong> en la Plaza de Armas de Tarapoto hasta Entre Jarras. Recorrido nocturno 5K, hidratación, neón y entrega de Medalla Finisher al cruzar la meta.
                    </p>
                  </div>

                  {/* Virtual Option */}
                  <div
                    onClick={() => setFormData({ ...formData, modality: 'Virtual' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.modality === 'Virtual'
                        ? 'bg-gradient-to-br from-purple-950/60 to-neutral-900 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className={`w-5 h-5 ${formData.modality === 'Virtual' ? 'text-purple-400' : 'text-neutral-400'}`} />
                        <span className="font-bebas text-xl text-white tracking-wide uppercase">
                          Virtual (Nacional / Internacional)
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="modality"
                        checked={formData.modality === 'Virtual'}
                        onChange={() => setFormData({ ...formData, modality: 'Virtual' })}
                        className="accent-purple-400 w-4 h-4"
                      />
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Corre tus 5K desde cualquier ciudad del <strong>28 de Oct al 2 de Nov</strong> con tu app favorita (Strava, Nike, Garmin). Sube tu evidencia en el portal y te enviamos tu Medalla Finisher física y kit oficial a domicilio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Title Header */}
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 pt-2">
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Celular WhatsApp *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-xs font-bold text-neutral-500 select-none">
                      +51
                    </span>
                    <input
                      type="tel"
                      maxLength={9}
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
              </div>

              {/* UBICACIÓN: DEPARTAMENTO, CIUDAD Y DISTRITO */}
              <div className="pt-2 border-t border-neutral-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-lime-400" />
                  Ubicación del Participante
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Departamento */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Departamento *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                    >
                      {DEPARTMENTS_PERU.map((dep) => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-red-400 text-xs mt-1">{errors.department}</p>
                    )}
                  </div>

                  {/* Ciudad / Provincia */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Ciudad / Provincia *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                        errors.city ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* Distrito */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Distrito *
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                        errors.district ? 'border-red-500' : 'border-neutral-800 focus:border-lime-400'
                      }`}
                    />
                    {errors.district && (
                      <p className="text-red-400 text-xs mt-1">{errors.district}</p>
                    )}
                  </div>
                </div>

                {/* Si es Modalidad Virtual: Dirección para envío de medalla */}
                {formData.modality === 'Virtual' && (
                  <div className="mt-4 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40">
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-purple-400" />
                      Dirección de Envío o Agencia de Destino (Para Medalla Física y Kit) *
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      placeholder="Ej: Av. Principal 123 o Agencia Olva Courier / Shalom de tu ciudad"
                      className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
                        errors.shippingAddress ? 'border-red-500' : 'border-purple-500/50 focus:border-purple-400'
                      }`}
                    />
                    {errors.shippingAddress && (
                      <p className="text-red-400 text-xs mt-1">{errors.shippingAddress}</p>
                    )}
                  </div>
                )}

                {/* Running Club */}
                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Running Club o Team (Opcional)
                  </label>
                  <input
                    type="text"
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
                  Continuar Inscripción
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
                      ¡Habrá premios en efectivo y regalos de aliados estratégicos para los mejores disfraces!
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
                      Temática o idea de tu disfraz *
                    </label>
                    <input
                      type="text"
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
                    maxLength={9}
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
                    <option value="">No conozco / Omitir</option>
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
                    Condiciones Médicas o Alergias (Opcional)
                  </label>
                  <input
                    type="text"
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
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 uppercase font-semibold block">Total a Pagar</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bebas text-4xl text-lime-400">S/ 50.00</span>
                    <span className="text-xs text-neutral-400 font-medium">PEN</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Modalidad: <strong>{formData.modality}</strong> • Incluye Medalla Finisher física y kit
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-lime-400/10 border border-lime-400/30 px-3 py-1.5 rounded-xl text-xs text-lime-300 font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4 text-lime-400" />
                  Pase 100% Oficial
                </div>
              </div>

              {/* Métodos de Pago */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Selecciona la Forma de Pago *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Yape', name: 'Yape', icon: '🟣' },
                    { id: 'Plin', name: 'Plin', icon: '🔵' },
                    { id: 'Transferencia BCP', name: 'BCP', icon: '🟠' },
                    { id: 'Efectivo / Presencial', name: 'Presencial', icon: '💵' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: m.id as PaymentMethod })}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        formData.paymentMethod === m.id
                          ? 'bg-lime-400/10 border-lime-400 text-lime-300 shadow-md shadow-lime-400/10 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-xs">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuentas de Pago */}
              {formData.paymentMethod === 'Yape' && (
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-purple-300 uppercase font-bold block">Yape Oficial</span>
                      <span className="font-bebas text-2xl text-white tracking-wider">942 910 119</span>
                      <span className="text-xs text-neutral-400 block">Titular: OHANA GO / Organización Oficial</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('942910119', 'yape')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'yape' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'Plin' && (
                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-cyan-300 uppercase font-bold block">Plin Oficial</span>
                      <span className="font-bebas text-2xl text-white tracking-wider">942 910 119</span>
                      <span className="text-xs text-neutral-400 block">Titular: OHANA GO / Organización Oficial</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('942910119', 'plin')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'plin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'Transferencia BCP' && (
                <div className="p-4 rounded-2xl bg-orange-950/40 border border-orange-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-orange-300 uppercase font-bold block">Cuenta Corriente BCP</span>
                      <span className="font-bebas text-xl text-white tracking-wider">550-98214301-0-12</span>
                      <span className="text-xs text-neutral-400 block">CCI: 002-550-0098214301012-88</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('55098214301012', 'bcp')}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'bcp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'Efectivo / Presencial' && (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Podrás cancelar en efectivo en el punto oficial de concentración o con los coordinadores autorizados en Tarapoto. Tu registro quedará en estado <strong>Pendiente de Verificación</strong> hasta confirmar la entrega del dinero.
                  </p>
                </div>
              )}

              {/* Número de Operación */}
              {formData.paymentMethod !== 'Efectivo / Presencial' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Número de Operación o Código de Aprobación *
                  </label>
                  <input
                    type="text"
                    value={formData.paymentReference}
                    onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition ${
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

              {/* Subir comprobante */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Foto o Captura del Comprobante (Opcional)
                </label>
                <div className="border border-dashed border-neutral-700 hover:border-lime-400 rounded-2xl p-4 text-center bg-neutral-950/60 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {formData.paymentProofImage ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={formData.paymentProofImage}
                        alt="Comprobante"
                        className="w-14 h-14 object-cover rounded-xl border border-lime-400"
                      />
                      <div className="text-left">
                        <span className="text-xs text-lime-400 font-bold block">Comprobante adjuntado</span>
                        <span className="text-[10px] text-neutral-400">Haz clic para cambiar imagen</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, paymentProofImage: '' });
                        }}
                        className="p-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 ml-auto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-5 h-5 text-neutral-400" />
                      <span className="text-xs text-neutral-300 font-semibold">Subir captura o foto del voucher</span>
                      <span className="text-[10px] text-neutral-500">JPG, PNG hasta 5MB</span>
                    </div>
                  )}
                </div>
                {errors.paymentProofImage && (
                  <p className="text-red-400 text-xs mt-1">{errors.paymentProofImage}</p>
                )}
              </div>

              {/* Deslinde de responsabilidad */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.disclaimerAccepted}
                    onChange={(e) => setFormData({ ...formData, disclaimerAccepted: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-700 text-lime-400 focus:ring-lime-400 accent-lime-400 cursor-pointer mt-0.5 shrink-0"
                  />
                  <span className="text-xs text-neutral-300 leading-relaxed">
                    Declaro encontrarme en óptimas condiciones físicas y de salud para participar en la distancia de 5 Kilómetros de la carrera <strong>OHANA GO 5K Por Halloween</strong>. Eximo a los organizadores y aliados de cualquier incidente derivado de condiciones médicas preexistentes no notificadas.
                  </span>
                </label>
                {errors.disclaimerAccepted && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.disclaimerAccepted}
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bebas text-lg uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Paso 2
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-gradient-to-r from-lime-400 to-lime-300 hover:from-lime-300 hover:to-lime-200 text-black font-bebas text-2xl uppercase tracking-wider rounded-xl transition shadow-xl shadow-lime-400/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Registrando...'
                  ) : (
                    <>
                      Confirmar Inscripción
                      <CheckCircle2 className="w-5 h-5" />
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
