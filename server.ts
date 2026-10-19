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

// Persistent directory for shared data (medal photo, registrations)
const DATA_DIR = path.join(__dirname, 'data_storage');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MEDAL_FILE = path.join(DATA_DIR, 'medal.json');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');

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

// Ensure medal state is synced on startup
const initialMedal = readJSON<{ image: string | null }>(MEDAL_FILE, { image: null });
if (initialMedal && initialMedal.image) {
  savePublicMedalImage(initialMedal.image);
}

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
    modality: newRunner.modality || 'Presencial',
    department: newRunner.department || 'San Martín',
    city: newRunner.city || 'Tarapoto',
    district: newRunner.district || 'Tarapoto',
    confirmedAtStart: false,
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

// 5. Virtual Evidence Submission: runners uploading 5K Strava / Nike screenshot & time
app.post('/api/competitor/evidence', (req, res) => {
  const { runnerId, evidence } = req.body;
  if (!runnerId || !evidence) {
    return res.status(400).json({ error: 'Datos de evidencia incompletos.' });
  }

  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const idx = registrations.findIndex((r) => r.id === runnerId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Competidor no encontrado.' });
  }

  const updatedRunner = {
    ...registrations[idx],
    virtualEvidence: {
      ...registrations[idx].virtualEvidence,
      ...evidence,
      submittedAt: new Date().toISOString(),
    },
  };
  registrations[idx] = updatedRunner;
  writeJSON(REGISTRATIONS_FILE, registrations);

  res.json({
    success: true,
    message: 'Evidencia de carrera virtual guardada exitosamente.',
    runner: updatedRunner,
  });
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
