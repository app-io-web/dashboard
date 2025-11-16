// src/lib/auth.ts
export type AuthUser = {
  id: string;
  name?: string | null;
  email: string;
  role?: "OWNER" | "ADMIN" | "MEMBER";
};

type LoginResponse = {
  accessToken: string; // JWT gerado pelo teu backend
  user: AuthUser;
};

const STORAGE_KEY = "app:auth";

export function saveAuth(res: LoginResponse, remember: boolean) {
  const payload = JSON.stringify(res);
  // grava em um só lugar
  if (remember) {
    localStorage.setItem(STORAGE_KEY, payload);
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, payload);
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function loadAuth(): LoginResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse;
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken() {
  return loadAuth()?.accessToken ?? null;
}

export function getUser() {
  return loadAuth()?.user ?? null;
}

/** Atualiza somente o accessToken preservando o storage usado (local OU session) */
export function updateAccessToken(newToken: string) {
  const auth = loadAuth();
  if (!auth) return;
  const next = JSON.stringify({ ...auth, accessToken: newToken });

  if (localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, next);
  } else if (sessionStorage.getItem(STORAGE_KEY)) {
    sessionStorage.setItem(STORAGE_KEY, next);
  } else {
    // fallback: se nada encontrado, grava em session
    sessionStorage.setItem(STORAGE_KEY, next);
  }
}
