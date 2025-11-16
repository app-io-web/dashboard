// src/lib/api.ts
import axios from "axios";
import { getAccessToken, updateAccessToken, clearAuth } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/** Anexa Authorization: Bearer <token> em toda request */
api.interceptors.request.use((config) => {
  const tok = getAccessToken();
  if (tok) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${tok}`;
  }
  return config;
});

let isRefreshing = false;
let queuedResolvers: Array<(t: string) => void> = [];

async function runRefresh(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve) => queuedResolvers.push(resolve));
  }
  isRefreshing = true;
  try {
    /**
     * Estratégia comum: refresh por cookie httpOnly.
     * Backend: POST /auth/refresh (Set-Cookie do refresh token no login).
     * Se o seu refresh vier no body com refreshToken, adapte aqui.
     */
    const { data } = await axios.post(
      `${BASE_URL}/auth/refresh`,
      null,
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );

    const newAccess: string = data?.accessToken ?? data?.access ?? data?.token;
    if (!newAccess) throw new Error("invalid_refresh_response");

    updateAccessToken(newAccess);
    queuedResolvers.forEach((r) => r(newAccess));
    queuedResolvers = [];
    return newAccess;
  } finally {
    isRefreshing = false;
  }
}

/** Normaliza erros */
function asErrorMessage(err: any) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Falha na comunicação."
  );
}

/** Revalidação automática ao pegar 401 */
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const status = err?.response?.status;
    const original = err?.config;

    if (status === 401 && original && !original._retry) {
      try {
        original._retry = true;
        const newTok = await runRefresh();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newTok}`;
        return api.request(original);
      } catch {
        clearAuth();
        // opcional: redirecione para login
        // window.location.replace("/login");
      }
    }

    return Promise.reject(new Error(asErrorMessage(err)));
  }
);
