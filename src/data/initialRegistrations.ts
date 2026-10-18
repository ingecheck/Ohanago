import { RunnerRegistration } from '../types/race';

export const INITIAL_REGISTRATIONS: RunnerRegistration[] = [];

const STORAGE_KEY = 'ohana_go_5k_tarapoto_registrations_v4';

export const getStoredRegistrations = (): RunnerRegistration[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
      return INITIAL_REGISTRATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_REGISTRATIONS;
  } catch (e) {
    console.error('Error reading localStorage registrations:', e);
    return INITIAL_REGISTRATIONS;
  }
};

export const saveRegistrations = (registrations: RunnerRegistration[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  } catch (e) {
    console.error('Error saving registrations to localStorage:', e);
  }
};

export const addRegistration = (newRunner: Omit<RunnerRegistration, 'id' | 'registrationNumber' | 'createdAt'>): RunnerRegistration => {
  const current = getStoredRegistrations();
  const nextNum = current.length > 0 ? Math.max(...current.map(r => r.registrationNumber || r.bibNumber || 0)) + 1 : 1;
  const newId = `OHA-2026-${String(nextNum).padStart(4, '0')}`;
  
  const completedRecord: RunnerRegistration = {
    ...newRunner,
    id: newId,
    registrationNumber: nextNum,
    bibNumber: nextNum,
    createdAt: new Date().toISOString(),
  };

  const updated = [completedRecord, ...current];
  saveRegistrations(updated);
  return completedRecord;
};

export const exportToCSV = (registrations: RunnerRegistration[]): void => {
  const headers = [
    'N° Inscripción',
    'ID Registro',
    'Nombres',
    'Apellidos',
    'Tipo Doc',
    'Num Doc',
    'Edad',
    'Género',
    'WhatsApp',
    'Email',
    'Ciudad',
    'Distrito',
    'Club',
    'Disfraz',
    'Nombre Disfraz',
    'Contacto Emergencia',
    'Teléfono Emergencia',
    'Tipo Sangre',
    'Método Pago',
    'Referencia Pago',
    'Estado Pago',
    'Fecha Registro'
  ];

  const rows = registrations.map(r => [
    r.registrationNumber || r.bibNumber || 1,
    r.id,
    `"${r.firstName.replace(/"/g, '""')}"`,
    `"${r.lastName.replace(/"/g, '""')}"`,
    r.documentType,
    `"${r.documentNumber}"`,
    r.age,
    r.gender,
    `"${r.whatsapp}"`,
    `"${r.email}"`,
    `"${r.city}"`,
    `"${r.district}"`,
    `"${r.runningClub}"`,
    r.willWearCostume ? 'SI' : 'NO',
    `"${(r.costumeName || '').replace(/"/g, '""')}"`,
    `"${r.emergencyContactName.replace(/"/g, '""')}"`,
    `"${r.emergencyContactPhone}"`,
    `"${r.bloodType || 'No especifica'}"`,
    `"${r.paymentMethod}"`,
    `"${r.paymentReference}"`,
    `"${r.paymentStatus}"`,
    `"${new Date(r.createdAt).toLocaleString('es-PE')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `OHANA_GO_5K_Tarapoto_Inscritos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
