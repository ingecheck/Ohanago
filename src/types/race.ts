export type DocumentType = 'DNI' | 'Carnet de Extranjería' | 'Pasaporte';
export type Gender = 'Masculino' | 'Femenino' | 'Otro';
export type PaymentMethod = 'Yape' | 'Plin' | 'Transferencia BCP' | 'Transferencia BBVA' | 'Efectivo / Presencial';
export type PaymentStatus = 'Verificado' | 'Pendiente de Verificación';

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
  city: string;
  district: string;
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
