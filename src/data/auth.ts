// Sistema de autenticación para el Panel de Administrador de OHANA GO

const ADMIN_CREDENTIALS_KEY = 'ohana_admin_creds_v1';
const ADMIN_SESSION_KEY = 'ohana_admin_session_v1';

export interface AdminCredentials {
  username: string;
  passwordHash: string; // Plaintext or simple base for local storage in client applet
}

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'ohana2026',
};

export const getAdminCredentials = () => {
  try {
    const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CREDENTIALS;
  }
};

export const updateAdminPassword = (newPassword: string): boolean => {
  try {
    const current = getAdminCredentials();
    const updated = { ...current, password: newPassword };
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
};

export const checkAdminLogin = (usernameInput: string, passwordInput: string): boolean => {
  const creds = getAdminCredentials();
  const isValid =
    (usernameInput.trim().toLowerCase() === creds.username.toLowerCase() ||
     usernameInput.trim().toLowerCase() === 'ohanago') &&
    passwordInput.trim() === creds.password;

  if (isValid) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  }
  return isValid;
};

export const isAdminAuthenticated = (): boolean => {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
};

export const adminLogout = () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};

export const DEFAULT_ADMIN_INFO = {
  user: 'admin',
  pass: 'ohana2026',
};
