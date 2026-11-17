import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import app from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { RunnerRegistration } from '../types/race';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

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
  try {
    isSigningIn = true;
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
      // If user explicitly closed the popup, do not open another popup automatically
      if (code === 'auth/popup-closed-by-user' || code === 'auth/user-cancelled') {
        throw new Error('Cerraste la ventana de inicio de sesión antes de completar.');
      }

      // Attempt Google Identity Services token client fallback for popup/handler/domain issues
      try {
        const gisRes = await signInWithGisFallback();
        return {
          user: { email: gisRes.email },
          accessToken: gisRes.accessToken,
        };
      } catch (gisErr: any) {
        if (code === 'auth/unauthorized-domain') {
          throw new Error(
            `Dominio no autorizado (${window.location.hostname}). Abre el panel desde la URL oficial de la app o autoriza "${window.location.hostname}" en Firebase Auth y Google Cloud OAuth.`
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

async function findOrCreateFolder(
  accessToken: string,
  folderName: string,
  parentId?: string
): Promise<string> {
  const parentFilter = parentId ? ` and '${parentId}' in parents` : '';
  const query = `name = '${escapeDriveQuery(folderName)}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${parentFilter}`;

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (searchRes.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Error buscando carpeta "${folderName}": ${errText}`);
  }

  const searchData = await searchRes.json();
  if (Array.isArray(searchData.files) && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (createRes.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Error creando carpeta "${folderName}": ${errText}`);
  }

  const created = await createRes.json();
  return created.id;
}

export async function ensureOhanaDriveFolders(
  accessToken: string
): Promise<OhanaDriveFolders> {
  if (cachedFolders) return cachedFolders;

  const rootFolderId = await findOrCreateFolder(
    accessToken,
    'OHANA GO - Santa Run 2026'
  );
  const vouchersFolderId = await findOrCreateFolder(
    accessToken,
    'Constancias Yape - Santa Run 2026',
    rootFolderId
  );
  const photosFolderId = await findOrCreateFolder(
    accessToken,
    'Fotos Atletas - Santa Run 2026',
    rootFolderId
  );

  cachedFolders = {
    rootFolderId,
    vouchersFolderId,
    photosFolderId,
    rootFolderUrl: `https://drive.google.com/drive/folders/${rootFolderId}`,
    vouchersFolderUrl: `https://drive.google.com/drive/folders/${vouchersFolderId}`,
    photosFolderUrl: `https://drive.google.com/drive/folders/${photosFolderId}`,
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
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media&fields=id,name,webViewLink`,
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
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(existingQuery)}&fields=files(id,name,webViewLink)&spaces=drive`,
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
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
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
