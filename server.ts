import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with 50mb limit to handle medal photo uploads cleanly
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent directory for shared data (medal photo, registrations & potions)
const DATA_DIR = path.join(__dirname, 'data_storage');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MEDAL_FILE = path.join(DATA_DIR, 'medal.json');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const POTIONS_FILE = path.join(DATA_DIR, 'potions.json');

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

function savePublicMedalImage(image: string | null): void {
  const publicDir = path.join(__dirname, 'public');
  const targetFile = path.join(publicDir, 'official-medal.png');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (!image) {
    if (fs.existsSync(targetFile)) {
      try {
        fs.unlinkSync(targetFile);
      } catch (e) {}
    }
    return;
  }

  if (typeof image === 'string' && image.startsWith('data:image')) {
    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(targetFile, Buffer.from(base64Data, 'base64'));
      console.log('[Medal] Successfully saved /public/official-medal.png');
    } catch (err) {
      console.error('Error writing public/official-medal.png:', err);
    }
  }
}

// Ensure medal state is clean on startup
const initialMedal = readJSON<{ image: string | null }>(MEDAL_FILE, { image: null });
if (initialMedal && initialMedal.image) {
  savePublicMedalImage(initialMedal.image);
}

// 5 Official Potion Definitions
const POTION_DEFINITIONS: Record<string, { name: string; potionName: string; min: number; max: number }> = {
  'OHANA-POTION-1-HIDRATACION': {
    name: 'Carpa de Hidratación',
    potionName: 'Poción de Manantial de la Selva',
    min: 80,
    max: 190,
  },
  'OHANA-POTION-2-FOTOS': {
    name: 'Panel de Fotos Oficial',
    potionName: 'Poción Flash Neón',
    min: 90,
    max: 210,
  },
  'OHANA-POTION-3-GUARDARROPA': {
    name: 'Stand de Guardarropa',
    potionName: 'Poción de Custodia & Energía',
    min: 85,
    max: 220,
  },
  'OHANA-POTION-4-AUSPICIADORES': {
    name: 'Zona de Aliados Estratégicos',
    potionName: 'Elixir Golden Partner',
    min: 100,
    max: 250,
  },
  'OHANA-POTION-5-CALDERO': {
    name: 'Caldero de la Victoria',
    potionName: 'Gran Hechizo Finisher 5K',
    min: 150,
    max: 300,
  },
};

const MASTER_START_TOKEN = 'OHANA-START-LINE-TARAPOTO-2026';

// ================= API ROUTES =================

// 1. Medal Photo API: Shared across ALL users, devices and browsers
app.get('/api/medal', (req, res) => {
  const data = readJSON(MEDAL_FILE, { image: null, updatedAt: null });
  res.json(data);
});

app.post('/api/medal', (req, res) => {
  const { image } = req.body;
  const data = {
    image: image || null,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(MEDAL_FILE, data);
  savePublicMedalImage(image || null);
  res.json({ success: true, ...data });
});

// 2. Registrations API: Shared across runners and Admin Dashboard
app.get('/api/registrations', (req, res) => {
  const registrations = readJSON(REGISTRATIONS_FILE, null);
  res.json(registrations);
});

app.post('/api/registrations', (req, res) => {
  const current = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const newRunner = req.body;
  const nextNum = current.length > 0
    ? Math.max(...current.map((r: any) => r.registrationNumber || r.bibNumber || 0)) + 1
    : 1;
  const newId = `OHA-2026-${String(nextNum).padStart(4, '0')}`;
  const record = {
    ...newRunner,
    id: newRunner.id || newId,
    registrationNumber: nextNum,
    bibNumber: nextNum,
    confirmedAtStart: false,
    totalCandies: 0,
    potionsCollected: [],
    createdAt: new Date().toISOString(),
  };
  const updated = [record, ...current];
  writeJSON(REGISTRATIONS_FILE, updated);
  res.json(record);
});

app.put('/api/registrations', (req, res) => {
  const { registrations } = req.body;
  if (Array.isArray(registrations)) {
    writeJSON(REGISTRATIONS_FILE, registrations);
    return res.json({ success: true, count: registrations.length });
  }
  res.status(400).json({ error: 'Expected array of registrations' });
});

// 3. Competitor Auth: Login by DNI or Dorsal or ID
app.post('/api/competitor/login', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Ingresa tu DNI o número de dorsal.' });
  }
  const clean = String(query).trim().toLowerCase();
  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  
  const runner = registrations.find((r) => {
    return (
      String(r.documentNumber).toLowerCase() === clean ||
      String(r.registrationNumber) === clean ||
      String(r.bibNumber) === clean ||
      String(r.id).toLowerCase() === clean ||
      (r.email && String(r.email).toLowerCase() === clean) ||
      (r.whatsapp && String(r.whatsapp).replace(/\D/g, '') === clean.replace(/\D/g, '')) ||
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(clean)
    );
  });

  if (!runner) {
    return res.status(404).json({ error: 'No se encontró un competidor registrado con ese documento o dorsal.' });
  }

  res.json({ success: true, runner });
});

// 4. Start Line QR Check-in: Verification of attendance when arriving at starting arch
app.post('/api/start-checkin', (req, res) => {
  const { runnerId, dorsal, dni, token } = req.body;
  
  // Accept master event token or admin confirmation
  if (token !== MASTER_START_TOKEN && token !== 'ADMIN_CHECKIN_OVERRIDE') {
    return res.status(400).json({ error: 'Código QR de partida no válido. Escanea el QR oficial mostrado en la Plaza de Armas.' });
  }

  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const idx = registrations.findIndex((r) => {
    if (runnerId && r.id === runnerId) return true;
    if (dorsal && (r.registrationNumber === Number(dorsal) || r.bibNumber === Number(dorsal))) return true;
    if (dni && r.documentNumber === dni) return true;
    return false;
  });

  if (idx === -1) {
    return res.status(404).json({ error: 'Competidor no encontrado para confirmación de partida.' });
  }

  const updatedRunner = {
    ...registrations[idx],
    confirmedAtStart: true,
    startCheckinTime: new Date().toISOString(),
  };
  registrations[idx] = updatedRunner;
  writeJSON(REGISTRATIONS_FILE, registrations);

  res.json({
    success: true,
    message: '¡Confirmación de partida exitosa! Tu asistencia ha sido validada.',
    runner: updatedRunner,
  });
});

// 5. Mini-game: Potion Cauldron Scans & Leaderboard
interface PotionDB {
  scans: Array<{
    id: string;
    runnerId: string;
    runnerName: string;
    dorsal: number;
    documentNumber: string;
    qrToken: string;
    potionName: string;
    locationName: string;
    candies: number;
    scannedAt: string;
  }>;
  winner: {
    proclaimed: boolean;
    runnerId?: string;
    runnerName?: string;
    dorsal?: number;
    totalCandies?: number;
    proclaimedAt?: string;
    notes?: string;
  } | null;
}

app.get('/api/potions', (req, res) => {
  const potionDb = readJSON<PotionDB>(POTIONS_FILE, { scans: [], winner: null });
  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);

  // Compute leaderboard from scans
  const runnerMap: Record<string, {
    runnerId: string;
    runnerName: string;
    dorsal: number;
    documentNumber: string;
    totalCandies: number;
    potionsCollected: string[];
    scansCount: number;
    lastScanAt: string;
  }> = {};

  for (const scan of potionDb.scans) {
    if (!runnerMap[scan.runnerId]) {
      runnerMap[scan.runnerId] = {
        runnerId: scan.runnerId,
        runnerName: scan.runnerName,
        dorsal: scan.dorsal,
        documentNumber: scan.documentNumber,
        totalCandies: 0,
        potionsCollected: [],
        scansCount: 0,
        lastScanAt: scan.scannedAt,
      };
    }
    const r = runnerMap[scan.runnerId];
    r.totalCandies += scan.candies;
    if (!r.potionsCollected.includes(scan.qrToken)) {
      r.potionsCollected.push(scan.qrToken);
    }
    r.scansCount += 1;
    if (new Date(scan.scannedAt) > new Date(r.lastScanAt)) {
      r.lastScanAt = scan.scannedAt;
    }
  }

  // Also include registered runners who haven't scanned yet for full ranking
  for (const reg of registrations) {
    if (!runnerMap[reg.id]) {
      runnerMap[reg.id] = {
        runnerId: reg.id,
        runnerName: `${reg.firstName} ${reg.lastName}`,
        dorsal: reg.registrationNumber || reg.bibNumber || 0,
        documentNumber: reg.documentNumber,
        totalCandies: 0,
        potionsCollected: [],
        scansCount: 0,
        lastScanAt: '',
      };
    }
  }

  const leaderboard = Object.values(runnerMap).sort((a, b) => {
    if (b.totalCandies !== a.totalCandies) {
      return b.totalCandies - a.totalCandies;
    }
    return b.potionsCollected.length - a.potionsCollected.length;
  });

  // Recent live activity feed (last 15 scans)
  const recentFeed = [...potionDb.scans].reverse().slice(0, 15);

  res.json({
    totalScans: potionDb.scans.length,
    recentFeed,
    leaderboard,
    winner: potionDb.winner,
  });
});

app.post('/api/potions/scan', (req, res) => {
  const { runnerId, dorsal, dni, qrToken } = req.body;
  if (!qrToken || !POTION_DEFINITIONS[qrToken]) {
    return res.status(400).json({ error: 'Código QR no reconocido como una poción oficial de OHANA GO.' });
  }

  const potionInfo = POTION_DEFINITIONS[qrToken];
  const potionDb = readJSON<PotionDB>(POTIONS_FILE, { scans: [], winner: null });
  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);

  // Find runner
  const regIndex = registrations.findIndex((r) => {
    if (runnerId && r.id === runnerId) return true;
    if (dorsal && (r.registrationNumber === Number(dorsal) || r.bibNumber === Number(dorsal))) return true;
    if (dni && r.documentNumber === dni) return true;
    return false;
  });

  if (regIndex === -1) {
    return res.status(404).json({ error: 'Debes iniciar sesión con tu dorsal o DNI para registrar tus pociones.' });
  }

  const runner = registrations[regIndex];
  const rId = runner.id;

  // Check if this runner already scanned this specific QR
  const alreadyScanned = potionDb.scans.some(
    (s) => s.runnerId === rId && s.qrToken === qrToken
  );

  if (alreadyScanned) {
    return res.status(400).json({
      error: `¡Ya descubriste la ${potionInfo.potionName} en la ${potionInfo.name}! Busca los otros 4 códigos QR restantes.`,
      alreadyClaimed: true,
    });
  }

  // Generate random candies/points
  const candies = Math.floor(Math.random() * (potionInfo.max - potionInfo.min + 1)) + potionInfo.min;

  const newScan = {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    runnerId: rId,
    runnerName: `${runner.firstName} ${runner.lastName}`,
    dorsal: runner.registrationNumber || runner.bibNumber || 0,
    documentNumber: runner.documentNumber,
    qrToken,
    potionName: potionInfo.potionName,
    locationName: potionInfo.name,
    candies,
    scannedAt: new Date().toISOString(),
  };

  potionDb.scans.push(newScan);
  writeJSON(POTIONS_FILE, potionDb);

  // Update runner's record in registrations
  const currentTotal = (runner.totalCandies || 0) + candies;
  const currentPotions = Array.isArray(runner.potionsCollected) ? [...runner.potionsCollected] : [];
  if (!currentPotions.includes(qrToken)) {
    currentPotions.push(qrToken);
  }

  registrations[regIndex] = {
    ...runner,
    totalCandies: currentTotal,
    potionsCollected: currentPotions,
  };
  writeJSON(REGISTRATIONS_FILE, registrations);

  res.json({
    success: true,
    message: `¡Increíble! Descubriste la ${potionInfo.potionName} y obtuviste +${candies} dulces para tu caldero.`,
    scan: newScan,
    candiesAwarded: candies,
    totalCandies: currentTotal,
    potionsCount: currentPotions.length,
    totalPotionsPossible: Object.keys(POTION_DEFINITIONS).length,
  });
});

// Admin proclaim winner
app.post('/api/potions/proclaim-winner', (req, res) => {
  const { runnerId, notes } = req.body;
  const potionDb = readJSON<PotionDB>(POTIONS_FILE, { scans: [], winner: null });
  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);

  const runner = registrations.find((r) => r.id === runnerId);
  if (!runner) {
    return res.status(404).json({ error: 'Competidor no encontrado' });
  }

  potionDb.winner = {
    proclaimed: true,
    runnerId: runner.id,
    runnerName: `${runner.firstName} ${runner.lastName}`,
    dorsal: runner.registrationNumber || runner.bibNumber,
    totalCandies: runner.totalCandies || 0,
    proclaimedAt: new Date().toISOString(),
    notes: notes || 'Ganador oficial del Premio Especial OHANA GO en el Caldero de Pociones',
  };

  writeJSON(POTIONS_FILE, potionDb);
  res.json({ success: true, winner: potionDb.winner });
});

// Admin reset runner score (e.g. after testing)
app.post('/api/potions/reset-runner', (req, res) => {
  const { runnerId } = req.body;
  if (!runnerId) {
    return res.status(400).json({ error: 'Falta runnerId' });
  }

  const potionDb = readJSON<PotionDB>(POTIONS_FILE, { scans: [], winner: null });
  potionDb.scans = potionDb.scans.filter((s) => s.runnerId !== runnerId);
  if (potionDb.winner && potionDb.winner.runnerId === runnerId) {
    potionDb.winner = null;
  }
  writeJSON(POTIONS_FILE, potionDb);

  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const idx = registrations.findIndex((r) => r.id === runnerId);
  if (idx !== -1) {
    registrations[idx] = {
      ...registrations[idx],
      totalCandies: 0,
      potionsCollected: [],
    };
    writeJSON(REGISTRATIONS_FILE, registrations);
    return res.json({ success: true, runner: registrations[idx] });
  }

  res.json({ success: true });
});

// ================= FRONTEND SERVING =================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[FullStack] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
