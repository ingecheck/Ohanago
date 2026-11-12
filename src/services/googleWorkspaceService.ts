import { RunnerRegistration } from '../types/race';
import * as XLSX from 'xlsx';

/**
 * Generates an authentic Microsoft Excel (.xlsx) workbook directly in the browser
 * with multiple formatted sheets, proper column widths, and zero coding artifacts.
 * Operates 100% locally with zero external API calls or authentication requirements.
 */
export function exportToNativeXLSX(registrations: RunnerRegistration[]): void {
  const wb = XLSX.utils.book_new();

  // 1. Santa Run 2026 Sheet
  const santaList = registrations.filter((r) => r.edition === 'santa-run-2026' || r.id.startsWith('SR-'));
  const santaData = [
    [
      'ID Corredor (Santa Run)',
      'N° Inscripción',
      'Nombres',
      'Apellidos',
      'DNI',
      'WhatsApp',
      'Email',
      'Talla Polo',
      'Monto Pagado',
      'Desc. 15% Ohana',
      'Ticket Sorteo Pavo',
      'Voucher / Constancia',
      'N° Operación Ref',
      'Estado Kit',
      'Check-in QR Partida',
      'Hora Check-in',
      'Fecha Registro',
      'Método Pago',
      'Estado de Pago',
    ],
    ...santaList.map((r) => [
      r.id.startsWith('SR-') ? r.id : `SR-2026-${String(r.registrationNumber || 1).padStart(4, '0')}`,
      `#${String(r.registrationNumber || 1).padStart(3, '0')}`,
      r.firstName,
      r.lastName,
      r.documentNumber,
      r.whatsapp,
      r.email,
      r.tShirtSize || 'M',
      r.amountPaid ? `S/ ${r.amountPaid}` : 'S/ 70',
      r.hasPreviousDiscount ? 'SÍ (15%)' : 'Tarifa Normal',
      r.turkeyRaffleTicket || `PAVO-${String(r.registrationNumber || 1).padStart(4, '0')}`,
      r.voucherUrl || r.paymentProofImage ? 'SÍ (Adjuntado)' : 'PENDIENTE',
      r.paymentReference || 'Yape Directo',
      r.kitClaimed || r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE',
      r.confirmedAtStart ? 'CONFIRMADO' : 'NO REGISTRADO',
      r.startCheckinTime || '-',
      r.createdAt ? new Date(r.createdAt).toLocaleString('es-PE') : '-',
      r.paymentMethod || 'Yape',
      r.paymentStatus || 'No Verificado',
    ]),
  ];

  const wsSanta = XLSX.utils.aoa_to_sheet(santaData);
  wsSanta['!cols'] = [
    { wch: 22 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
    { wch: 14 }, { wch: 15 }, { wch: 25 }, { wch: 12 },
    { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 20 },
    { wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 16 },
    { wch: 22 }, { wch: 14 }, { wch: 24 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSanta, 'Santa Run 2026');

  // 2. Halloween 5K Sheet
  const halloweenList = registrations.filter((r) => r.edition !== 'santa-run-2026' && !r.id.startsWith('SR-'));
  const halloweenData = [
    [
      'ID Atleta',
      'N° Dorsal',
      'Nombres',
      'Apellidos',
      'DNI',
      'WhatsApp',
      'Email',
      'Modalidad',
      'Estado Kit Inicial',
      'Check-in QR Partida',
      'Hora Check-in',
      'Cruzó Meta',
      'Medalla Entregada',
      'Fecha Registro',
    ],
    ...halloweenList.map((r) => [
      r.id,
      `#${String(r.registrationNumber || r.bibNumber || '').padStart(3, '0')}`,
      r.firstName,
      r.lastName,
      r.documentNumber,
      r.whatsapp,
      r.email,
      r.modality || 'Presencial',
      r.confirmedAtStart ? 'ENTREGADO' : 'NO ENTREGADO',
      r.confirmedAtStart ? 'CONFIRMADO' : 'PENDIENTE',
      r.startCheckinTime || '-',
      r.finishedAtMeta ? 'SÍ' : 'NO',
      r.medalDelivered ? 'SÍ' : 'NO',
      r.createdAt ? new Date(r.createdAt).toLocaleString('es-PE') : '-',
    ]),
  ];

  const wsHalloween = XLSX.utils.aoa_to_sheet(halloweenData);
  wsHalloween['!cols'] = [
    { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
    { wch: 14 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
    { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 14 },
    { wch: 18 }, { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsHalloween, 'Halloween 5K (Auditoría)');

  XLSX.writeFile(wb, `OHANA_GO_Inscripciones_Oficiales_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
