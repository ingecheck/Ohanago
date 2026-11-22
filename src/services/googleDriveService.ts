import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import app, { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { RunnerRegistration } from '../types/race';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive',
];

export const DEFAULT_YAPE_FOLDER_ID = '1bXSZLVKnVNT8MWBJNiA8mIoB5tsp7nze';
export const DEFAULT_PHOTOS_FOLDER_ID = '1_OFzWdhJ1CFltSleo1uJYyTzVfLF2StG';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'select_account' });

let isSigningIn = false;
// Access token cached strictly in memory (never localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let cachedUserEmail: string | null = null;

export interface OhanaDriveFolders {
  rootFolderId: string;
  vouchersFolderId: string;
  photosFolderId: string;
  rootFolderUrl: string;
  vouchersFolderUrl: string;
  photosFolderUrl: string;
}

export const DEFAULT_OHANA_DRIVE_FOLDERS: OhanaDriveFolders = {
  rootFolderId: DEFAULT_YAPE_FOLDER_ID,
  vouchersFolderId: DEFAULT_YAPE_FOLDER_ID,
  photosFolderId: DEFAULT_PHOTOS_FOLDER_ID,
  rootFolderUrl: `https://drive.google.com/drive/folders/${DEFAULT_YAPE_FOLDER_ID}`,
  vouchersFolderUrl: `https://drive.google.com/drive/folders/${DEFAULT_YAPE_FOLDER_ID}`,
  photosFolderUrl: `https://drive.google.com/drive/folders/${DEFAULT_PHOTOS_FOLDER_ID}`,
};

export interface RiojaDriveFoldersConfig {
  vouchersFolderId: string;
  photosFolderId: string;
  vouchersFolderUrl: string;
  photosFolderUrl: string;
  isDedicated: boolean;
}

const RIOJA_DRIVE_FOLDERS_KEY = 'ohana_rioja_drive_folders';
let cachedRiojaDriveFolders: RiojaDriveFoldersConfig | null = null;

/**
 * Extracts a Google Drive folder ID from either a full Drive folder URL or a bare folder ID.
 */
export function extractDriveFolderId(input: string): string {
  const clean = (input || '').trim();
  if (!clean) return '';
  const folderMatch = clean.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (folderMatch?.[1]) return folderMatch[1];
  const idParamMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (idParamMatch?.[1]) return idParamMatch[1];
  if (/^[a-zA-Z0-9_-]{15,}$/.test(clean)) return clean;
  return '';
}

export async function getRiojaDriveFolders(): Promise<RiojaDriveFoldersConfig> {
  if (cachedRiojaDriveFolders) return cachedRiojaDriveFolders;

  try {
    const snap = await getDoc(doc(db, 'analytics', 'drive_folders_rioja'));
    if (snap.exists()) {
      const data = snap.data() as Partial<RiojaDriveFoldersConfig>;
      const vId = extractDriveFolderId(data.vouchersFolderId || '');
      const pId = extractDriveFolderId(data.photosFolderId || '');
      if (vId || pId) {
        const finalV = vId || DEFAULT_YAPE_FOLDER_ID;
        const finalP = pId || DEFAULT_PHOTOS_FOLDER_ID;
        const cfg: RiojaDriveFoldersConfig = {
          vouchersFolderId: finalV,
          photosFolderId: finalP,
          vouchersFolderUrl: `https://drive.google.com/drive/folders/${finalV}`,
          photosFolderUrl: `https://drive.google.com/drive/folders/${finalP}`,
          isDedicated: !!(vId || pId),
        };
        cachedRiojaDriveFolders = cfg;
        try {
          localStorage.setItem(RIOJA_DRIVE_FOLDERS_KEY, JSON.stringify(cfg));
        } catch {}
        return cfg;
      }
    }
  } catch {}

  try {
    const raw = localStorage.getItem(RIOJA_DRIVE_FOLDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RiojaDriveFoldersConfig;
      if (parsed?.vouchersFolderId && parsed?.photosFolderId) {
        cachedRiojaDriveFolders = parsed;
        return parsed;
      }
    }
  } catch {}

  return {
    vouchersFolderId: DEFAULT_YAPE_FOLDER_ID,
    photosFolderId: DEFAULT_PHOTOS_FOLDER_ID,
    vouchersFolderUrl: `https://drive.google.com/drive/folders/${DEFAULT_YAPE_FOLDER_ID}`,
    photosFolderUrl: `https://drive.google.com/drive/folders/${DEFAULT_PHOTOS_FOLDER_ID}`,
    isDedicated: false,
  };
}

export async function saveRiojaDriveFolders(params: {
  vouchersInput: string;
  photosInput: string;
}): Promise<RiojaDriveFoldersConfig> {
  const vId = extractDriveFolderId(params.vouchersInput);
  const pId = extractDriveFolderId(params.photosInput);
  const isDedicated = !!(vId || pId);
  const finalV = vId || DEFAULT_YAPE_FOLDER_ID;
  const finalP = pId || DEFAULT_PHOTOS_FOLDER_ID;

  const cfg: RiojaDriveFoldersConfig = {
    vouchersFolderId: finalV,
    photosFolderId: finalP,
    vouchersFolderUrl: `https://drive.google.com/drive/folders/${finalV}`,
    photosFolderUrl: `https://drive.google.com/drive/folders/${finalP}`,
    isDedicated,
  };

  cachedRiojaDriveFolders = cfg;
  try {
    localStorage.setItem(RIOJA_DRIVE_FOLDERS_KEY, JSON.stringify(cfg));
  } catch {}

  await setDoc(
    doc(db, 'analytics', 'drive_folders_rioja'),
    {
      vouchersFolderId: vId,
      photosFolderId: pId,
      vouchersFolderUrl: cfg.vouchersFolderUrl,
      photosFolderUrl: cfg.photosFolderUrl,
      isDedicated,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return cfg;
}

let cachedFolders: OhanaDriveFolders | null = null;

export const initDriveAuth = (
  onAuthSuccess?: (user: User | { email: string | null }, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user || { email: cachedUserEmail }, cachedAccessToken);
    } else if (user && !isSigningIn) {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    } else if (!user && !cachedAccessToken) {
      cachedAccessToken = null;
      cachedFolders = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

async function fetchDriveAccountEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data?.user?.emailAddress || null;
    }
  } catch (e) {}
  return null;
}

function signInWithGisFallback(): Promise<{ email: string | null; accessToken: string }> {
  return new Promise((resolve, reject) => {
    const win = window as any;
    const oauth2 = win?.google?.accounts?.oauth2;
    const clientId = (firebaseConfig as any)?.oAuthClientId;

    if (!oauth2 || !clientId) {
      reject(new Error('GIS_UNAVAILABLE'));
      return;
    }

    try {
      const tokenClient = oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES.join(' '),
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }
          if (!tokenResponse?.access_token) {
            reject(new Error('No se recibió token de acceso de Google Drive.'));
            return;
          }
          cachedAccessToken = tokenResponse.access_token;
          cachedUserEmail = await fetchDriveAccountEmail(tokenResponse.access_token);
          cachedFolders = null;
          resolve({
            email: cachedUserEmail,
            accessToken: tokenResponse.access_token,
          });
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || err?.type || 'Ventana de Google cerrada o bloqueada.'));
        },
      });
      tokenClient.requestAccessToken();
    } catch (err: any) {
      reject(err);
    }
  });
}

export const signInWithGoogleDrive = async (): Promise<{
  user: User | { email: string | null };
  accessToken: string;
} | null> => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isHostedAppOrigin =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.run.app') ||
    hostname.endsWith('.firebaseapp.com') ||
    hostname.endsWith('.web.app');

  try {
    isSigningIn = true;

    // On custom domains (e.g. www.ohanago.pro), trigger GIS synchronously first so the browser doesn't block the popup after an async Firebase call
    if (!isHostedAppOrigin) {
      let gisErrMsg = '';
      try {
        const gisRes = await signInWithGisFallback();
        return {
          user: { email: gisRes.email },
          accessToken: gisRes.accessToken,
        };
      } catch (gisErr: any) {
        gisErrMsg = gisErr?.message || String(gisErr || '');
        if (
          gisErrMsg.toLowerCase().includes('popup_closed') ||
          gisErrMsg.toLowerCase().includes('cerr')
        ) {
          throw new Error('Cerraste la ventana de inicio de sesión de Google antes de completar.');
        }
      }

      try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
          cachedUserEmail = result.user?.email || null;
          cachedFolders = null;
          return { user: result.user, accessToken: cachedAccessToken };
        }
      } catch (firebaseErr: any) {
        const code = firebaseErr?.code || '';
        if (code === 'auth/unauthorized-domain') {
          throw new Error(
            `Dominio no autorizado (${hostname}). Asegúrate de haber agregado "https://${hostname}" en Google Cloud OAuth (Orígenes JavaScript autorizados) y "${hostname}" en Firebase Auth (${gisErrMsg || code}), o abre el Panel desde la URL oficial de la app.`
          );
        }
        throw new Error(
          firebaseErr?.message || gisErrMsg || 'Error al iniciar sesión con Google Drive.'
        );
      }
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        cachedUserEmail = result.user?.email || null;
        cachedFolders = null;
        return { user: result.user, accessToken: cachedAccessToken };
      }
      // If Firebase returned user without OAuth accessToken, fall back to GIS token client
      const gisRes = await signInWithGisFallback();
      return {
        user: result.user || { email: gisRes.email },
        accessToken: gisRes.accessToken,
      };
    } catch (firebaseErr: any) {
      const code = firebaseErr?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/user-cancelled') {
        throw new Error('Cerraste la ventana de inicio de sesión antes de completar.');
      }

      try {
        const gisRes = await signInWithGisFallback();
        return {
          user: { email: gisRes.email },
          accessToken: gisRes.accessToken,
        };
      } catch (gisErr: any) {
        if (code === 'auth/unauthorized-domain') {
          throw new Error(
            `Dominio no autorizado (${hostname}). Abre el panel desde la URL oficial de la app o autoriza "${hostname}" en Firebase Auth y Google Cloud OAuth.`
          );
        }
        if (code === 'auth/popup-blocked') {
          throw new Error(
            'Tu navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes (pop-ups) para este sitio e intenta de nuevo.'
          );
        }
        throw new Error(
          firebaseErr?.message || gisErr?.message || 'Error al iniciar sesión con Google Drive.'
        );
      }
    }
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogleDrive = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (e) {}
  cachedAccessToken = null;
  cachedUserEmail = null;
  cachedFolders = null;
};

function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function verifyDriveFolderAccess(
  accessToken: string,
  folderId: string,
  folderLabel: string
): Promise<{ id: string; name?: string; parents?: string[] }> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,parents&supportsAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (res.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (!res.ok) {
    const accountHint = cachedUserEmail ? ` (${cachedUserEmail})` : '';
    throw new Error(
      `La cuenta de Google conectada${accountHint} no tiene acceso de Editor a la carpeta "${folderLabel}". Inicia sesión con la cuenta dueña de esas carpetas o compártele permisos de Editor.`
    );
  }

  return res.json();
}

export async function ensureOhanaDriveFolders(
  accessToken: string
): Promise<OhanaDriveFolders> {
  if (cachedFolders) return cachedFolders;

  const [vouchersMeta, photosMeta] = await Promise.all([
    verifyDriveFolderAccess(accessToken, DEFAULT_YAPE_FOLDER_ID, 'Constancias Yape'),
    verifyDriveFolderAccess(accessToken, DEFAULT_PHOTOS_FOLDER_ID, 'Fotos Atletas'),
  ]);

  const sharedParentId =
    vouchersMeta.parents?.find((p) => photosMeta.parents?.includes(p)) || DEFAULT_YAPE_FOLDER_ID;

  cachedFolders = {
    rootFolderId: sharedParentId,
    vouchersFolderId: DEFAULT_YAPE_FOLDER_ID,
    photosFolderId: DEFAULT_PHOTOS_FOLDER_ID,
    rootFolderUrl: `https://drive.google.com/drive/folders/${sharedParentId}`,
    vouchersFolderUrl: `https://drive.google.com/drive/folders/${DEFAULT_YAPE_FOLDER_ID}`,
    photosFolderUrl: `https://drive.google.com/drive/folders/${DEFAULT_PHOTOS_FOLDER_ID}`,
  };

  return cachedFolders;
}

async function sourceToBlob(source: string): Promise<{ blob: Blob; mimeType: string; ext: string }> {
  if (source.startsWith('data:')) {
    const matches = source.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Formato de imagen inválido');
    }
    const mimeType = matches[1] || 'image/jpeg';
    const byteChars = atob(matches[2]);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i);
    }
    const ext = mimeType.includes('png')
      ? 'png'
      : mimeType.includes('pdf')
        ? 'pdf'
        : mimeType.includes('webp')
          ? 'webp'
          : 'jpg';
    return { blob: new Blob([byteArray], { type: mimeType }), mimeType, ext };
  }

  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`No se pudo descargar archivo local (${response.status})`);
  }
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';
  const ext = mimeType.includes('png')
    ? 'png'
    : mimeType.includes('pdf')
      ? 'pdf'
      : mimeType.includes('webp')
        ? 'webp'
        : 'jpg';
  return { blob, mimeType, ext };
}

export function buildRunnerPersonName(runner: RunnerRegistration): string {
  const full = `${runner.firstName || ''} ${runner.lastName || ''}`
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ');
  return full || runner.id;
}

export function formatRunnerNumberTag(runner: RunnerRegistration): string {
  const num = Number(runner.registrationNumber || runner.bibNumber || 0);
  if (num > 0) return `#${String(num).padStart(4, '0')}`;
  return runner.id || 'SR';
}

export function buildVoucherDriveFileName(runner: RunnerRegistration): string {
  const personName = buildRunnerPersonName(runner);
  const numTag = formatRunnerNumberTag(runner);
  const isRioja = runner.edition === 'santa-run-rioja-2026' || runner.id?.startsWith('SRR-');
  return isRioja ? `RIOJA - ${personName} - Yape - ${numTag}` : `${personName} - Yape - ${numTag}`;
}

export function buildPhotoDriveFileName(runner: RunnerRegistration): string {
  const personName = buildRunnerPersonName(runner);
  const numTag = formatRunnerNumberTag(runner);
  const isRioja = runner.edition === 'santa-run-rioja-2026' || runner.id?.startsWith('SRR-');
  return isRioja ? `RIOJA - ${personName} - Foto - ${numTag}` : `${personName} - Foto - ${numTag}`;
}

export async function uploadFileToDriveFolder(params: {
  accessToken: string;
  folderId: string;
  baseFileName: string;
  source: string;
  existingFileId?: string;
}): Promise<{ id: string; name: string; webViewLink: string }> {
  const { accessToken, folderId, baseFileName, source, existingFileId } = params;
  const { blob, mimeType, ext } = await sourceToBlob(source);
  const fullName = baseFileName.endsWith(`.${ext}`) ? baseFileName : `${baseFileName}.${ext}`;

  // If updating an already-synced Drive file ID
  if (existingFileId) {
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media&supportsAllDrives=true&fields=id,name,webViewLink`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': mimeType,
        },
        body: blob,
      }
    );

    if (updateRes.status === 401) {
      cachedAccessToken = null;
      throw new Error('AUTH_EXPIRED');
    }

    if (updateRes.ok) {
      const updated = await updateRes.json();
      return {
        id: updated.id,
        name: updated.name,
        webViewLink: updated.webViewLink || `https://drive.google.com/file/d/${updated.id}/view`,
      };
    }
  }

  // Check if file already exists in folder by exact name to prevent duplicates
  const existingQuery = `name = '${escapeDriveQuery(fullName)}' and '${folderId}' in parents and trashed = false`;
  const checkRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(existingQuery)}&fields=files(id,name,webViewLink)&spaces=drive&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (checkRes.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (checkRes.ok) {
    const checkData = await checkRes.json();
    if (Array.isArray(checkData.files) && checkData.files.length > 0) {
      const found = checkData.files[0];
      return {
        id: found.id,
        name: found.name,
        webViewLink: found.webViewLink || `https://drive.google.com/file/d/${found.id}/view`,
      };
    }
  }

  // Multipart upload to Google Drive
  const metadata = {
    name: fullName,
    parents: [folderId],
  };

  const boundary = `ohana_drive_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata);

  const mediaHeader =
    delimiter + `Content-Type: ${mimeType}\r\n\r\n`;

  const bodyBlob = new Blob([metadataPart, mediaHeader, blob, closeDelimiter], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: bodyBlob,
    }
  );

  if (uploadRes.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Error subiendo "${fullName}" a Google Drive: ${errText}`);
  }

  const uploaded = await uploadRes.json();
  return {
    id: uploaded.id,
    name: uploaded.name,
    webViewLink: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
  };
}

// ================= GOOGLE APPS SCRIPT DIRECT BRIDGE (NO OAUTH SIGN-IN NEEDED) =================

const BRIDGE_STORAGE_KEY = 'ohana_drive_bridge_url';
const LEGACY_BROKEN_BRIDGE_URL =
  'https://script.google.com/macros/s/AKfycbztdPRQJukG5_r_7Lk26cQfx1WkS_wlQ3kw6YJzQmQBmwVmLlk5rimio8K3blxvqTFIsA/exec';
export const DEFAULT_APPS_SCRIPT_BRIDGE_URL =
  'https://script.google.com/macros/s/AKfycbxEgCbMZzTqQlvID5oqz2NLB1AnNqqdBDcM2ABm2P4i3inY5scn7oFob9RmP4sF4Cmj5g/exec';

let cachedBridgeUrl: string | null = DEFAULT_APPS_SCRIPT_BRIDGE_URL;

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// Pega este código completo en https://script.google.com (Nuevo proyecto)
// Carpetas oficiales de OHANA GO - Santa Run Tarapoto 2026
var YAPE_FOLDER_ID = '${DEFAULT_YAPE_FOLDER_ID}';
var PHOTOS_FOLDER_ID = '${DEFAULT_PHOTOS_FOLDER_ID}';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'OHANA GO Google Drive Direct Bridge' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var targetFolderId = data.folderId || (data.kind === 'photo' ? PHOTOS_FOLDER_ID : YAPE_FOLDER_ID);
    var folder = DriveApp.getFolderById(targetFolderId);

    var fileName = String(data.fileName || ('archivo_' + Date.now() + '.jpg'));
    var mimeType = String(data.mimeType || 'image/jpeg');
    var base64 = String(data.base64 || '');
    var overwrite = !!data.overwrite;

    if (!base64) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Archivo vacío' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var existing = folder.getFilesByName(fileName);
    if (existing.hasNext()) {
      var prevFile = existing.next();
      if (!overwrite) {
        return ContentService
          .createTextOutput(JSON.stringify({
            ok: true,
            id: prevFile.getId(),
            name: prevFile.getName(),
            webViewLink: prevFile.getUrl(),
            existed: true
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      prevFile.setTrashed(true);
    }

    var bytes = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(bytes, mimeType, fileName);
    var created = folder.createFile(blob);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        id: created.getId(),
        name: created.getName(),
        webViewLink: created.getUrl()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export function isValidAppsScriptUrl(url: string): boolean {
  const clean = (url || '').trim();
  if (!clean || clean === LEGACY_BROKEN_BRIDGE_URL) return false;
  return /^https:\/\/script\.google\.com\/(macros\/s\/|a\/macros\/)/i.test(clean);
}

export async function getDriveBridgeUrl(): Promise<string | null> {
  if (cachedBridgeUrl && isValidAppsScriptUrl(cachedBridgeUrl)) {
    return cachedBridgeUrl;
  }

  try {
    const snap = await getDoc(doc(db, 'analytics', 'drive_bridge'));
    if (snap.exists()) {
      const cloudUrl = String(snap.data()?.url || '').trim();
      if (isValidAppsScriptUrl(cloudUrl)) {
        cachedBridgeUrl = cloudUrl;
        try {
          localStorage.setItem(BRIDGE_STORAGE_KEY, cloudUrl);
        } catch (e) {}
        return cloudUrl;
      }
    }
  } catch (e) {}

  try {
    const local = (localStorage.getItem(BRIDGE_STORAGE_KEY) || '').trim();
    if (isValidAppsScriptUrl(local)) {
      cachedBridgeUrl = local;
      return local;
    }
  } catch (e) {}

  if (isValidAppsScriptUrl(DEFAULT_APPS_SCRIPT_BRIDGE_URL)) {
    cachedBridgeUrl = DEFAULT_APPS_SCRIPT_BRIDGE_URL;
    return DEFAULT_APPS_SCRIPT_BRIDGE_URL;
  }

  return null;
}

export async function saveDriveBridgeUrl(url: string): Promise<string> {
  const clean = (url || '').trim();
  if (clean && !isValidAppsScriptUrl(clean)) {
    throw new Error('El enlace debe empezar con https://script.google.com/macros/s/...');
  }

  cachedBridgeUrl = clean || null;
  try {
    if (clean) localStorage.setItem(BRIDGE_STORAGE_KEY, clean);
    else localStorage.removeItem(BRIDGE_STORAGE_KEY);
  } catch (e) {}

  try {
    await setDoc(
      doc(db, 'analytics', 'drive_bridge'),
      { url: clean, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (e) {}

  return clean;
}

async function sourceToBase64Payload(source: string): Promise<{ base64: string; mimeType: string; ext: string }> {
  if (source.startsWith('data:')) {
    const matches = source.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Formato de imagen inválido');
    }
    const mimeType = matches[1] || 'image/jpeg';
    const ext = mimeType.includes('png')
      ? 'png'
      : mimeType.includes('pdf')
        ? 'pdf'
        : mimeType.includes('webp')
          ? 'webp'
          : 'jpg';
    return { base64: matches[2], mimeType, ext };
  }

  const { blob, mimeType, ext } = await sourceToBlob(source);
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return { base64: btoa(binary), mimeType, ext };
}

export async function uploadFileViaAppsScript(params: {
  bridgeUrl: string;
  folderId: string;
  kind: 'voucher' | 'photo';
  baseFileName: string;
  source: string;
  overwrite?: boolean;
}): Promise<{ id: string; webViewLink: string }> {
  const { bridgeUrl, folderId, kind, baseFileName, source, overwrite = false } = params;
  const { base64, mimeType, ext } = await sourceToBase64Payload(source);
  const fileName = baseFileName.endsWith(`.${ext}`) ? baseFileName : `${baseFileName}.${ext}`;

  const body = JSON.stringify({
    folderId,
    kind,
    fileName,
    mimeType,
    base64,
    overwrite,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(bridgeUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Google Drive respondió con estado HTTP ${res.status}`);
    }

    const text = await res.text();
    if (text.includes('Script function not found')) {
      throw new Error(
        'Tu Google Apps Script aún no tiene guardado/publicado el código (dice: Script function not found: doPost). En script.google.com guarda el código y publica una Nueva versión.'
      );
    }
    try {
      const parsed = JSON.parse(text);
      if (parsed?.ok === false) {
        throw new Error(parsed.error || 'Google Apps Script devolvió un error');
      }
      if (parsed?.id) {
        return {
          id: parsed.id,
          webViewLink: parsed.webViewLink || `https://drive.google.com/file/d/${parsed.id}/view`,
        };
      }
    } catch (jsonErr: any) {
      if (jsonErr?.message && !jsonErr.message.includes('JSON')) {
        throw jsonErr;
      }
    }

    throw new Error('Google Drive no confirmó el archivo recibido.');
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('La subida a Google Drive tardó demasiado. Verifica tu conexión e intenta de nuevo.');
    }
    const msg = String(err?.message || '').toLowerCase();
    const isCrossOriginOrNetworkBlock =
      err?.name === 'TypeError' ||
      msg.includes('fetch') ||
      msg.includes('cors') ||
      msg.includes('load failed') ||
      msg.includes('network');

    if (!isCrossOriginOrNetworkBlock) {
      throw err;
    }

    // Fallback with no-cors when strict mobile WebView (e.g. Instagram browser) blocks reading 302 redirect
    const fallbackController = new AbortController();
    const fallbackTimeout = setTimeout(() => fallbackController.abort(), 10000);
    try {
      await fetch(bridgeUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
        signal: fallbackController.signal,
      });
    } finally {
      clearTimeout(fallbackTimeout);
    }
    return {
      id: `bridge_${Date.now()}`,
      webViewLink: `https://drive.google.com/drive/folders/${folderId}`,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function syncRunnerMediaViaAppsScript(
  runner: RunnerRegistration,
  options?: { overwrite?: boolean; bridgeUrl?: string }
): Promise<{
  driveVoucherFileId?: string;
  driveVoucherUrl?: string;
  drivePhotoFileId?: string;
  drivePhotoUrl?: string;
  voucherFailed?: boolean;
  photoFailed?: boolean;
} | null> {
  const bridgeUrl = options?.bridgeUrl || (await getDriveBridgeUrl());
  if (!bridgeUrl) return null;

  const overwrite = !!options?.overwrite;
  const voucherBaseName = buildVoucherDriveFileName(runner);
  const photoBaseName = buildPhotoDriveFileName(runner);
  const result: {
    driveVoucherFileId?: string;
    driveVoucherUrl?: string;
    drivePhotoFileId?: string;
    drivePhotoUrl?: string;
    voucherFailed?: boolean;
    photoFailed?: boolean;
  } = {};

  const voucherSrc = runner.voucherUrl || runner.paymentProofImage;
  const needVoucher = !!(voucherSrc && (overwrite || !runner.driveVoucherFileId));
  const needPhoto = !!(runner.personalPhotoUrl && (overwrite || !runner.drivePhotoFileId));

  if (!needVoucher && !needPhoto) return null;

  const isRioja = runner.edition === 'santa-run-rioja-2026' || runner.id?.startsWith('SRR-');
  const riojaFolders = isRioja ? await getRiojaDriveFolders() : null;
  const targetYapeFolderId = riojaFolders?.isDedicated
    ? riojaFolders.vouchersFolderId
    : DEFAULT_YAPE_FOLDER_ID;
  const targetPhotosFolderId = riojaFolders?.isDedicated
    ? riojaFolders.photosFolderId
    : DEFAULT_PHOTOS_FOLDER_ID;

  // Upload voucher and photo IN PARALLEL so mobile runners wait half the time
  const [voucherOutcome, photoOutcome] = await Promise.all([
    needVoucher
      ? uploadFileViaAppsScript({
          bridgeUrl,
          folderId: targetYapeFolderId,
          kind: 'voucher',
          baseFileName: voucherBaseName,
          source: voucherSrc!,
          overwrite,
        })
          .then((res) => ({ ok: true as const, res }))
          .catch((err) => ({ ok: false as const, err }))
      : Promise.resolve(null),
    needPhoto
      ? uploadFileViaAppsScript({
          bridgeUrl,
          folderId: targetPhotosFolderId,
          kind: 'photo',
          baseFileName: photoBaseName,
          source: runner.personalPhotoUrl!,
          overwrite,
        })
          .then((res) => ({ ok: true as const, res }))
          .catch((err) => ({ ok: false as const, err }))
      : Promise.resolve(null),
  ]);

  if (voucherOutcome) {
    if (voucherOutcome.ok) {
      result.driveVoucherFileId = voucherOutcome.res.id;
      result.driveVoucherUrl = voucherOutcome.res.webViewLink;
    } else {
      result.voucherFailed = true;
    }
  }

  if (photoOutcome) {
    if (photoOutcome.ok) {
      result.drivePhotoFileId = photoOutcome.res.id;
      result.drivePhotoUrl = photoOutcome.res.webViewLink;
    } else {
      result.photoFailed = true;
    }
  }

  if (
    !result.driveVoucherFileId &&
    !result.drivePhotoFileId &&
    (result.voucherFailed || result.photoFailed)
  ) {
    const firstErr =
      (voucherOutcome && !voucherOutcome.ok && voucherOutcome.err) ||
      (photoOutcome && !photoOutcome.ok && photoOutcome.err);
    throw firstErr || new Error('No se pudo subir los archivos a Google Drive.');
  }

  return result;
}

/**
 * Reads an image or PDF preserving crisp HD clarity while keeping mobile uploads fast.
 * - PDFs and images <= 1.2 MB stay 100% untouched.
 * - Larger mobile camera photos (e.g. 4–12 MB) are gently encoded at up to 2048px / 90% JPEG
 *   (Full HD+ / 2K sharp quality for frames & vouchers, ~350–700 KB so 4G uploads finish in 2–4s).
 */
export function readImageFileHighQuality(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawData = String(event.target?.result || '');
      if (!rawData) {
        reject(new Error('No se pudo leer el archivo seleccionado.'));
        return;
      }

      if (!file.type.startsWith('image/') || file.size <= 1.2 * 1024 * 1024) {
        resolve(rawData);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 2048;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/jpeg', 0.9);
          resolve(optimized.length < rawData.length ? optimized : rawData);
        } else {
          resolve(rawData);
        }
      };
      img.onerror = () => resolve(rawData);
      img.src = rawData;
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compact temporary fallback (~120 KB) used ONLY if a runner's mobile browser/4G fails to reach Drive,
 * ensuring their registration + media are never lost and Admin Auto-Sync uploads them to Drive later.
 */
export function createCompactEmergencyBackup(dataUrl: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl && dataUrl.length < 400000 ? dataUrl : undefined);
      return;
    }
    if (dataUrl.length < 220000) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1100;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compact = canvas.toDataURL('image/jpeg', 0.78);
          resolve(compact.length < 450000 ? compact : canvas.toDataURL('image/jpeg', 0.65));
          return;
        }
      } catch (e) {}
      resolve(undefined);
    };
    img.onerror = () => resolve(undefined);
    img.src = dataUrl;
  });
}

export function getDriveFileLink(
  fileId?: string,
  driveUrl?: string,
  fallbackSrc?: string
): string | undefined {
  if (driveUrl) return driveUrl;
  if (fileId && !fileId.startsWith('bridge_')) {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
  return fallbackSrc;
}

export function getDriveImagePreviewUrl(
  fileId?: string,
  directSrc?: string
): string | undefined {
  if (directSrc && (directSrc.startsWith('data:') || directSrc.startsWith('/uploads/') || directSrc.includes('googleusercontent.com'))) {
    return directSrc;
  }
  if (fileId && !fileId.startsWith('bridge_')) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  }
  if (directSrc && !directSrc.includes('drive.google.com/file/d/') && !directSrc.includes('drive.google.com/drive/folders/')) {
    return directSrc;
  }
  return undefined;
}


