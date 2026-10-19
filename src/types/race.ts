export type DocumentType = 'DNI' | 'Carnet de Extranjería' | 'Pasaporte';
export type Gender = 'Masculino' | 'Femenino' | 'Otro';
export type PaymentMethod = 'Yape' | 'Plin' | 'Transferencia BCP' | 'Transferencia BBVA' | 'Efectivo / Presencial';
export type PaymentStatus = 'Verificado' | 'Pendiente de Verificación';
export type RaceModality = 'Presencial' | 'Virtual';

export interface VirtualEvidence {
  appName?: string; // Strava, Nike Run Club, Garmin, etc.
  timeRecorded?: string; // Ej: 24:35 min
  distanceKm?: string; // Ej: 5.02 km
  proofImage?: string; // captura de pantalla base64 o url
  submittedAt?: string;
}

export interface RunnerRegistration {
  id: string;
  registrationNumber: number; // Número correlativo de inscripción (Ej: #001)
  bibNumber?: number; // compatibilidad
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  whatsapp: string;
  age: number;
  gender: Gender;
  department?: string; // Departamento (Ej: San Martín, Lima, etc.)
  city: string; // Ciudad / Provincia
  district: string; // Distrito
  runningClub: string;
  tShirtSize?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType?: string;
  medicalConditions?: string;
  willWearCostume: boolean;
  costumeName?: string;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paymentProofImage?: string; // base64 string
  paymentStatus: PaymentStatus;
  createdAt: string;
  disclaimerAccepted: boolean;
  // Modality: Presencial en Tarapoto vs Virtual desde cualquier lugar
  modality?: RaceModality;
  shippingAddress?: string; // Dirección para envío de medalla física a virtuales
  virtualEvidence?: VirtualEvidence;
  // Race day check-in verification for presencial
  confirmedAtStart?: boolean;
  startCheckinTime?: string;
  // Compatibility fields
  totalCandies?: number;
  potionsCollected?: string[];
}

export interface EventInfo {
  name: string;
  subtitle: string;
  distance: string;
  date: string;
  time: string;
  price: number;
  currency: string;
  startLocation: string;
  finishLocation: string;
  city: string;
  maxCap: number;
}
