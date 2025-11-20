// src/lib/auth.ts
export type AuthUser = {
  id: string;
  name?: string | null;
  email: string;
  role?: "OWNER" | "ADMIN" | "MEMBER";
  isSuperUser?: boolean; // 👈 vindo do backend
};

type LoginResponse = {
  accessToken: string; // JWT gerado pelo teu backend
  user: AuthUser;
};

const STORAGE_KEY = "app:auth";

// chaves usadas no portal da empresa (compat com o que você já salva no login)
const EMPRESA_TOKEN_KEY = "empresaToken";
const EMPRESA_INFO_KEY = "empresaInfo";

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
  const raw =
    localStorage.getItem(STORAGE_KEY) ??
    sessionStorage.getItem(STORAGE_KEY);
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

/* =======================================================================
 *  PORTAL DA EMPRESA – helpers simples, compat com o que você já usa
 * =======================================================================
 */

/** Lê o token do portal da empresa (gravado no login da empresa) */
export function getEmpresaToken(): string | null {
  try {
    return localStorage.getItem(EMPRESA_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Limpa sessão do portal da empresa */
export function clearEmpresaAuth() {
  try {
    localStorage.removeItem(EMPRESA_TOKEN_KEY);
    localStorage.removeItem(EMPRESA_INFO_KEY);
  } catch {
    // sem drama se falhar
  }
}
