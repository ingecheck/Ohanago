import { RunnerRegistration } from '../types/race';
import { isRiojaRunner, isTarapotoRunner } from '../utils/checkinManager';
import * as XLSX from 'xlsx';

/**
 * Generates an authentic Microsoft Excel (.xlsx) workbook directly in the browser
 * with separate formatted sheets for Santa Run Tarapoto, Santa Run Rioja, and Halloween 5K.
 */
export function exportToNativeXLSX(registrations: RunnerRegistration[]): void {
  const wb = XLSX.utils.book_new();

  // 1. Santa Run Tarapoto 2026 Sheet
  const tarapotoList = registrations.filter((r) => isTarapotoRunner(r));
  const tarapotoData = [
    [
      'ID Corredor (Tarapoto)',
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
      'Foto Personal (Marco)',
      'Carpeta Drive Sync',
      'N° Operación Ref',
      'Estado Kit',
      'Check-in QR Partida',
      'Hora Check-in',
      'Fecha Registro',
      'Método Pago',
      'Estado de Pago',
    ],
    ...tarapotoList.map((r) => [
      r.id.startsWith('SR-') ? r.id : `SR-2026-${String(r.registrationNumber || 1).padStart(4, '0')}`,
      `#${String(r.registrationNumber || 1).padStart(4, '0')}`,
      r.firstName,
      r.lastName,
      r.documentNumber,
      r.whatsapp,
      r.email || '',
      r.tShirtSize || 'M',
      r.amountPaid ? `S/ ${r.amountPaid}` : 'S/ 70',
      r.hasPreviousDiscount ? 'SÍ (15%)' : 'Tarifa Normal',
      r.turkeyRaffleTicket || `PAVO-${String(r.registrationNumber || 1).padStart(4, '0')}`,
      r.driveVoucherFileId || r.driveVoucherUrl || r.voucherUrl || r.paymentProofImage ? 'SÍ (Drive)' : 'PENDIENTE',
      r.drivePhotoFileId || r.drivePhotoUrl || r.personalPhotoUrl ? 'SÍ (Drive)' : 'PENDIENTE',
      r.driveVoucherFileId || r.drivePhotoFileId ? 'Respaldado en Drive' : 'Sin archivos',
      r.paymentReference || 'Yape Directo',
      r.kitClaimed || r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE',
      r.confirmedAtStart ? 'CONFIRMADO' : 'NO REGISTRADO',
      r.startCheckinTime || '-',
      r.createdAt ? new Date(r.createdAt).toLocaleString('es-PE') : '-',
      r.paymentMethod || 'Yape',
      r.paymentStatus || 'No Verificado',
    ]),
  ];

  const wsTarapoto = XLSX.utils.aoa_to_sheet(tarapotoData);
  wsTarapoto['!cols'] = [
    { wch: 22 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
    { wch: 14 }, { wch: 15 }, { wch: 25 }, { wch: 12 },
    { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 20 },
    { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 14 },
    { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTarapoto, 'Santa Run Tarapoto 2026');

  // 2. Santa Run Rioja 2026 Sheet
  const riojaList = registrations.filter((r) => isRiojaRunner(r));
  const riojaData = [
    [
      'ID Corredor (Rioja)',
      'N° Inscripción',
      'Categoría',
      'Nombres',
      'Apellidos',
      'DNI',
      'WhatsApp',
      'Edad',
      'Monto Pagado',
      'Voucher / Constancia',
      'Foto Personal',
      'N° Operación Ref',
      'Estado Kit',
      'Check-in QR',
      'Fecha Registro',
      'Estado de Pago',
    ],
    ...riojaList.map((r) => [
      r.id,
      `#${String(r.registrationNumber || 1).padStart(4, '0')}`,
      r.raceCategory || 'Libre 5K',
      r.firstName,
      r.lastName,
      r.documentNumber,
      r.whatsapp,
      r.age || '',
      r.amountPaid ? `S/ ${Number(r.amountPaid).toFixed(2)}` : r.raceCategory === 'Kids 2K' ? 'S/ 25.00' : 'S/ 35.00',
      r.driveVoucherFileId || r.driveVoucherUrl || r.voucherUrl || r.paymentProofImage ? 'SÍ (Drive)' : 'PENDIENTE',
      r.drivePhotoFileId || r.drivePhotoUrl || r.personalPhotoUrl ? 'SÍ (Drive)' : 'PENDIENTE',
      r.paymentReference || 'Yape Directo',
      r.kitClaimed || r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE',
      r.confirmedAtStart ? 'CONFIRMADO' : 'NO REGISTRADO',
      r.createdAt ? new Date(r.createdAt).toLocaleString('es-PE') : '-',
      r.paymentStatus || 'No Verificado',
    ]),
  ];

  const wsRioja = XLSX.utils.aoa_to_sheet(riojaData);
  wsRioja['!cols'] = [
    { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 20 },
    { wch: 20 }, { wch: 14 }, { wch: 15 }, { wch: 8 },
    { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 18 },
    { wch: 14 }, { wch: 16 }, { wch: 22 }, { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRioja, 'Santa Run Rioja 2026');

  // 3. Halloween 5K Sheet
  const halloweenList = registrations.filter((r) => !isTarapotoRunner(r) && !isRiojaRunner(r));
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
      r.email || '',
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
    { wch: 18 }, { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsHalloween, 'Halloween 5K (Auditoría)');

  XLSX.writeFile(wb, `OHANA_GO_Inscripciones_Oficiales_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
