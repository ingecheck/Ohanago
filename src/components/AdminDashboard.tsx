import React, { useState, useEffect } from 'react';
import { RunnerRegistration, PaymentStatus, RaceModality } from '../types/race';
import { saveRegistrations, getStoredRegistrations } from '../data/initialRegistrations';
import { adminLogout, updateAdminPassword } from '../data/auth';
import {
  processStartCheckinSafe,
  subscribeToRegistrationsCollection,
  subscribeToDeletedRunnerIdsFirestore,
  fetchRegistrationsFirestore,
  mergeRegistrationsLists,
  cleanFirestoreData,
  saveRegistrationFirestore,
  deleteRegistrationEverywhere,
  isRiojaRunner,
  isTarapotoRunner,
  isCloudSantaRunner,
} from '../utils/checkinManager';
import { resetAnalyticsSafe } from '../utils/analytics';
import { doc, setDoc, getDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { QRScannerModal } from './QRScannerModal';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  LogOut,
  KeyRound,
  Check,
  Camera,
  QrCode,
  MapPin,
  RefreshCw,
  Phone,
  DollarSign,
  Maximize2,
  Minimize2,
  Printer,
  ArrowLeft,
  PackageCheck,
  Pencil,
  BarChart3,
  Eye,
  Activity,
  MousePointerClick,
  Trophy,
  Download,
  FileSpreadsheet,
  Database,
  Gift,
  Image as ImageIcon,
  FolderOpen,
  HardDrive,
  CloudUpload,
  Trash2,
  ExternalLink,
  Copy
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import { AdminRouletteModal } from './AdminRouletteModal';
import { SantaTurkeyLotteryModal } from './SantaTurkeyLotteryModal';
import {
  fetchAnalytics,
  subscribeToAnalyticsFirestore,
  AnalyticsSummary,
} from '../utils/analytics';
import { getStoredRouletteState } from '../utils/rouletteManager';
import {
  exportToNativeXLSX,
  exportTarapotoXLSX,
  exportRiojaXLSX,
} from '../services/googleWorkspaceService';
import {
  buildRunnerPersonName,
  buildVoucherDriveFileName,
  buildPhotoDriveFileName,
  OhanaDriveFolders,
  RiojaDriveFoldersConfig,
  DEFAULT_OHANA_DRIVE_FOLDERS,
  DEFAULT_YAPE_FOLDER_ID,
  DEFAULT_PHOTOS_FOLDER_ID,
  DEFAULT_APPS_SCRIPT_BRIDGE_URL,
  getDriveBridgeUrl,
  getRiojaDriveFolders,
  saveRiojaDriveFolders,
  syncRunnerMediaViaAppsScript,
  isValidAppsScriptUrl,
  initDriveAuth,
  getDriveAccessToken,
  ensureOhanaDriveFolders,
  uploadFileToDriveFolder,
  getDriveImagePreviewUrl,
  getDriveFileLink,
} from '../services/googleDriveService';

interface AdminDashboardProps {
  registrations: RunnerRegistration[];
  onUpdateRegistrations: (updated: RunnerRegistration[]) => void;
  onClose: () => void;
  onLogout: () => void;
  initialEdition?: 'santa-run-2026' | 'santa-run-rioja-2026';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  registrations,
  onUpdateRegistrations,
  onClose,
  onLogout,
  initialEdition = 'santa-run-2026',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCheckin, setFilterCheckin] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'verified' | 'pending'>('all');
  const [filterEdition, setFilterEdition] = useState<
    'all' | 'santa-run-2026' | 'santa-run-rioja-2026' | 'halloween-5k-2026'
  >(initialEdition);
  const [showTurkeyLottery, setShowTurkeyLottery] = useState(false);

  useEffect(() => {
    setFilterEdition(initialEdition);
  }, [initialEdition]);

  // Modals
  const [scannedRunnerModal, setScannedRunnerModal] = useState<RunnerRegistration | null>(null);
  const [viewingVoucherRunner, setViewingVoucherRunner] = useState<RunnerRegistration | null>(null);
  const [viewingPhotoRunner, setViewingPhotoRunner] = useState<RunnerRegistration | null>(null);
  const [voucherModalImgError, setVoucherModalImgError] = useState(false);
  const [photoModalImgError, setPhotoModalImgError] = useState(false);

  // Google Drive integration & Server Storage monitor states (Admin Panel ONLY)
  const [needsDriveAuth, setNeedsDriveAuth] = useState(true);
  const [driveUser, setDriveUser] = useState<FirebaseUser | { email: string | null } | null>(null);
  const [driveAuthError, setDriveAuthError] = useState<string | null>(null);
  const [driveFolders, setDriveFolders] = useState<OhanaDriveFolders>(DEFAULT_OHANA_DRIVE_FOLDERS);
  const [riojaDriveFolders, setRiojaDriveFolders] = useState<RiojaDriveFoldersConfig>({
    vouchersFolderId: DEFAULT_YAPE_FOLDER_ID,
    photosFolderId: DEFAULT_PHOTOS_FOLDER_ID,
    vouchersFolderUrl: `https://drive.google.com/drive/folders/${DEFAULT_YAPE_FOLDER_ID}`,
    photosFolderUrl: `https://drive.google.com/drive/folders/${DEFAULT_PHOTOS_FOLDER_ID}`,
    isDedicated: false,
  });
  const [showRiojaDriveConfig, setShowRiojaDriveConfig] = useState(false);
  const [riojaYapeFolderInput, setRiojaYapeFolderInput] = useState('');
  const [riojaPhotosFolderInput, setRiojaPhotosFolderInput] = useState('');
  const [isSavingRiojaFolders, setIsSavingRiojaFolders] = useState(false);
  const [isLoggingInDrive, setIsLoggingInDrive] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [autoSyncDrive, setAutoSyncDrive] = useState(true);
  const [driveSyncProgress, setDriveSyncProgress] = useState<string | null>(null);
  const [bridgeUrl, setBridgeUrl] = useState<string>(DEFAULT_APPS_SCRIPT_BRIDGE_URL);
  const [storageStats, setStorageStats] = useState<{
    vouchersCount: number;
    vouchersMB: number;
    photosCount: number;
    photosMB: number;
    totalFiles: number;
    totalMB: number;
    maxBudgetMB: number;
    cleanableLocalFiles: number;
  } | null>(null);
  const [confirmActionModal, setConfirmActionModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [isExecutingConfirmAction, setIsExecutingConfirmAction] = useState(false);

  // Edit Runner full profile modal (syncs live to Cloud Firestore)
  const [editingRunner, setEditingRunner] = useState<RunnerRegistration | null>(null);
  const [editFirstNameValue, setEditFirstNameValue] = useState('');
  const [editLastNameValue, setEditLastNameValue] = useState('');
  const [editDniValue, setEditDniValue] = useState('');
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [editAgeValue, setEditAgeValue] = useState('');
  const [editTShirtSizeValue, setEditTShirtSizeValue] = useState('M');
  const [editRaceCategoryValue, setEditRaceCategoryValue] = useState<'Kids 2K' | 'Libre 5K'>('Libre 5K');
  const [editPaymentRefValue, setEditPaymentRefValue] = useState('');
  const [editPaymentStatusValue, setEditPaymentStatusValue] = useState<PaymentStatus>('No Verificado');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openEditRunnerModal = (runner: RunnerRegistration) => {
    setEditingRunner(runner);
    setEditFirstNameValue(runner.firstName || '');
    setEditLastNameValue(runner.lastName || '');
    setEditDniValue(runner.documentNumber?.includes('Pendiente') ? '' : runner.documentNumber || '');
    setEditPhoneValue(runner.whatsapp || '');
    setEditAgeValue(runner.age ? String(runner.age) : '');
    setEditTShirtSizeValue(runner.tShirtSize || 'M');
    setEditRaceCategoryValue(runner.raceCategory === 'Kids 2K' ? 'Kids 2K' : 'Libre 5K');
    setEditPaymentRefValue(runner.paymentReference || '');
    setEditPaymentStatusValue(runner.paymentStatus || 'No Verificado');
  };

  const handleSaveRunnerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRunner) return;
    setIsSavingEdit(true);

    const editingIsRioja = isRiojaRunner(editingRunner);
    const newFirstName = editFirstNameValue.trim() || editingRunner.firstName;
    const newLastName = editLastNameValue.trim() || editingRunner.lastName;
    const newDni = editDniValue.trim();
    const newPhone = editPhoneValue.trim();
    const newAge = Number(editAgeValue) || editingRunner.age || (editingIsRioja && editRaceCategoryValue === 'Kids 2K' ? 10 : 25);
    const newTShirtSize = editingIsRioja ? undefined : (editTShirtSizeValue || 'M');
    const newRaceCategory = editingIsRioja ? editRaceCategoryValue : editingRunner.raceCategory;
    const newAmountPaid = editingIsRioja
      ? editRaceCategoryValue === 'Kids 2K'
        ? 25.0
        : 35.0
      : editingRunner.amountPaid;
    const newPaymentRef = editPaymentRefValue.trim();

    const updatedRunner: RunnerRegistration = {
      ...editingRunner,
      firstName: newFirstName,
      lastName: newLastName,
      documentNumber: newDni,
      whatsapp: newPhone,
      age: newAge,
      tShirtSize: newTShirtSize,
      raceCategory: newRaceCategory,
      amountPaid: newAmountPaid,
      paymentReference: newPaymentRef,
      paymentStatus: editPaymentStatusValue,
    };

    const updatedList = registrations.map((r) =>
      r.id === editingRunner.id ? updatedRunner : r
    );

    // 1. Inmediato en estado y localStorage
    onUpdateRegistrations(updatedList);
    saveRegistrations(updatedList);

    // 2. Sincronización en la nube (Firestore) — solo datos escritos en orden, 0 imágenes en BD
    await saveRegistrationFirestore(updatedRunner).catch(() => {});

    // 3. Notificación opcional al servidor si está disponible
    try {
      fetch('/api/runner/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: editingRunner.id,
          firstName: newFirstName,
          lastName: newLastName,
          documentNumber: newDni,
          whatsapp: newPhone,
          age: newAge,
          tShirtSize: newTShirtSize,
          raceCategory: newRaceCategory,
          amountPaid: newAmountPaid,
          paymentReference: newPaymentRef,
          paymentStatus: editPaymentStatusValue,
        }),
      }).catch(() => {});
    } catch (e) {}

    setEditingRunner(null);
    setIsSavingEdit(false);
    setLiveNotice(`✓ Datos de ${newFirstName} ${newLastName} actualizados en vivo en la base de datos.`);
    setTimeout(() => setLiveNotice(null), 4500);
  };

  // Official Kit Delivery QR and Staff Scanner
  const [showStartQRModal, setShowStartQRModal] = useState(false);
  const [isFullScreenQR, setIsFullScreenQR] = useState(false);
  const [startQrDataUrl, setStartQrDataUrl] = useState<string | null>(null);
  const [showStaffScanner, setShowStaffScanner] = useState(false);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Tab: Roster table vs Traffic/Analytics
  const [activeAdminTab, setActiveAdminTab] = useState<'roster' | 'analytics'>('roster');
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await fetchAnalytics();
      if (data) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.warn('Error fetching analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleResetAnalytics = async () => {
    try {
      await resetAnalyticsSafe();
      loadAnalytics();
      setLiveNotice('✓ Contadores y accesos de analítica reiniciados correctamente.');
      setTimeout(() => setLiveNotice(null), 3500);
    } catch (e) {}
  };

  // Respaldo y Exportación de Datos del Evento
  const [showExportModal, setShowExportModal] = useState(false);

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportHalloweenAuditCSV = (filterMode: 'all' | 'pending' | 'qr-confirmed' = 'all') => {
    let list = registrations.filter((r) => !isCloudSantaRunner(r));
    if (filterMode === 'pending') {
      list = list.filter((r) => !r.confirmedAtStart);
    } else if (filterMode === 'qr-confirmed') {
      list = list.filter((r) => r.confirmedAtStart);
    }

    const headers = [
      'N°',
      'Código ID',
      'Nombres',
      'Apellidos',
      'DNI',
      'WhatsApp',
      'Modalidad',
      'Ciudad',
      'Club / Team',
      'Estado Kit Inicial',
      'Check-in QR Partida',
      'Fecha y Hora Check-in',
      'Llegó a Meta',
      'Estado Pago',
      'Observación Auditoría'
    ];

    const rows = list.map((r, i) => [
      i + 1,
      `"${r.id}"`,
      `"${r.firstName.replace(/"/g, '""')}"`,
      `"${r.lastName.replace(/"/g, '""')}"`,
      `"${r.documentNumber}"`,
      `"${r.whatsapp}"`,
      `"${r.modality}"`,
      `"${r.city || ''}"`,
      `"${r.runningClub || ''}"`,
      r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE DE ENTREGA',
      r.confirmedAtStart ? 'CONFIRMADO (QR)' : 'NO REGISTRÓ EN QR',
      r.startCheckinTime ? `"${new Date(r.startCheckinTime).toLocaleString('es-PE')}"` : '""',
      r.finishedAtMeta ? 'SÍ' : 'NO',
      `"${r.paymentStatus}"`,
      r.confirmedAtStart ? '✓ Kit Entregado' : '⚠️ ATLETA SIN ENTREGA DE KIT'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const suffix = filterMode === 'pending' ? '_SOLO_KITS_PENDIENTES' : filterMode === 'qr-confirmed' ? '_CON_CHECKIN_QR' : '_AUDITORIA_COMPLETA';
    downloadFile(`Ohana_Halloween5K${suffix}_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };

  const handleExportSantaRunCSV = () => {
    const exportingRioja = filterEdition === 'santa-run-rioja-2026';
    const list = exportingRioja
      ? registrations.filter(isRiojaRunner)
      : registrations.filter(isTarapotoRunner);

    if (exportingRioja) {
      const headers = [
        'N°',
        'ID Santa Run Rioja',
        'Nombres',
        'Apellidos',
        'DNI',
        'WhatsApp',
        'Categoría Rioja',
        'Monto Inversión',
        'Estado Pago',
        'Kit Rioja',
        'Fecha Registro',
      ];
      const rows = list.map((r, i) => {
        const cat = r.raceCategory === 'Kids 2K' ? 'Kids 2K' : 'Libre 5K';
        const price =
          typeof r.amountPaid === 'number' && r.amountPaid > 0
            ? r.amountPaid
            : cat === 'Kids 2K'
              ? 25
              : 35;
        return [
          i + 1,
          `"${r.id}"`,
          `"${r.firstName.replace(/"/g, '""')}"`,
          `"${r.lastName.replace(/"/g, '""')}"`,
          `"${r.documentNumber}"`,
          `"${r.whatsapp}"`,
          `"${cat}"`,
          `S/ ${price.toFixed(2)}`,
          `"${r.paymentStatus || 'No Verificado'}"`,
          r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE',
          r.createdAt ? `"${new Date(r.createdAt).toLocaleString('es-PE')}"` : '""',
        ];
      });
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      downloadFile(
        `Ohana_SantaRunRioja2026_Inscripciones_${new Date().toISOString().slice(0, 10)}.csv`,
        csvContent,
        'text/csv;charset=utf-8;'
      );
      return;
    }

    const headers = [
      'N°',
      'ID Santa Run',
      'Nombres',
      'Apellidos',
      'DNI',
      'WhatsApp',
      'Talla Polo',
      'Monto Inversión',
      'Descuento 15% Exclusivo',
      'Estado Pago',
      'Kit Santa Run',
      'Fecha Registro',
    ];

    const rows = list.map((r, i) => {
      const price =
        typeof r.amountPaid === 'number' && r.amountPaid > 0
          ? r.amountPaid
          : r.hasPreviousDiscount
            ? 59.5
            : 70;
      return [
        i + 1,
        `"${r.id.startsWith('SR-') ? r.id : `SR-${r.id}`}"`,
        `"${r.firstName.replace(/"/g, '""')}"`,
        `"${r.lastName.replace(/"/g, '""')}"`,
        `"${r.documentNumber}"`,
        `"${r.whatsapp}"`,
        `"${r.tShirtSize || 'M'}"`,
        `S/ ${price.toFixed(2)}`,
        r.hasPreviousDiscount ? 'SÍ (Corredor Ohana)' : 'NO',
        `"${r.paymentStatus || 'No Verificado'}"`,
        r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE',
        r.createdAt ? `"${new Date(r.createdAt).toLocaleString('es-PE')}"` : '""',
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    downloadFile(
      `Ohana_SantaRunTarapoto2026_Inscripciones_${new Date().toISOString().slice(0, 10)}.csv`,
      csvContent,
      'text/csv;charset=utf-8;'
    );
  };

  const handleExportRunnersCSV = () => {
    handleExportHalloweenAuditCSV('all');
  };

  const handleExportWinnersCSV = () => {
    const rState = getStoredRouletteState();
    const winners = rState.winners || [];

    if (winners.length === 0) {
      alert('Aún no hay ganadores registrados en la ruleta.');
      return;
    }

    const headers = ['N° Sorteo', 'Premio', 'Ticket Ganador', 'Nombre Ganador', 'DNI Ganador', 'Hora Sorteo'];
    const rows = winners.map((w) => [
      w.drawNumber,
      `"${(w.prizeName || '').replace(/"/g, '""')}"`,
      w.ticketNumber,
      `"${(w.runnerName || '').replace(/"/g, '""')}"`,
      `"${w.runnerDni || ''}"`,
      `"${new Date(w.wonAt).toLocaleString('es-PE')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    downloadFile(`OhanaGo5K_Ganadores_Ruleta_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };

  const handleExportFullJSON = () => {
    const rState = getStoredRouletteState();
    const fullBackup = {
      event: 'OHANA GO Santa Run 2026 & Halloween 5K Tarapoto',
      exportDate: new Date().toISOString(),
      userEmail: 'ingecheckplus@gmail.com',
      totalAthletes: registrations.length,
      kitsDeliveredCount: registrations.filter((r) => r.confirmedAtStart).length,
      roulette: rState,
      registrations: registrations,
      analytics: analyticsData,
    };

    downloadFile(
      `OhanaGo_Respaldo_Completo_Oficial_${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(fullBackup, null, 2),
      'application/json;charset=utf-8;'
    );
  };

  useEffect(() => {
    // Generate official kit delivery check-in QR code for Aviación
    const origin = window.location.origin;
    const startUrl = `${origin}/?checkin=start&token=OHANA-START-LINE-TARAPOTO-2026`;
    QRCode.toDataURL(startUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setStartQrDataUrl(url))
      .catch((err) => console.error('Error generating kit delivery QR:', err));
  }, []);

  const fetchStorageStats = async () => {
    try {
      const res = await fetch('/api/admin/storage-stats');
      if (res.ok) {
        const data = await res.json();
        setStorageStats(data);
      }
    } catch (e) {}
  };

  const isOfficialFolders = (folders: Partial<OhanaDriveFolders> | null | undefined): folders is OhanaDriveFolders =>
    !!folders &&
    folders.vouchersFolderId === DEFAULT_YAPE_FOLDER_ID &&
    folders.photosFolderId === DEFAULT_PHOTOS_FOLDER_ID;

  const fetchSavedDriveFolders = async () => {
    let hasStale = false;
    try {
      const local = localStorage.getItem('ohana_drive_folders');
      if (local) {
        const parsed = JSON.parse(local);
        if (isOfficialFolders(parsed)) {
          setDriveFolders(parsed);
        } else {
          hasStale = true;
        }
      }
    } catch (e) {}

    try {
      const res = await fetch('/api/admin/drive-folders');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (isOfficialFolders(data?.folders)) {
          setDriveFolders(data.folders);
          try {
            localStorage.setItem('ohana_drive_folders', JSON.stringify(data.folders));
          } catch (e) {}
          return;
        } else if (data?.folders) {
          hasStale = true;
        }
      }
    } catch (e) {}

    try {
      const snap = await getDoc(doc(db, 'analytics', 'drive_folders'));
      if (snap.exists()) {
        const folders = snap.data() as OhanaDriveFolders;
        if (isOfficialFolders(folders)) {
          setDriveFolders(folders);
          try {
            localStorage.setItem('ohana_drive_folders', JSON.stringify(folders));
          } catch (e) {}
          return;
        } else {
          hasStale = true;
        }
      }
    } catch (e) {}

    if (hasStale) {
      await persistDriveFolders(DEFAULT_OHANA_DRIVE_FOLDERS);
    }
  };

  const persistDriveFolders = async (folders: OhanaDriveFolders) => {
    setDriveFolders(folders);
    try {
      localStorage.setItem('ohana_drive_folders', JSON.stringify(folders));
    } catch (e) {}
    try {
      setDoc(doc(db, 'analytics', 'drive_folders'), cleanFirestoreData(folders), { merge: true }).catch(() => {});
    } catch (e) {}
    try {
      await fetch('/api/admin/drive-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders }),
      });
    } catch (e) {}
  };

  useEffect(() => {
    fetchStorageStats();
    fetchSavedDriveFolders();
    getRiojaDriveFolders().then((cfg) => {
      setRiojaDriveFolders(cfg);
      if (cfg.isDedicated) {
        setRiojaYapeFolderInput(cfg.vouchersFolderUrl);
        setRiojaPhotosFolderInput(cfg.photosFolderUrl);
      }
    });
    getDriveBridgeUrl().then((url) => {
      if (url) {
        setBridgeUrl(url);
      }
    });
    const unsubDriveAuth = initDriveAuth(
      (user) => {
        setDriveUser(user);
        setNeedsDriveAuth(false);
        setDriveAuthError(null);
      },
      () => {
        setDriveUser(null);
        setNeedsDriveAuth(true);
      }
    );
    return () => unsubDriveAuth();
  }, []);

  const syncPendingMediaToDrive = async (overwriteExisting = false) => {
    if (isSyncingDrive) return;
    const activeBridge = bridgeUrl && isValidAppsScriptUrl(bridgeUrl) ? bridgeUrl : null;
    const accessToken = activeBridge ? null : await getDriveAccessToken();
    if (!activeBridge && !accessToken) {
      setNeedsDriveAuth(true);
      return;
    }

    const targets = registrations.filter((r) => {
      const hasVoucher = !!(r.voucherUrl || r.paymentProofImage);
      const hasPhoto = !!r.personalPhotoUrl;
      const needsVoucher = hasVoucher && (overwriteExisting || !r.driveVoucherFileId);
      const needsPhoto = hasPhoto && (overwriteExisting || !r.drivePhotoFileId);
      return needsVoucher || needsPhoto;
    });

    if (targets.length === 0) {
      setDriveSyncProgress(null);
      return;
    }

    setIsSyncingDrive(true);
    try {
      const folders = activeBridge
        ? DEFAULT_OHANA_DRIVE_FOLDERS
        : await ensureOhanaDriveFolders(accessToken!);
      await persistDriveFolders(folders);

      const updates: Array<{
        runnerId: string;
        driveVoucherFileId?: string;
        driveVoucherUrl?: string;
        drivePhotoFileId?: string;
        drivePhotoUrl?: string;
      }> = [];

      let uploadedFiles = 0;
      let lastUploadError: string | null = null;
      for (let i = 0; i < targets.length; i++) {
        const r = targets[i];
        const personName = buildRunnerPersonName(r);
        setDriveSyncProgress(`Sincronizando ${i + 1}/${targets.length}: ${personName}...`);
        const updateItem: any = { runnerId: r.id };
        let touched = false;

        if (activeBridge) {
          try {
            const bridgeRes = await syncRunnerMediaViaAppsScript(r, {
              overwrite: overwriteExisting,
              bridgeUrl: activeBridge,
            });
            if (bridgeRes) {
              if (bridgeRes.driveVoucherFileId) {
                updateItem.driveVoucherFileId = bridgeRes.driveVoucherFileId;
                updateItem.driveVoucherUrl = bridgeRes.driveVoucherUrl;
                uploadedFiles += 1;
                touched = true;
              }
              if (bridgeRes.drivePhotoFileId) {
                updateItem.drivePhotoFileId = bridgeRes.drivePhotoFileId;
                updateItem.drivePhotoUrl = bridgeRes.drivePhotoUrl;
                uploadedFiles += 1;
                touched = true;
              }
            }
          } catch (err: any) {
            lastUploadError = err?.message || 'Error enviando archivo directo a Drive';
          }
        } else {
          const voucherSrc = r.voucherUrl || r.paymentProofImage;
          if (voucherSrc && (overwriteExisting || !r.driveVoucherFileId)) {
            try {
              const uploadedVoucher = await uploadFileToDriveFolder({
                accessToken: accessToken!,
                folderId: folders.vouchersFolderId,
                baseFileName: buildVoucherDriveFileName(r),
                source: voucherSrc,
                existingFileId: overwriteExisting ? r.driveVoucherFileId : undefined,
              });
              updateItem.driveVoucherFileId = uploadedVoucher.id;
              updateItem.driveVoucherUrl = uploadedVoucher.webViewLink;
              uploadedFiles += 1;
              touched = true;
            } catch (err: any) {
              if (err?.message === 'AUTH_EXPIRED') throw err;
              lastUploadError = err?.message || 'Error subiendo constancia Yape';
            }
          }

          if (r.personalPhotoUrl && (overwriteExisting || !r.drivePhotoFileId)) {
            try {
              const uploadedPhoto = await uploadFileToDriveFolder({
                accessToken: accessToken!,
                folderId: folders.photosFolderId,
                baseFileName: buildPhotoDriveFileName(r),
                source: r.personalPhotoUrl,
                existingFileId: overwriteExisting ? r.drivePhotoFileId : undefined,
              });
              updateItem.drivePhotoFileId = uploadedPhoto.id;
              updateItem.drivePhotoUrl = uploadedPhoto.webViewLink;
              uploadedFiles += 1;
              touched = true;
            } catch (err: any) {
              if (err?.message === 'AUTH_EXPIRED') throw err;
              lastUploadError = err?.message || 'Error subiendo foto de atleta';
            }
          }
        }

        if (touched) {
          updates.push(updateItem);
        }
      }

      if (uploadedFiles === 0 && lastUploadError) {
        throw new Error(lastUploadError);
      }

      if (updates.length > 0) {
        let nextList = registrations.map((r) => {
          const u = updates.find((item) => item.runnerId === r.id);
          if (!u) return r;
          const updated: RunnerRegistration = { ...r, ...u };
          // Una vez guardado en Drive, limpiar copias base64 pesadas locales/Firestore
          if (u.driveVoucherFileId && !u.driveVoucherFileId.startsWith('bridge_')) {
            if (updated.voucherUrl?.startsWith('data:')) updated.voucherUrl = undefined;
            if (updated.paymentProofImage?.startsWith('data:')) updated.paymentProofImage = undefined;
          }
          if (u.drivePhotoFileId && !u.drivePhotoFileId.startsWith('bridge_')) {
            if (updated.personalPhotoUrl?.startsWith('data:')) updated.personalPhotoUrl = undefined;
          }
          return updated;
        });

        try {
          const syncRes = await fetch('/api/admin/drive-synced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates, cleanupLocal: true }),
          });
          const contentType = syncRes.headers.get('content-type') || '';
          if (syncRes.ok && contentType.includes('application/json')) {
            const data = await syncRes.json();
            if (Array.isArray(data.registrations)) {
              nextList = data.registrations;
            }
          }
        } catch (e) {}

        // Persist Drive links to Cloud Firestore and strip legacy inline base64 blobs
        for (const u of updates) {
          try {
            const { runnerId, ...fields } = u;
            const firestorePayload: any = cleanFirestoreData(fields);
            const orig = registrations.find((item) => item.id === runnerId);
            if (u.driveVoucherFileId && !u.driveVoucherFileId.startsWith('bridge_')) {
              if (orig?.voucherUrl?.startsWith('data:')) firestorePayload.voucherUrl = deleteField();
              if (orig?.paymentProofImage?.startsWith('data:')) firestorePayload.paymentProofImage = deleteField();
            }
            if (u.drivePhotoFileId && !u.drivePhotoFileId.startsWith('bridge_')) {
              if (orig?.personalPhotoUrl?.startsWith('data:')) firestorePayload.personalPhotoUrl = deleteField();
            }
            setDoc(doc(db, 'registrations', runnerId), firestorePayload, { merge: true }).catch(() => {});
          } catch (e) {}
        }

        onUpdateRegistrations(nextList);
        saveRegistrations(nextList);
        fetchStorageStats();
        setLiveNotice(`✓ ${uploadedFiles} archivo(s) respaldados en Google Drive en sus carpetas oficiales.`);
        setTimeout(() => setLiveNotice(null), 5000);
      }
    } catch (err: any) {
      if (err?.message === 'AUTH_EXPIRED') {
        setNeedsDriveAuth(true);
        setLiveNotice('La sesión de Google Drive expiró. Vuelve a iniciar sesión para continuar sincronizando.');
      } else {
        setLiveNotice(`❌ Error sincronizando con Google Drive: ${err?.message || 'Error desconocido'}`);
      }
      setTimeout(() => setLiveNotice(null), 5000);
    } finally {
      setIsSyncingDrive(false);
      setDriveSyncProgress(null);
    }
  };

  // Automatic Drive sync whenever Direct Bridge or Google OAuth is active & new unsynced media appears
  useEffect(() => {
    const canSync = !!bridgeUrl || !needsDriveAuth;
    if (!canSync || !autoSyncDrive || isSyncingDrive) return;
    const hasPendingMedia = registrations.some((r) => {
      const hasVoucher = !!(r.voucherUrl || r.paymentProofImage);
      const hasPhoto = !!r.personalPhotoUrl;
      return (hasVoucher && !r.driveVoucherFileId) || (hasPhoto && !r.drivePhotoFileId);
    });
    if (hasPendingMedia) {
      const timer = setTimeout(() => {
        syncPendingMediaToDrive(false);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [registrations, needsDriveAuth, autoSyncDrive, bridgeUrl]);

  const requestOverwriteResync = () => {
    const syncedCount = registrations.filter((r) => r.driveVoucherFileId || r.drivePhotoFileId).length;
    setConfirmActionModal({
      title: '¿Actualizar archivos existentes en Google Drive?',
      description: `Esta acción volverá a subir y actualizar ${syncedCount} registro(s) ya existentes en tus carpetas de Google Drive ("Constancias Yape" y "Fotos Atletas") y subirá los archivos pendientes.`,
      confirmLabel: 'Confirmar Actualización en Drive',
      onConfirm: async () => {
        await syncPendingMediaToDrive(true);
      },
    });
  };

  const requestCleanupLocalUploads = () => {
    const cleanableCount = storageStats?.cleanableLocalFiles || 0;
    if (cleanableCount === 0) return;
    setConfirmActionModal({
      title: '¿Liberar espacio del servidor para archivos ya respaldados en Drive?',
      description: `Se eliminarán ${cleanableCount} copia(s) local(es) del disco del servidor que YA están respaldadas de forma segura en tu Google Drive, manteniendo los enlaces de Drive en la base de datos para evitar cobros o llenado de almacenamiento.`,
      confirmLabel: 'Confirmar Limpieza de Servidor',
      onConfirm: async () => {
        const res = await fetch('/api/admin/drive-synced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: [], cleanupLocal: true }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.registrations)) {
            onUpdateRegistrations(data.registrations);
            saveRegistrations(data.registrations);
          }
          await fetchStorageStats();
          setLiveNotice(`✓ Espacio liberado: se eliminaron ${data.cleanedFiles || cleanableCount} copia(s) local(es) ya guardadas en Google Drive.`);
          setTimeout(() => setLiveNotice(null), 5000);
        }
      },
    });
  };



  const fetchLiveRegistrations = async () => {
    setIsRefreshing(true);
    loadAnalytics();
    let mergedList: RunnerRegistration[] = getStoredRegistrations();

    try {
      const res = await fetch('/api/registrations');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const serverList: RunnerRegistration[] = await res.json();
        if (Array.isArray(serverList) && serverList.length > 0) {
          mergedList = mergeRegistrationsLists(mergedList, serverList);
        }
      }
    } catch (err) {
      // Backend unavailable (Hostinger static hosting)
    }

    try {
      const cloudList = await fetchRegistrationsFirestore();
      const cloudSantaIds = new Set(
        cloudList.filter(isCloudSantaRunner).map((r) => r.id)
      );
      mergedList = mergedList.filter(
        (r) => !isCloudSantaRunner(r) || cloudSantaIds.has(r.id)
      );
      if (Array.isArray(cloudList) && cloudList.length > 0) {
        mergedList = mergeRegistrationsLists(mergedList, cloudList);
      }
    } catch (e) {}

    onUpdateRegistrations(mergedList);
    try {
      localStorage.setItem('ohana_registrations', JSON.stringify(mergedList));
    } catch (e) {}

    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    fetchLiveRegistrations();
    loadAnalytics();
    // Respaldo periódico cada 30s (las altas, pagos y eliminaciones llegan AL INSTANTE por onSnapshot en vivo)
    const intervalId = setInterval(() => {
      fetchLiveRegistrations();
      loadAnalytics();
    }, 30000);

    const handleCheckinEvent = (e: any) => {
      fetchLiveRegistrations();
      if (e?.detail) {
        setLiveNotice(`🎉 ¡${e.detail.firstName} ${e.detail.lastName} confirmó entrega de kit inicial en vivo!`);
        setTimeout(() => setLiveNotice(null), 5000);
      }
    };

    // BroadcastChannel listener for check-ins across browser windows/tabs on Hostinger
    let checkinChannel: BroadcastChannel | null = null;
    try {
      checkinChannel = new BroadcastChannel('ohana_checkin_channel');
      checkinChannel.onmessage = (event) => {
        if (event.data && event.data.runner) {
          fetchLiveRegistrations();
          setLiveNotice(`🎉 ¡${event.data.runner.firstName} ${event.data.runner.lastName} confirmó entrega de kit inicial en vivo!`);
          setTimeout(() => setLiveNotice(null), 5000);
        }
      };
    } catch (e) {}

    // Instant SSE listener for real-time check-in updates
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/admin/stream');
      eventSource.onmessage = (event) => {
        try {
          if (event.data && event.data.startsWith('{')) {
            const parsed = JSON.parse(event.data);
            if (parsed && parsed.type === 'checkin' && parsed.runner) {
              fetchLiveRegistrations();
              setLiveNotice(`🎉 ¡${parsed.runner.firstName} ${parsed.runner.lastName} confirmó entrega de kit inicial en vivo!`);
              setTimeout(() => setLiveNotice(null), 5000);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    // Real-time Cloud Firestore deletion listener
    let unsubDeleted: (() => void) | null = null;
    try {
      unsubDeleted = subscribeToDeletedRunnerIdsFirestore((deletedIds) => {
        if (!deletedIds.length) return;
        const deletedSet = new Set(deletedIds);
        const filtered = getStoredRegistrations().filter((r) => !deletedSet.has(r.id));
        onUpdateRegistrations(filtered);
        try {
          localStorage.setItem('ohana_registrations', JSON.stringify(filtered));
        } catch (e) {}
      });
    } catch (e) {}

    // Real-time Cloud Firestore collection listener (adds new inscriptions + syncs payments, photos, deletions & check-ins for Tarapoto & Rioja)
    let unsubFirestore: (() => void) | null = null;
    try {
      unsubFirestore = subscribeToRegistrationsCollection((cloudRunners) => {
        const cloudSantaIds = new Set(
          cloudRunners.filter(isCloudSantaRunner).map((r) => r.id)
        );
        const currentList = getStoredRegistrations().filter(
          (r) => !isCloudSantaRunner(r) || cloudSantaIds.has(r.id)
        );
        const updated = mergeRegistrationsLists(currentList, cloudRunners);
        onUpdateRegistrations(updated);
        try {
          localStorage.setItem('ohana_registrations', JSON.stringify(updated));
        } catch (e) {}
      });
    } catch (e) {}

    // Real-time Cloud Firestore analytics listener (visitas, Mi Espacio, secciones y actividad en vivo)
    let unsubAnalytics: (() => void) | null = null;
    try {
      unsubAnalytics = subscribeToAnalyticsFirestore((liveSummary) => {
        setAnalyticsData(liveSummary);
      });
    } catch (e) {}

    window.addEventListener('ohana-checkin', handleCheckinEvent);
    window.addEventListener('storage', fetchLiveRegistrations);
    return () => {
      clearInterval(intervalId);
      if (unsubFirestore) unsubFirestore();
      if (unsubDeleted) unsubDeleted();
      if (unsubAnalytics) unsubAnalytics();
      if (eventSource) eventSource.close();
      if (checkinChannel) checkinChannel.close();
      window.removeEventListener('ohana-checkin', handleCheckinEvent);
      window.removeEventListener('storage', fetchLiveRegistrations);
    };
  }, []);

  const handleToggleKitDelivery = async (runnerId: string, currentVal: boolean) => {
    const nextConfirmed = !currentVal;
    const nextTime = nextConfirmed ? new Date().toISOString() : undefined;
    const updated = registrations.map((r) =>
      r.id === runnerId
        ? {
            ...r,
            confirmedAtStart: nextConfirmed,
            startCheckinTime: nextTime,
          }
        : r
    );
    onUpdateRegistrations(updated);
    saveRegistrations(updated);

    const targetRunner = updated.find((r) => r.id === runnerId);
    if (targetRunner) {
      saveRegistrationFirestore(targetRunner).catch(() => {});
      try {
        fetch('/api/runner/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            runnerId,
            confirmedAtStart: nextConfirmed,
            startCheckinTime: nextTime || null,
          }),
        }).catch(() => {});
      } catch (e) {}
    }

    if (nextConfirmed) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleUpdatePaymentStatus = async (runner: RunnerRegistration, nextStatus: PaymentStatus) => {
    const updatedRunner: RunnerRegistration = {
      ...runner,
      paymentStatus: nextStatus,
    };
    const updatedList = registrations.map((r) =>
      r.id === runner.id ? updatedRunner : r
    );

    onUpdateRegistrations(updatedList);
    saveRegistrations(updatedList);
    if (viewingVoucherRunner && viewingVoucherRunner.id === runner.id) {
      setViewingVoucherRunner(updatedRunner);
    }

    saveRegistrationFirestore(updatedRunner).catch(() => {});

    try {
      await fetch('/api/runner/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: runner.id,
          paymentStatus: nextStatus,
        }),
      });
    } catch (e) {}

    if (nextStatus === 'Verificado') {
      setLiveNotice(`✓ Pago de ${runner.firstName} ${runner.lastName} marcado manualmente como VERIFICADO.`);
      try {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
      } catch (e) {}
    } else {
      setLiveNotice(`⏳ Pago de ${runner.firstName} ${runner.lastName} marcado como No Verificado.`);
    }
    setTimeout(() => setLiveNotice(null), 4500);
  };

  const handleRequestDeleteRunner = (runner: RunnerRegistration) => {
    setConfirmActionModal({
      title: `¿Eliminar inscripción de ${runner.firstName} ${runner.lastName}?`,
      description: `Se eliminará permanentemente el registro ${runner.id} (DNI: ${runner.documentNumber}) de la nómina, del almacenamiento local y de la nube. Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, Eliminar Inscrito',
      onConfirm: async () => {
        await deleteRegistrationEverywhere(runner.id);
        const nextList = registrations.filter((r) => r.id !== runner.id);
        onUpdateRegistrations(nextList);
        saveRegistrations(nextList);
        setLiveNotice(`🗑️ Inscrito eliminado: ${runner.firstName} ${runner.lastName} (${runner.id}).`);
        setTimeout(() => setLiveNotice(null), 4500);
      },
    });
  };

  // Per-edition metrics (Tarapoto 2026, Rioja 2026, Halloween Archive)
  const tarapotoRegistrations = registrations.filter(isTarapotoRunner);
  const riojaRegistrations = registrations.filter(isRiojaRunner);
  const halloweenRegistrations = registrations.filter((r) => !isCloudSantaRunner(r));
  const combinedSantaCount = tarapotoRegistrations.length + riojaRegistrations.length;

  const activeEditionRunners =
    filterEdition === 'santa-run-rioja-2026'
      ? riojaRegistrations
      : filterEdition === 'santa-run-2026'
        ? tarapotoRegistrations
        : filterEdition === 'halloween-5k-2026'
          ? halloweenRegistrations
          : registrations;

  const isViewingRioja = filterEdition === 'santa-run-rioja-2026';
  const isViewingHalloween = filterEdition === 'halloween-5k-2026';
  const santaTotalCount = activeEditionRunners.length;
  const santaKitsConfirmed = activeEditionRunners.filter((r) => r.confirmedAtStart).length;
  const santaKitsPending = santaTotalCount - santaKitsConfirmed;
  const santaPaymentsVerified = activeEditionRunners.filter((r) => r.paymentStatus === 'Verificado').length;
  const santaPaymentsPending = santaTotalCount - santaPaymentsVerified;
  const santaPhotosCount = activeEditionRunners.filter(
    (r) => !!(r.personalPhotoUrl || r.drivePhotoFileId || r.drivePhotoUrl)
  ).length;
  const santaVouchersCount = activeEditionRunners.filter(
    (r) => !!(r.voucherUrl || r.paymentProofImage || r.driveVoucherFileId || r.driveVoucherUrl)
  ).length;
  const santaDriveSyncedCount = activeEditionRunners.filter((r) => !!(r.driveVoucherFileId || r.drivePhotoFileId)).length;

  // General metrics calculation
  const totalCount = registrations.length;
  const checkinConfirmedCount = registrations.filter((r) => r.confirmedAtStart).length;
  const checkinPendingCount = totalCount - checkinConfirmedCount;
  const paymentVerifiedCount = registrations.filter((r) => r.paymentStatus === 'Verificado').length;
  const paymentPendingCount = totalCount - paymentVerifiedCount;

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    const query = searchTerm.toLowerCase().trim();
    const matchSearch =
      !query ||
      r.firstName.toLowerCase().includes(query) ||
      r.lastName.toLowerCase().includes(query) ||
      r.documentNumber.includes(query) ||
      r.whatsapp.includes(query) ||
      r.id.toLowerCase().includes(query) ||
      (r.city && r.city.toLowerCase().includes(query)) ||
      (r.raceCategory && r.raceCategory.toLowerCase().includes(query)) ||
      (r.department && r.department.toLowerCase().includes(query));

    // Attendance checkin filter
    const matchCheckin =
      filterCheckin === 'all' ||
      (filterCheckin === 'confirmed' && !!r.confirmedAtStart) ||
      (filterCheckin === 'pending' && !r.confirmedAtStart);

    // Payment verification filter
    const isVerified = r.paymentStatus === 'Verificado';
    const matchPayment =
      filterPayment === 'all' ||
      (filterPayment === 'verified' && isVerified) ||
      (filterPayment === 'pending' && !isVerified);

    // Edition filter (Tarapoto 2026 vs Rioja 2026 vs Halloween Archive)
    const matchEdition =
      filterEdition === 'all' ||
      (filterEdition === 'santa-run-2026' && isTarapotoRunner(r)) ||
      (filterEdition === 'santa-run-rioja-2026' && isRiojaRunner(r)) ||
      (filterEdition === 'halloween-5k-2026' && !isCloudSantaRunner(r));

    return matchSearch && matchCheckin && matchPayment && matchEdition;
  });

  // Sort registrations so active Santa Run entries appear first, newest on top
  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    const isCloudA = isCloudSantaRunner(a);
    const isCloudB = isCloudSantaRunner(b);
    if (isCloudA !== isCloudB) return isCloudA ? -1 : 1;

    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    const numA = a.registrationNumber || parseInt(a.id.replace(/\D/g, ''), 10) || 0;
    const numB = b.registrationNumber || parseInt(b.id.replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto text-neutral-100 flex flex-col min-h-screen selection:bg-red-600 selection:text-white">
      {/* Top Sticky Header Bar (Fluid page navigation) */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 shadow-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-red-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-red-500/30 shadow-sm"
              title="Volver a la página principal de la carrera"
            >
              <ArrowLeft className="w-4 h-4 text-red-400" />
              <span>Volver a la Web</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase leading-none">
                  Panel{' '}
                  <span className={isViewingRioja ? 'text-amber-400' : 'text-red-500'}>
                    {isViewingRioja
                      ? 'Santa Run Rioja'
                      : isViewingHalloween
                        ? 'Archivo Halloween'
                        : 'Santa Run Tarapoto'}
                  </span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider border hidden sm:inline-block ${
                    isViewingRioja
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-red-950/80 text-red-400 border-red-500/40'
                  }`}
                >
                  {isViewingRioja ? 'Sede Rioja · Sacha Runners' : 'Sede Tarapoto · 6K'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5 hidden md:block">
                Tarapoto: <strong className="text-red-400">{tarapotoRegistrations.length}</strong> · Rioja:{' '}
                <strong className="text-amber-400">{riojaRegistrations.length}</strong> inscritos en vivo
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* LECTOR QR DE CONTROL DE ATLETAS */}
            <button
              onClick={() => setShowStaffScanner(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-white rounded-xl text-xs font-black transition shadow-lg cursor-pointer hover:scale-[1.02] ${
                isViewingRioja
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 text-neutral-950 shadow-amber-600/25 ring-2 ring-amber-400/60'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 shadow-red-600/30 ring-2 ring-red-500/60'
              }`}
              title="Abrir lector QR con la cámara del celular para acreditar atleta y entregar kit"
            >
              <Camera className="w-4 h-4" />
              <span>📷 Lector QR Atletas</span>
            </button>

            {/* DESCARGA DE REPORTES */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-xl text-xs font-black transition border border-amber-500/40 shadow-sm cursor-pointer hover:scale-[1.02]"
              title="Descargar Excel y reportes por separado de Tarapoto y Rioja"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>📥 Reportes & Excel</span>
            </button>

            {/* Sorteos exclusivos Tarapoto (ocultos en Panel Rioja para mantenerlo limpio) */}
            {!isViewingRioja && (
              <>
                <button
                  onClick={() => setShowTurkeyLottery(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black transition border border-neutral-700 shadow cursor-pointer"
                  title="Girar la Tómbola Digital del Sorteo del Pavo Santa Run Tarapoto 2026"
                >
                  <Gift className="w-4 h-4 text-amber-300" />
                  <span>🦃 Sorteo Pavo</span>
                </button>

                <button
                  onClick={() => setShowRouletteModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-xl text-xs font-black transition border border-neutral-700 shadow cursor-pointer"
                  title="Controlar y Girar Ruleta de Sorteos en Vivo (25 Premios)"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>🎡 25 Premios</span>
                </button>
              </>
            )}

            {/* Kit Delivery QR Projector Button */}
            <button
              onClick={() => setShowStartQRModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition shadow cursor-pointer border border-neutral-700"
              title="Mostrar y proyectar QR oficial de entrega de kit"
            >
              <QrCode className="w-4 h-4 text-red-400" />
              <span>Proyectar QR</span>
            </button>

            {/* Live refresh */}
            <button
              onClick={fetchLiveRegistrations}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer border border-neutral-700"
              title="Sincronizar participantes en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-red-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                adminLogout();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-semibold transition border border-red-500/30 cursor-pointer"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Fluid Content (Smooth downward scrolling, no trapped modal borders) */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-1">
        {/* Live Notice Banner */}
        {liveNotice && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-neutral-900 to-red-950/90 border-2 border-red-500 text-red-200 text-xs font-bold flex items-center justify-between shadow-xl shadow-red-500/20 animate-pulse">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-sm">{liveNotice}</span>
            </div>
            <button
              onClick={() => setLiveNotice(null)}
              className="text-red-400 hover:text-white p-1 rounded-lg hover:bg-red-900/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs between Roster & Analytics */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveAdminTab('roster')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'roster'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Control de Atletas ({combinedSantaCount})</span>
            </button>

            <button
              onClick={() => {
                setActiveAdminTab('analytics');
                loadAnalytics();
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'analytics'
                  ? 'bg-neutral-800 text-red-400 border border-red-500/50 font-black shadow-lg shadow-red-600/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-red-400" />
              <span>Métricas & Tráfico en Vivo</span>
              {analyticsData && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-950 text-red-200 text-[10px] border border-red-500/40 font-mono">
                  {analyticsData.totalPageViews} visitas
                </span>
              )}
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer bg-neutral-900 text-amber-300 hover:text-white hover:bg-neutral-800 border border-amber-500/40 shadow-sm"
              title="Descargar reportes y respaldos de Santa Run 2026"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Reportes & Backup</span>
            </button>

            <button
              onClick={() => {
                if (isViewingRioja) {
                  exportRiojaXLSX(registrations);
                  setLiveNotice('✓ Archivo Excel de Santa Run Rioja 2026 (.xlsx) descargado.');
                } else {
                  exportTarapotoXLSX(registrations);
                  setLiveNotice('✓ Archivo Excel de Santa Run Tarapoto 2026 (.xlsx) descargado.');
                }
                setTimeout(() => setLiveNotice(null), 4000);
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40"
              title={
                isViewingRioja
                  ? 'Descargar Excel (.xlsx) exclusivo de Santa Run Rioja 2026'
                  : 'Descargar Excel (.xlsx) exclusivo de Santa Run Tarapoto 2026'
              }
            >
              <Download className="w-4 h-4 text-white" />
              <span>{isViewingRioja ? 'Excel Rioja (.xlsx)' : 'Excel Tarapoto (.xlsx)'}</span>
            </button>
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-3">
            <span className="text-red-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Mostrando los más recientes primero
            </span>
          </div>
        </div>

        {activeAdminTab === 'analytics' ? (
          <AdminAnalyticsTab
            registrations={registrations}
            analyticsData={analyticsData}
            isLoading={isLoadingAnalytics}
            onRefresh={loadAnalytics}
            onResetAnalytics={handleResetAnalytics}
            initialEdition={filterEdition === 'santa-run-rioja-2026' ? 'santa-run-rioja-2026' : 'santa-run-2026'}
          />
        ) : (
          <>
            {/* 3-Way Sede Switcher Bar (Tarapoto 2026 | Rioja 2026 | Archivo Halloween) */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-lg">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterEdition('santa-run-2026')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer border ${
                    filterEdition === 'santa-run-2026'
                      ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Santa Run Tarapoto ({tarapotoRegistrations.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterEdition('santa-run-rioja-2026')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer border ${
                    filterEdition === 'santa-run-rioja-2026'
                      ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-lg shadow-amber-500/25'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-amber-300 hover:border-amber-500/40'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Santa Run Rioja ({riojaRegistrations.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterEdition('halloween-5k-2026')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer border ${
                    filterEdition === 'halloween-5k-2026'
                      ? 'bg-neutral-700 text-white border-neutral-500'
                      : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
                  }`}
                >
                  <span>Archivo Halloween ({halloweenRegistrations.length})</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-neutral-400 px-2">
                {isViewingRioja
                  ? 'Sede activa: Rioja · Dom 20 Dic · Kids 2K (S/ 25) & Libre 5K (S/ 35)'
                  : isViewingHalloween
                    ? 'Archivo histórico Halloween 5K'
                    : 'Sede activa: Tarapoto · Sáb 19 Dic · 6K (S/ 70 / S/ 59.50)'}
              </div>
            </div>

            {/* High-Impact Athletic Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Active Sede Inscriptions */}
              <div
                className={`bg-neutral-900 p-4 sm:p-5 rounded-2xl border-2 shadow-lg ${
                  isViewingRioja
                    ? 'border-amber-500/60 shadow-amber-500/10'
                    : 'border-red-500/60 shadow-red-500/10'
                }`}
              >
                <span
                  className={`text-[10px] uppercase font-bold block flex items-center gap-1.5 ${
                    isViewingRioja ? 'text-amber-400' : 'text-red-400'
                  }`}
                >
                  <Gift className={`w-3.5 h-3.5 ${isViewingRioja ? 'text-amber-400' : 'text-red-400'}`} />
                  {isViewingRioja
                    ? 'Santa Run Rioja 2026'
                    : isViewingHalloween
                      ? 'Archivo Halloween 5K'
                      : 'Santa Run Tarapoto 2026'}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span
                    className={`font-bebas text-3xl sm:text-4xl ${
                      isViewingRioja ? 'text-amber-400' : 'text-red-500'
                    }`}
                  >
                    {santaTotalCount}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {isViewingRioja ? 'inscritos (S/ 25 · S/ 35)' : isViewingHalloween ? 'registros' : 'inscritos (S/ 70)'}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between border-t border-neutral-800 pt-1">
                  <span>Kits entregados:</span>
                  <span className={`${isViewingRioja ? 'text-amber-400' : 'text-red-400'} font-mono font-bold`}>
                    {santaKitsConfirmed} / {santaTotalCount} ({santaKitsPending} pend.)
                  </span>
                </div>
              </div>

              {/* Pagos Yape (Verificación Manual) */}
              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-amber-500/50 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    💳 Pagos Yape · Verificación
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bebas text-3xl sm:text-4xl text-emerald-400">{santaPaymentsVerified}</span>
                    <span className="text-[11px] text-neutral-400">verificados</span>
                    <span className="text-neutral-600">·</span>
                    <span className="font-bebas text-2xl text-amber-400">{santaPaymentsPending}</span>
                    <span className="text-[11px] text-amber-300/80">por revisar</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterPayment(filterPayment === 'pending' ? 'all' : 'pending')}
                  className="mt-1 w-full text-left text-[10px] text-amber-300 font-bold hover:underline flex items-center justify-between pt-1 border-t border-neutral-800 cursor-pointer"
                >
                  <span>{filterPayment === 'pending' ? 'Mostrar todos los pagos' : 'Filtrar no verificados'}</span>
                  <span className="font-mono">→</span>
                </button>
              </div>

              {/* Fotos Marco & Vouchers */}
              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-blue-500/40 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    📷 Fotos Marco & Vouchers
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bebas text-3xl sm:text-4xl text-white">{santaPhotosCount}</span>
                    <span className="text-[11px] text-neutral-400">fotos marco</span>
                    <span className="text-neutral-600">·</span>
                    <span className="font-bebas text-2xl text-emerald-400">{santaVouchersCount}</span>
                    <span className="text-[11px] text-neutral-400">vouchers</span>
                  </div>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between border-t border-neutral-800 pt-1">
                  <span>Respaldados en Drive:</span>
                  <span className="text-blue-400 font-mono font-bold">{santaDriveSyncedCount} registros</span>
                </div>
              </div>

              {/* Descargas & Respaldo Oficial Directo */}
              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-800 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      Excel {isViewingRioja ? 'Rioja' : 'Tarapoto'}
                    </span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 font-mono font-bold">
                      .XLSX SEPARADO
                    </span>
                  </span>
                  <div className="text-xs text-neutral-300 mt-1 font-sans">
                    {isViewingRioja
                      ? `Solo participantes de Rioja (${riojaRegistrations.length})`
                      : `Solo participantes de Tarapoto (${tarapotoRegistrations.length})`}
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      if (isViewingRioja) {
                        exportRiojaXLSX(registrations);
                        setLiveNotice('✓ Excel Santa Run Rioja 2026 (.xlsx) descargado.');
                      } else {
                        exportTarapotoXLSX(registrations);
                        setLiveNotice('✓ Excel Santa Run Tarapoto 2026 (.xlsx) descargado.');
                      }
                      setTimeout(() => setLiveNotice(null), 4000);
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isViewingRioja ? 'Excel Rioja (.xlsx)' : 'Excel Tarapoto (.xlsx)'}</span>
                  </button>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full py-1 text-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold transition border border-neutral-700 cursor-pointer"
                  >
                    Descargar ambas sedes / CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Google Drive Auto-Organization & Server Storage Guard (Admin Panel Only) */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bebas text-xl text-white uppercase tracking-wide leading-none">
                        Google Drive Automático · {isViewingRioja ? 'Santa Run Rioja 2026' : 'Constancias Yape & Fotos'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                        ✓ Conectado Automáticamente ({driveUser?.email || 'Envío Directo Activo'})
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {isViewingRioja ? (
                        riojaDriveFolders.isDedicated ? (
                          <>
                            Enviando archivos de Rioja a tus <strong>2 carpetas dedicadas de Rioja</strong> como{' '}
                            <code className="text-amber-300">RIOJA - Nombre - Yape / Foto</code>.
                          </>
                        ) : (
                          <>
                            Clasificación automática activa: guarda cada archivo de Rioja con prefijo{' '}
                            <strong className="text-amber-300">RIOJA - Nombre - Yape / Foto</strong> en tus carpetas conectadas. Si deseas, también puedes asignar 2 carpetas aparte solo para Rioja abajo.
                          </>
                        )
                      ) : (
                        <>
                          Guarda automáticamente cada archivo en tus 2 carpetas oficiales de Google Drive: <strong>Constancias Yape</strong> y <strong>Fotos Atletas</strong> (nombradas con el nombre completo de cada corredor).
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Direct Auto-Sync Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-[11px] font-bold text-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncDrive}
                      onChange={(e) => setAutoSyncDrive(e.target.checked)}
                      className="rounded text-emerald-500 bg-neutral-800 border-neutral-600"
                    />
                    <span>Auto-subir a Drive</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => syncPendingMediaToDrive(false)}
                    disabled={isSyncingDrive}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <CloudUpload className={`w-4 h-4 ${isSyncingDrive ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingDrive ? 'Sincronizando...' : 'Subir Pendientes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={requestOverwriteResync}
                    disabled={isSyncingDrive}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition cursor-pointer"
                    title="Actualizar archivos existentes en Google Drive"
                  >
                    Actualizar Existentes
                  </button>
                </div>
              </div>

              {driveAuthError && (
                <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-bold text-red-300">Aviso de conexión Google Drive:</p>
                    <p className="leading-relaxed">{driveAuthError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDriveAuthError(null)}
                    className="text-red-400 hover:text-white p-1 rounded cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Optional 2 Dedicated Google Drive Folders Config for Rioja (Zero Apps Script edit needed) */}
              {isViewingRioja && (
                <div className="pt-2 border-t border-amber-500/20 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {riojaDriveFolders.isDedicated ? (
                        <>
                          <a
                            href={riojaDriveFolders.vouchersFolderUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 hover:bg-amber-900 font-bold text-[11px]"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Yape Rioja (Carpeta Dedicada)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={riojaDriveFolders.photosFolderUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 hover:bg-amber-900 font-bold text-[11px]"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Fotos Rioja (Carpeta Dedicada)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      ) : (
                        <span className="text-[11px] text-amber-300/90 font-mono">
                          Modo automático: los archivos de Rioja se clasifican con prefijo <strong>RIOJA - ...</strong>
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRiojaDriveConfig((v) => !v)}
                      className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-[11px] font-bold cursor-pointer transition"
                    >
                      {showRiojaDriveConfig
                        ? 'Ocultar configuración'
                        : riojaDriveFolders.isDedicated
                          ? 'Cambiar carpetas Drive Rioja'
                          : 'Usar 2 carpetas Drive aparte para Rioja'}
                    </button>
                  </div>

                  {showRiojaDriveConfig && (
                    <div className="p-3.5 rounded-xl bg-black/70 border border-amber-500/30 space-y-3 text-xs">
                      <p className="text-neutral-300 leading-relaxed">
                        Si creas 2 carpetas en tu Google Drive (ej. <strong>Yape Rioja</strong> y <strong>Fotos Rioja</strong>), pega sus enlaces aquí y guarda. Tu script actual ya soporta carpetas separadas sin tocar nada más. (Déjalos vacíos para volver al modo automático con prefijo <code className="text-amber-300">RIOJA -</code>).
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                            Enlace o ID carpeta Constancias Yape Rioja
                          </label>
                          <input
                            type="text"
                            value={riojaYapeFolderInput}
                            onChange={(e) => setRiojaYapeFolderInput(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                            Enlace o ID carpeta Fotos Atletas Rioja
                          </label>
                          <input
                            type="text"
                            value={riojaPhotosFolderInput}
                            onChange={(e) => setRiojaPhotosFolderInput(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isSavingRiojaFolders}
                          onClick={async () => {
                            setIsSavingRiojaFolders(true);
                            try {
                              const saved = await saveRiojaDriveFolders({
                                vouchersInput: riojaYapeFolderInput,
                                photosInput: riojaPhotosFolderInput,
                              });
                              setRiojaDriveFolders(saved);
                              setShowRiojaDriveConfig(false);
                              setLiveNotice(
                                saved.isDedicated
                                  ? '✓ Carpetas Google Drive dedicadas de Rioja guardadas en la nube.'
                                  : '✓ Rioja volvió a usar las carpetas generales con prefijo automático RIOJA -.'
                              );
                              setTimeout(() => setLiveNotice(null), 5000);
                            } finally {
                              setIsSavingRiojaFolders(false);
                            }
                          }}
                          className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer transition"
                        >
                          {isSavingRiojaFolders ? 'Guardando...' : 'Guardar Carpetas Rioja'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Drive folders quick links + Server Storage Usage */}
              <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  {driveFolders ? (
                    <>
                      {driveFolders.rootFolderId &&
                        driveFolders.rootFolderId !== driveFolders.vouchersFolderId &&
                        driveFolders.rootFolderId !== driveFolders.photosFolderId && (
                          <div className="inline-flex items-center rounded-lg bg-blue-950/60 border border-blue-500/40 overflow-hidden">
                            <a
                              href={driveFolders.rootFolderUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-blue-300 hover:bg-blue-900 font-bold transition"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Carpeta Principal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(driveFolders.rootFolderUrl);
                                setLiveNotice('✓ Link de Carpeta Principal copiado.');
                                setTimeout(() => setLiveNotice(null), 3000);
                              }}
                              className="px-2 py-1 border-l border-blue-500/30 text-blue-300 hover:bg-blue-900 cursor-pointer"
                              title="Copiar enlace de Carpeta Principal"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                      <div className="inline-flex items-center rounded-lg bg-emerald-950/70 border border-emerald-500/40 overflow-hidden">
                        <a
                          href={driveFolders.vouchersFolderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-emerald-300 hover:bg-emerald-900 font-bold transition"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Constancias Yape</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(driveFolders.vouchersFolderUrl);
                            setLiveNotice('✓ Link de Constancias Yape copiado.');
                            setTimeout(() => setLiveNotice(null), 3000);
                          }}
                          className="px-2 py-1 border-l border-emerald-500/30 text-emerald-300 hover:bg-emerald-900 cursor-pointer"
                          title="Copiar enlace de Constancias Yape"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="inline-flex items-center rounded-lg bg-amber-950/70 border border-amber-500/40 overflow-hidden">
                        <a
                          href={driveFolders.photosFolderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-amber-300 hover:bg-amber-900 font-bold transition"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Fotos Atletas (Con Nombres)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(driveFolders.photosFolderUrl);
                            setLiveNotice('✓ Link de Fotos Atletas copiado.');
                            setTimeout(() => setLiveNotice(null), 3000);
                          }}
                          className="px-2 py-1 border-l border-amber-500/30 text-amber-300 hover:bg-amber-900 cursor-pointer"
                          title="Copiar enlace de Fotos Atletas"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-neutral-400 font-mono">
                      📁 Haz clic en «Sign in with Google» arriba para crear las carpetas en tu Drive y ver sus links directos aquí.
                    </span>
                  )}
                  {driveSyncProgress && (
                    <span className="text-blue-300 font-mono font-bold animate-pulse">
                      • {driveSyncProgress}
                    </span>
                  )}
                </div>

                {/* Server Disk Safeguard Indicator */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Servidor: <strong className="text-white">{storageStats?.totalMB ?? 0} MB</strong> / {storageStats?.maxBudgetMB ?? 200} MB
                    </span>
                    <span className="text-neutral-500">
                      ({storageStats?.vouchersCount ?? 0} vouchers · {storageStats?.photosCount ?? 0} fotos)
                    </span>
                  </div>

                  {(storageStats?.cleanableLocalFiles || 0) > 0 && (
                    <button
                      type="button"
                      onClick={requestCleanupLocalUploads}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-500/40 font-bold transition cursor-pointer"
                      title="Eliminar del servidor los archivos que ya están respaldados en Google Drive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Liberar {storageStats?.cleanableLocalFiles} copia(s) ya en Drive</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[280px] max-w-lg">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, DNI, celular, ciudad o ID..."
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition text-xs"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Kit Delivery Filter */}
                  <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    <button
                      onClick={() => setFilterCheckin('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        filterCheckin === 'all'
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Todos ({santaTotalCount})
                    </button>
                    <button
                      onClick={() => setFilterCheckin('confirmed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        filterCheckin === 'confirmed'
                          ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-400 shadow-sm shadow-emerald-500/20'
                          : 'text-neutral-400 hover:text-emerald-300'
                      }`}
                      title="Mostrar participantes con kit entregado"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>✓ Kit Entregado ({santaKitsConfirmed})</span>
                    </button>
                    <button
                      onClick={() => setFilterCheckin('pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        filterCheckin === 'pending'
                          ? 'bg-amber-950 border border-amber-500/60 text-amber-400 shadow-sm shadow-amber-500/20'
                          : 'text-neutral-400 hover:text-amber-300'
                      }`}
                      title="Mostrar participantes pendientes de entrega de kit"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>⏳ Pendiente de Kit ({santaKitsPending})</span>
                    </button>
                  </div>

                  {/* Payment Verification Filter */}
                  <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    <button
                      onClick={() => setFilterPayment('all')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        filterPayment === 'all'
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Pagos: Todos
                    </button>
                    <button
                      onClick={() => setFilterPayment('verified')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        filterPayment === 'verified'
                          ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-400 shadow-sm'
                          : 'text-neutral-400 hover:text-emerald-300'
                      }`}
                    >
                      <span>✓ Verificados ({santaPaymentsVerified})</span>
                    </button>
                    <button
                      onClick={() => setFilterPayment('pending')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        filterPayment === 'pending'
                          ? 'bg-amber-950 border border-amber-500/60 text-amber-300 shadow-sm'
                          : 'text-neutral-400 hover:text-amber-300'
                      }`}
                    >
                      <span>⏳ No Verificados ({santaPaymentsPending})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

        {/* Official Participant Table (Sorted most recent first) */}
        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              <h3 className="font-bebas text-2xl text-white uppercase tracking-wide">
                Nómina Oficial de Participantes ({sortedRegistrations.length})
              </h3>
            </div>
            <span className="text-xs text-red-400 font-mono font-bold flex items-center gap-1">
              ⚡ Más recientes arriba
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-3">N°</th>
                  <th className="py-3.5 px-3">Atleta & ID Oficial</th>
                  <th className="py-3.5 px-3">DNI & Celular</th>
                  <th className="py-3.5 px-3">{isViewingRioja ? 'Categoría & Kit Rioja' : 'Polo & Kit Navideño'}</th>
                  <th className="py-3.5 px-3">{isViewingRioja ? 'Inversión & Alianza' : 'Inversión & Sorteo Pavo'}</th>
                  <th className="py-3.5 px-3 text-right">Edición / Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {sortedRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500 text-sm">
                      No se encontraron participantes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  sortedRegistrations.map((runner, index) => {
                    const runnerIsRioja = isRiojaRunner(runner);
                    const runnerIsTarapoto = isTarapotoRunner(runner);
                    const isRunVirtual = runner.modality === 'Virtual';
                    const riojaPrice = runner.raceCategory === 'Kids 2K' ? 25.0 : 35.0;
                    const displayAmount = runner.amountPaid
                      ? Number(runner.amountPaid).toFixed(2)
                      : runnerIsRioja
                        ? riojaPrice.toFixed(2)
                        : runnerIsTarapoto
                          ? (runner.hasPreviousDiscount ? '59.50' : '70.00')
                          : '50.00';

                    return (
                      <tr key={runner.id} className="hover:bg-neutral-800/50 transition">
                        {/* Correlative index */}
                        <td className="py-3.5 px-3 font-mono font-bold text-neutral-400 text-xs">
                          {index + 1}
                        </td>

                        {/* Participant Name & Official IDs */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white text-sm">
                            {runner.firstName} {runner.lastName}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                            {runnerIsRioja ? (
                              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-500/50 shadow-sm">
                                {runner.id}
                              </span>
                            ) : runnerIsTarapoto ? (
                              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-red-950/90 text-red-400 border border-red-500/50 shadow-sm">
                                {runner.id.startsWith('SR-') ? runner.id : `SR-${runner.id}`}
                              </span>
                            ) : (
                              <span className="font-mono text-neutral-300 font-bold">{runner.id}</span>
                            )}
                            {runner.city && (
                              <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 rounded">
                                {runner.city}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* DNI & Phone */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {runner.documentNumber.includes('Pendiente') ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40">
                                ⚠️ Sin DNI (Ingresó correo)
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-amber-300 text-xs">
                                {runner.documentType || 'DNI'}: {runner.documentNumber}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditRunnerModal(runner)}
                              className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition cursor-pointer"
                              title="Editar datos completos de este corredor"
                            >
                              <Pencil className="w-3 h-3 text-neutral-400 hover:text-red-400" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <a
                              href={`https://wa.me/51${runner.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition font-mono"
                              title="Contactar por WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{runner.whatsapp}</span>
                            </a>
                            {runner.email && (
                              <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[120px]" title={runner.email}>
                                • {runner.email}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Talla Polo / Categoría Rioja & Kit Navideño */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {runnerIsRioja ? (
                              <>
                                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono font-bold text-xs border border-amber-500/50">
                                  {runner.raceCategory === 'Kids 2K' ? 'Kids 2K' : 'Libre 5K'}
                                </span>
                                <span className="text-[10px] text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
                                  + Kit Rioja & Show
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="px-2 py-0.5 rounded bg-neutral-800 text-white font-mono font-bold text-xs border border-neutral-700">
                                  Polo: {runner.tShirtSize || 'M'}
                                </span>
                                {runnerIsTarapoto && (
                                  <span className="text-[10px] text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500/40">
                                    + Gorra + Mochila
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <div className="mt-1">
                            {runner.confirmedAtStart ? (
                              <button
                                onClick={() => handleToggleKitDelivery(runner.id, true)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer border bg-emerald-950/90 text-emerald-400 border-emerald-500/60 hover:bg-red-950/70 hover:text-red-300 shadow-sm"
                                title="Kit entregado. Clic para desmarcar."
                              >
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Kit Entregado</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleKitDelivery(runner.id, false)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer border bg-neutral-800 text-amber-300 border-neutral-700 hover:border-red-500 hover:text-white"
                                title="Marcar entrega de kit"
                              >
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Entregar Kit</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Inversión & Ticket / Alianza & Voucher */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">
                              S/ {displayAmount}
                            </span>
                            {runner.hasPreviousDiscount && !runnerIsRioja && (
                              <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-500/40 font-bold">
                                15% OHANA
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                            {runnerIsRioja ? (
                              <span className="text-amber-300">Alianza Sacha Runners</span>
                            ) : runnerIsTarapoto ? (
                              <span>🦃 {runner.turkeyRaffleTicket || `PAVO-${String(runner.registrationNumber || 1).padStart(4, '0')}`}</span>
                            ) : (
                              <span className="text-neutral-400">Método: {runner.paymentMethod || 'Yape'}</span>
                            )}
                          </div>
                          {/* Manual Payment Verification & Voucher Button */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {runner.paymentStatus === 'Verificado' ? (
                              <button
                                onClick={() => handleUpdatePaymentStatus(runner, 'No Verificado')}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-950/90 text-emerald-400 border border-emerald-500/60 hover:bg-amber-950/70 hover:text-amber-300 hover:border-amber-500/60 transition cursor-pointer shadow-sm"
                                title="Pago Verificado. Clic para cambiar manualmente a No Verificado"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Verificado</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdatePaymentStatus(runner, 'Verificado')}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/60 hover:bg-emerald-600 hover:text-white hover:border-emerald-400 transition cursor-pointer shadow-sm"
                                title="No verificado aún. Clic para marcar manualmente como Verificado al confirmar su constancia o WhatsApp"
                              >
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>No Verificado • Verificar</span>
                              </button>
                            )}

                            {runner.paymentProofImage || runner.voucherUrl || runner.driveVoucherFileId || runner.driveVoucherUrl ? (
                              <button
                                onClick={() => {
                                  setVoucherModalImgError(false);
                                  setViewingVoucherRunner(runner);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-neutral-800 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-950 transition cursor-pointer shadow-sm"
                                title="Observar comprobante del voucher Yape"
                              >
                                <ImageIcon className="w-3 h-3 text-emerald-400" />
                                <span>🧾 Ver Voucher{runner.driveVoucherFileId ? ' (Drive ✓)' : ''}</span>
                              </button>
                            ) : (
                              <a
                                href={`https://wa.me/51${runner.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  runnerIsRioja
                                    ? `Hola ${runner.firstName}, te saludamos de la organización de Santa Run Rioja 2026 (OHANA GO & Sacha Runners). Por favor envíanos la captura de tu voucher Yape para validar tu inscripción oficial.`
                                    : `Hola ${runner.firstName}, te saludamos de la organización de Santa Run Tarapoto 2026. Por favor envíanos la captura de tu voucher Yape para validar tu inscripción oficial.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-amber-300 font-mono transition"
                                title="Sin voucher adjunto. Clic para pedir constancia por WhatsApp"
                              >
                                <span>Sin voucher</span>
                                <span className="text-amber-400 font-bold">• WhatsApp</span>
                              </a>
                            )}

                            {(runner.personalPhotoUrl || runner.drivePhotoFileId || runner.drivePhotoUrl) && (
                              <button
                                onClick={() => {
                                  setPhotoModalImgError(false);
                                  setViewingPhotoRunner(runner);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-500/40 hover:bg-amber-900 transition cursor-pointer shadow-sm"
                                title="Ver y descargar foto personal del corredor para su marco"
                              >
                                <Camera className="w-3 h-3 text-amber-400" />
                                <span>📷 Foto Marco{runner.drivePhotoFileId ? ' (Drive ✓)' : ''}</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Edición / Registro */}
                        <td className="py-3.5 px-3 text-right">
                          <div>
                            {runnerIsRioja ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-950/90 text-amber-300 border border-amber-500/50 shadow-sm">
                                Santa Run Rioja
                              </span>
                            ) : runnerIsTarapoto ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-950/80 text-red-400 border border-red-500/40 shadow-sm">
                                Santa Run Tarapoto
                              </span>
                            ) : isRunVirtual ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                                Virtual 5K
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                                Halloween 5K
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {runner.createdAt ? new Date(runner.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </div>
                          <div className="mt-1.5 flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditRunnerModal(runner)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 transition cursor-pointer"
                              title={`Editar datos de ${runner.firstName} ${runner.lastName}`}
                            >
                              <Pencil className="w-3 h-3 text-amber-400" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRequestDeleteRunner(runner)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-950/50 hover:bg-red-700 text-red-300 hover:text-white border border-red-500/30 transition cursor-pointer"
                              title={`Eliminar inscripción de ${runner.firstName} ${runner.lastName}`}
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Modal: Runner Scanned Profile Card (Staff Scanned runner via Camera or DNI search) */}
      {scannedRunnerModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-red-500 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setScannedRunnerModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-neutral-800 pb-3">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-red-600/30">
                🏃
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-500/40">
                  Participante Identificado
                </span>
                <h4 className="font-bebas text-3xl text-white uppercase mt-0.5 leading-none">
                  {scannedRunnerModal.firstName} {scannedRunnerModal.lastName}
                </h4>
                <p className="text-xs text-neutral-400">
                  DNI: <strong className="text-red-400 font-mono">{scannedRunnerModal.documentNumber}</strong> • Código: <strong className="text-white font-mono">{scannedRunnerModal.id}</strong>
                </p>
              </div>
            </div>

            {/* Runner quick details (No tallas) */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Modalidad</span>
                <span className="font-bold text-white">{scannedRunnerModal.modality || 'Presencial 5K'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">WhatsApp</span>
                <span className="font-bold text-emerald-400 font-mono">{scannedRunnerModal.whatsapp}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Ubicación</span>
                <span className="font-bold text-white">{scannedRunnerModal.city}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">DNI</span>
                <span className="font-bold text-red-400 font-mono">
                  {scannedRunnerModal.documentNumber}
                </span>
              </div>
            </div>

            {/* Single Prominent Action: Confirm Kit Delivery */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-red-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">Entrega de Kit Inicial</span>
                  <span className="text-xs text-neutral-400">
                    {scannedRunnerModal.confirmedAtStart ? '✓ Kit inicial ya entregado' : 'Pendiente de entrega en mesa de acreditación'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const newVal = !scannedRunnerModal.confirmedAtStart;
                    await handleToggleKitDelivery(scannedRunnerModal.id, scannedRunnerModal.confirmedAtStart || false);
                    setScannedRunnerModal((prev) => prev ? { ...prev, confirmedAtStart: newVal, startCheckinTime: newVal ? new Date().toISOString() : undefined } : null);
                  }}
                  className={`px-4 py-2 rounded-xl font-bebas text-base uppercase transition cursor-pointer font-black ${
                    scannedRunnerModal.confirmedAtStart
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      : 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/30'
                  }`}
                >
                  {scannedRunnerModal.confirmedAtStart ? '✓ Kit Entregado' : 'Entregar Kit Inicial'}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setScannedRunnerModal(null)}
                className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Official Kit Delivery Check-in QR (For Aviación Accreditation Desk) */}
      {showStartQRModal && (
        <div className={`fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl overflow-y-auto ${isFullScreenQR ? 'p-0' : ''}`}>
          <div className={`relative w-full ${isFullScreenQR ? 'h-full max-w-none rounded-none p-6 sm:p-10 flex flex-col justify-between' : 'max-w-2xl rounded-3xl p-6'} bg-neutral-900 border border-red-500/50 shadow-[0_0_60px_rgba(212,36,38,0.3)] transition-all`}>
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bebas text-xl font-black shadow-md shadow-red-600/30">
                  🏁
                </div>
                <div>
                  <h4 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase leading-tight">
                    Mesa de Acreditación • <span className="text-red-400">QR Entrega de Kit Inicial</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Tarapoto • Control Oficial de Acreditación
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullScreenQR(!isFullScreenQR)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                  title={isFullScreenQR ? 'Salir de pantalla completa' : 'Modo pantalla gigante / tablet'}
                >
                  {isFullScreenQR ? <Minimize2 className="w-5 h-5 text-red-400" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    setShowStartQRModal(false);
                    setIsFullScreenQR(false);
                  }}
                  className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live Progress Banner */}
            <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-neutral-950 to-neutral-950 border border-red-500/40">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-red-400" />
                  Kits Entregados en Tiempo Real:
                </span>
                <span className="font-mono text-white text-sm">
                  {santaKitsConfirmed} de {santaTotalCount} ({Math.round((santaKitsConfirmed / (santaTotalCount || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((santaKitsConfirmed / (santaTotalCount || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Center: Giant High-Contrast QR Code */}
            <div className="flex flex-col items-center justify-center my-2 text-center">
              <div className="p-4 sm:p-6 bg-white rounded-3xl shadow-2xl border-4 border-red-500/80 max-w-[320px] sm:max-w-[380px] w-full flex items-center justify-center transition-transform hover:scale-[1.02]">
                {startQrDataUrl ? (
                  <img
                    src={startQrDataUrl}
                    alt="Código QR Entrega de Kit OHANA GO 5K"
                    className="w-full h-auto object-contain aspect-square"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-neutral-400 text-xs">
                    Generando código QR...
                  </div>
                )}
              </div>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider">
                QR Oficial Entrega de Kit • Aviación
              </div>
              <p className="text-xs text-neutral-300 max-w-lg mt-2 leading-relaxed">
                Este código QR se ubica en la carpa de acreditación. Los atletas lo escanean con su cámara desde <strong>Mi Espacio 🎒</strong> para confirmar la entrega de su kit inicial en vivo.
              </p>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStaffScanner(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-red-600/30"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>Escanear Corredor con la Cámara</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow && startQrDataUrl) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>QR Entrega de Kit - OHANA GO 5K Tarapoto</title>
                            <style>
                              body { font-family: sans-serif; text-align: center; padding: 40px; background: #000; color: #fff; }
                              h1 { font-size: 38px; margin: 0; color: #ef4444; text-transform: uppercase; }
                              h2 { font-size: 20px; color: #fff; margin: 5px 0 25px 0; font-weight: normal; }
                              .qr-box { background: #fff; padding: 20px; border-radius: 20px; display: inline-block; border: 4px solid #ef4444; }
                              img { width: 380px; height: 380px; display: block; }
                              p { font-size: 18px; margin-top: 25px; color: #e5e5e5; }
                              .badge { background: #dc2626; color: #fff; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase; }
                            </style>
                          </head>
                          <body>
                            <span class="badge">Acreditación Oficial</span>
                            <h1>OHANA GO SANTA RUN 2026</h1>
                            <h2>Aviación • Control de Acreditación</h2>
                            <div class="qr-box">
                              <img src="${startQrDataUrl}" />
                            </div>
                            <p><strong>Apunta con la cámara de tu celular para confirmar la entrega de tu Kit Inicial</strong></p>
                            <script>window.onload = function() { window.print(); }<\/script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bebas text-base uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/30"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Cartel de Acreditación
                </button>

                {/* Download High-Res QR Button */}
                {startQrDataUrl && (
                  <a
                    href={startQrDataUrl}
                    download="QR_Entrega_Kit_Ohana_Tarapoto_5K.png"
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-red-400 hover:text-white font-bebas text-base uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer border border-red-500/40 shadow-md"
                    title="Descargar imagen oficial del código QR en formato PNG para imprimir"
                  >
                    <Download className="w-4 h-4 text-red-400" />
                    Descargar QR (PNG)
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Scanner Modal */}
      {showStaffScanner && (
        <QRScannerModal
          title="Acreditación de Corredor • Entrega de Kit"
          subtitle="Apunta la cámara al código del participante o ingresa su DNI."
          expectedType="any"
          allowManualInput={true}
          onScanSuccess={async (scannedText) => {
            setShowStaffScanner(false);
            try {
              const checkData = await processStartCheckinSafe({
                runnerId: scannedText,
                dni: scannedText,
                code: scannedText,
                token: 'ADMIN_CHECKIN_OVERRIDE',
              });
              if (checkData.success && checkData.runner) {
                const updatedList = registrations.map((r) =>
                  r.id === checkData.runner!.id ? checkData.runner! : r
                );
                onUpdateRegistrations(updatedList);
                saveRegistrations(updatedList);
                setScannedRunnerModal(checkData.runner);
                setLiveNotice(`🎉 ¡${checkData.runner.firstName} ${checkData.runner.lastName} (DNI: ${checkData.runner.documentNumber}) kit entregado y asistencia confirmada!`);
                try {
                  confetti({ particleCount: 110, spread: 70, origin: { y: 0.6 } });
                } catch (e) {}
                setTimeout(() => setLiveNotice(null), 6000);
              } else {
                setLiveNotice(`❌ ${checkData.error || 'No se encontró un competidor registrado con ese código.'}`);
                setTimeout(() => setLiveNotice(null), 5000);
              }
            } catch (err) {
              setLiveNotice('❌ Error al procesar acreditación.');
              setTimeout(() => setLiveNotice(null), 4000);
            }
          }}
          onClose={() => setShowStaffScanner(false)}
        />
      )}
      {/* Modal: Edit Runner Full Profile (Syncs live to Cloud Firestore) */}
      {editingRunner && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-red-500 rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditingRunner(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="font-bebas text-2xl text-white uppercase mb-0.5">
              Editar Datos del Participante
            </h4>
            <p className="text-xs text-neutral-400 mb-4 font-mono">
              {editingRunner.id} • Los cambios se guardan en vivo en la base de datos.
            </p>

            <form onSubmit={handleSaveRunnerEdit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFirstNameValue}
                    onChange={(e) => setEditFirstNameValue(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={editLastNameValue}
                    onChange={(e) => setEditLastNameValue(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Documento (DNI / CE / Pasaporte) *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    maxLength={12}
                    value={editDniValue}
                    onChange={(e) => setEditDniValue(e.target.value.trim())}
                    placeholder="Ej: 73017454"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhoneValue}
                    onChange={(e) => setEditPhoneValue(e.target.value)}
                    placeholder="Ej: 993778180"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Edad
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={95}
                    value={editAgeValue}
                    onChange={(e) => setEditAgeValue(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                {isRiojaRunner(editingRunner) ? (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1">
                      Categoría Rioja
                    </label>
                    <select
                      value={editRaceCategoryValue}
                      onChange={(e) => setEditRaceCategoryValue(e.target.value as 'Kids 2K' | 'Libre 5K')}
                      className="w-full bg-neutral-950 border border-amber-500/50 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    >
                      <option value="Kids 2K">Kids 2K (S/ 25)</option>
                      <option value="Libre 5K">Libre 5K (S/ 35)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                      Talla de Polo
                    </label>
                    <select
                      value={editTShirtSizeValue}
                      onChange={(e) => setEditTShirtSizeValue(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                )}

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Estado Pago
                  </label>
                  <select
                    value={editPaymentStatusValue}
                    onChange={(e) => setEditPaymentStatusValue(e.target.value as PaymentStatus)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="No Verificado">No Verificado</option>
                    <option value="Verificado">Verificado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                  Referencia / N° Operación Yape
                </label>
                <input
                  type="text"
                  value={editPaymentRefValue}
                  onChange={(e) => setEditPaymentRefValue(e.target.value)}
                  placeholder="Ej: YAPE-198274"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingRunner(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editFirstNameValue.trim() || !editLastNameValue.trim() || editDniValue.trim().length < 6}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bebas text-lg uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingEdit ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Voucher / Constancia de Pago Yape */}
      {viewingVoucherRunner && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setViewingVoucherRunner(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  Constancia de Pago Oficial (Yape)
                </span>
                <h4 className="font-bebas text-2xl text-white uppercase mt-1 leading-tight">
                  {viewingVoucherRunner.firstName} {viewingVoucherRunner.lastName}
                </h4>
                <p className="text-xs text-neutral-400">
                  DNI: <strong className="text-white font-mono">{viewingVoucherRunner.documentNumber}</strong> • ID: <strong className="text-red-400 font-mono">{viewingVoucherRunner.id}</strong> • Monto: <strong className="text-amber-400 font-mono">S/ {Number(viewingVoucherRunner.amountPaid || 70).toFixed(2)}</strong>
                </p>
                {viewingVoucherRunner.paymentReference && (
                  <p className="text-[11px] text-neutral-300 font-mono mt-0.5">
                    Ref. Operación: <strong className="text-white">{viewingVoucherRunner.paymentReference}</strong>
                  </p>
                )}
              </div>

              <div>
                {viewingVoucherRunner.paymentStatus === 'Verificado' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/50">
                    <CheckCircle2 className="w-4 h-4" />
                    Pago Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                    <Clock className="w-4 h-4" />
                    No Verificado
                  </span>
                )}
              </div>
            </div>

            {/* Image display */}
            {(() => {
              const voucherPreviewSrc = getDriveImagePreviewUrl(
                viewingVoucherRunner.driveVoucherFileId,
                viewingVoucherRunner.voucherUrl || viewingVoucherRunner.paymentProofImage
              );
              const voucherDriveLink = getDriveFileLink(
                viewingVoucherRunner.driveVoucherFileId,
                viewingVoucherRunner.driveVoucherUrl,
                viewingVoucherRunner.voucherUrl || viewingVoucherRunner.paymentProofImage
              );
              return (
                <>
                  <div className="rounded-2xl overflow-hidden bg-black border border-neutral-800 min-h-[220px] max-h-[60vh] flex items-center justify-center p-2">
                    {voucherPreviewSrc && !voucherModalImgError ? (
                      <img
                        src={voucherPreviewSrc}
                        alt={`Voucher de ${viewingVoucherRunner.firstName}`}
                        onError={() => setVoucherModalImgError(true)}
                        className="max-h-[58vh] w-auto max-w-full object-contain rounded-xl"
                      />
                    ) : voucherDriveLink ? (
                      <div className="py-10 px-4 text-center space-y-3">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                        <p className="text-xs text-neutral-300 font-semibold max-w-xs mx-auto">
                          ✓ Voucher guardado directamente en tu carpeta oficial de Google Drive (0 MB en la web).
                        </p>
                        <a
                          href={voucherDriveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Abrir Voucher Original en Google Drive</span>
                        </a>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-neutral-500 text-xs">
                        No hay imagen disponible para este comprobante.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                    <div className="flex flex-wrap items-center gap-2">
                      {viewingVoucherRunner.paymentStatus === 'Verificado' ? (
                        <button
                          type="button"
                          onClick={() => handleUpdatePaymentStatus(viewingVoucherRunner, 'No Verificado')}
                          className="px-3.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Marcar No Verificado</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdatePaymentStatus(viewingVoucherRunner, 'Verificado')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ Verificar Pago</span>
                        </button>
                      )}

                      {voucherDriveLink && (
                        <a
                          href={voucherDriveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Ver en Drive</span>
                        </a>
                      )}
                    </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/51${viewingVoucherRunner.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-neutral-800 text-emerald-400 text-xs font-bold hover:bg-neutral-700 transition flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingVoucherRunner(null)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal: Descargas Oficiales & Sincronización Google Drive */}
      {showExportModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-neutral-900 border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-500/40">
                Excel & Descargas por Sede
              </span>
              <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase mt-1 leading-none">
                Descargar Excel por Separado · Tarapoto y Rioja
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Descarga la nómina oficial de participantes de cada ciudad en su propio archivo Excel (.xlsx) o CSV.
              </p>
            </div>

            {/* Section 1: Santa Run Tarapoto 2026 */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-red-500/40 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bebas text-xl text-red-400 uppercase tracking-wide flex items-center gap-2">
                  <span>Santa Run Tarapoto 2026</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold">
                  {tarapotoRegistrations.length} inscritos
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Archivo exclusivo de Tarapoto con IDs `SR-2026`, tallas de polo, montos (S/ 70 / S/ 59.50), ticket del pavo, pagos y kits.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    exportTarapotoXLSX(registrations);
                    setLiveNotice('✓ Excel Santa Run Tarapoto 2026 (.xlsx) descargado.');
                    setTimeout(() => setLiveNotice(null), 4000);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/25"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel Tarapoto (.xlsx)</span>
                </button>
                <button
                  onClick={() => {
                    const prev = filterEdition;
                    setFilterEdition('santa-run-2026');
                    const headers = ['N°', 'ID', 'Nombres', 'Apellidos', 'DNI', 'WhatsApp', 'Talla Polo', 'Monto', 'Pago', 'Kit', 'Fecha'];
                    const rows = tarapotoRegistrations.map((r, i) => [
                      i + 1,
                      `"${r.id}"`,
                      `"${r.firstName.replace(/"/g, '""')}"`,
                      `"${r.lastName.replace(/"/g, '""')}"`,
                      `"${r.documentNumber}"`,
                      `"${r.whatsapp}"`,
                      `"${r.tShirtSize || 'M'}"`,
                      `S/ ${Number(r.amountPaid || (r.hasPreviousDiscount ? 59.5 : 70)).toFixed(2)}`,
                      `"${r.paymentStatus || 'No Verificado'}"`,
                      r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE',
                      r.createdAt ? `"${new Date(r.createdAt).toLocaleString('es-PE')}"` : '""',
                    ]);
                    downloadFile(
                      `SantaRun_Tarapoto_2026_${new Date().toISOString().slice(0, 10)}.csv`,
                      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n'),
                      'text/csv;charset=utf-8;'
                    );
                    setFilterEdition(prev);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-red-400" />
                  <span>CSV Tarapoto</span>
                </button>
              </div>
            </div>

            {/* Section 2: Santa Run Rioja 2026 */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bebas text-xl text-amber-400 uppercase tracking-wide flex items-center gap-2">
                  <span>Santa Run Rioja 2026 · Sacha Runners</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                  {riojaRegistrations.length} inscritos
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Archivo exclusivo de Rioja con IDs `SRR-2026`, categoría (`Kids 2K` S/ 25.00 o `Libre 5K` S/ 35.00), edad, estado de pago y entrega de kit.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    exportRiojaXLSX(registrations);
                    setLiveNotice('✓ Excel Santa Run Rioja 2026 (.xlsx) descargado.');
                    setTimeout(() => setLiveNotice(null), 4000);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel Rioja (.xlsx)</span>
                </button>
                <button
                  onClick={() => {
                    const headers = ['N°', 'ID Rioja', 'Categoría', 'Nombres', 'Apellidos', 'DNI', 'WhatsApp', 'Edad', 'Monto', 'Pago', 'Kit', 'Fecha'];
                    const rows = riojaRegistrations.map((r, i) => {
                      const cat = r.raceCategory === 'Kids 2K' ? 'Kids 2K' : 'Libre 5K';
                      const price = Number(r.amountPaid || (cat === 'Kids 2K' ? 25 : 35));
                      return [
                        i + 1,
                        `"${r.id}"`,
                        `"${cat}"`,
                        `"${r.firstName.replace(/"/g, '""')}"`,
                        `"${r.lastName.replace(/"/g, '""')}"`,
                        `"${r.documentNumber}"`,
                        `"${r.whatsapp}"`,
                        r.age || '',
                        `S/ ${price.toFixed(2)}`,
                        `"${r.paymentStatus || 'No Verificado'}"`,
                        r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE',
                        r.createdAt ? `"${new Date(r.createdAt).toLocaleString('es-PE')}"` : '""',
                      ];
                    });
                    downloadFile(
                      `SantaRun_Rioja_2026_${new Date().toISOString().slice(0, 10)}.csv`,
                      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n'),
                      'text/csv;charset=utf-8;'
                    );
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>CSV Rioja</span>
                </button>
              </div>
            </div>

            {/* Section 3: Libro Consolidado & Respaldo JSON */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-neutral-400" />
                  <span className="font-bebas text-xl text-white uppercase tracking-wide">
                    Respaldo Completo (Todas las Sedes)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-700 text-[10px] font-mono">
                  {registrations.length} registros
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Descarga un solo libro Excel con 3 pestañas (Tarapoto + Rioja + Halloween) o copia de seguridad JSON.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    exportToNativeXLSX(registrations);
                    setLiveNotice('✓ Libro Excel consolidado (.xlsx) descargado.');
                    setTimeout(() => setLiveNotice(null), 4000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Excel Consolidado (.xlsx)</span>
                </button>

                <button
                  onClick={() => {
                    handleExportFullJSON();
                    setLiveNotice('✓ Archivo de respaldo JSON generado.');
                    setTimeout(() => setLiveNotice(null), 4000);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Descargar Backup JSON</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admin Live Roulette Controls (25 Sorteos) */}
      {showRouletteModal && (
        <AdminRouletteModal
          onClose={() => setShowRouletteModal(false)}
          registrations={registrations}
        />
      )}

      {/* Modal: Digital Turkey Raffle Live Drum (Santa Run 2026) */}
      {showTurkeyLottery && (
        <SantaTurkeyLotteryModal
          runners={registrations}
          onClose={() => setShowTurkeyLottery(false)}
        />
      )}

      {/* Modal: View & Download Runner Personal Photo (For Official Frame) */}
      {viewingPhotoRunner && (viewingPhotoRunner.personalPhotoUrl || viewingPhotoRunner.drivePhotoFileId || viewingPhotoRunner.drivePhotoUrl) && (() => {
        const photoPreviewSrc = getDriveImagePreviewUrl(
          viewingPhotoRunner.drivePhotoFileId,
          viewingPhotoRunner.personalPhotoUrl
        );
        const photoDriveLink = getDriveFileLink(
          viewingPhotoRunner.drivePhotoFileId,
          viewingPhotoRunner.drivePhotoUrl,
          viewingPhotoRunner.personalPhotoUrl
        );
        return (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setViewingPhotoRunner(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Foto Personal del Corredor (Para Marco)
                </span>
                <h4 className="font-bebas text-2xl text-white uppercase mt-1 leading-tight">
                  {viewingPhotoRunner.firstName} {viewingPhotoRunner.lastName}
                </h4>
                <p className="text-xs text-neutral-400">
                  DNI: <strong className="text-white font-mono">{viewingPhotoRunner.documentNumber}</strong> • ID: <strong className="text-red-400 font-mono">{viewingPhotoRunner.id}</strong>
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden bg-black border border-neutral-800 min-h-[220px] max-h-[60vh] flex items-center justify-center p-2">
                {photoPreviewSrc && !photoModalImgError ? (
                  <img
                    src={photoPreviewSrc}
                    alt={`Foto de ${viewingPhotoRunner.firstName} ${viewingPhotoRunner.lastName}`}
                    onError={() => setPhotoModalImgError(true)}
                    className="max-h-[58vh] w-auto max-w-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="py-10 px-4 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-xs text-neutral-300 font-semibold max-w-xs mx-auto">
                      ✓ Foto original en alta calidad guardada directamente en tu Google Drive (0 MB en la web).
                    </p>
                    {photoDriveLink && (
                      <a
                        href={photoDriveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition shadow-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Abrir Foto Original en Google Drive</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                <div className="flex flex-wrap items-center gap-2">
                  {viewingPhotoRunner.personalPhotoUrl && (
                    <a
                      href={viewingPhotoRunner.personalPhotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={`${buildRunnerPersonName(viewingPhotoRunner).replace(/\s+/g, '_')}.jpg`}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar con Nombre</span>
                    </a>
                  )}

                  {photoDriveLink && (
                    <a
                      href={photoDriveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Original en Drive</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setViewingPhotoRunner(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Explicit Confirmation Modal for Mutating / Cleanup Actions (MANDATORY per Workspace guidelines) */}
      {confirmActionModal && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-neutral-900 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="font-bebas text-2xl text-white uppercase tracking-wide leading-tight">
              {confirmActionModal.title}
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {confirmActionModal.description}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
              <button
                type="button"
                disabled={isExecutingConfirmAction}
                onClick={() => setConfirmActionModal(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isExecutingConfirmAction}
                onClick={async () => {
                  setIsExecutingConfirmAction(true);
                  try {
                    await confirmActionModal.onConfirm();
                  } finally {
                    setIsExecutingConfirmAction(false);
                    setConfirmActionModal(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-xs font-black transition cursor-pointer shadow-lg"
              >
                {isExecutingConfirmAction ? 'Procesando...' : confirmActionModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
