// src/lib/http.ts
import axios from "axios";
import { pushToast } from "@/lib/toast";
import { getAccessToken, clearAuth } from "./auth"; // token + clear

// ----------------------------------------------------
// BASES
// ----------------------------------------------------
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3333";
const mailBase = import.meta.env.VITE_EMAIL_SERVER_URL || "http://localhost:4008";

if (!import.meta.env.VITE_EMAIL_SERVER_URL) {
  console.warn("[mailer] VITE_EMAIL_SERVER_URL não definido; usando fallback:", mailBase);
}

export const api = axios.create({ baseURL: apiBase, timeout: 12000, withCredentials: false });
export const mailer = axios.create({ baseURL: mailBase, timeout: 12000, withCredentials: false });

// debug opcional
console.log("[api]    baseURL:", apiBase);
console.log("[mailer] baseURL:", mailBase);

// ----------------------------------------------------
// REQUEST: nunca enviar body "null" em JSON
// - Se método for POST/PUT/PATCH e data === null => {}
// - Não mexe em FormData/Blob/ArrayBuffer
// ----------------------------------------------------
function coerceNullBody(client: typeof api) {
  client.interceptors.request.use((cfg) => {
    const m = (cfg.method || "get").toLowerCase();
    const isWrite = m === "post" || m === "put" || m === "patch";

    // já é algo "binário"? deixa quieto
    const d = cfg.data;
    const isBinary =
      typeof Blob !== "undefined" && d instanceof Blob ||
      typeof FormData !== "undefined" && d instanceof FormData ||
      typeof ArrayBuffer !== "undefined" && d instanceof ArrayBuffer;

    if (isWrite && d === null && !isBinary) {
      // manda {} para endpoints JSON que não exigem corpo
      cfg.data = {};
      // só seta content-type se o dev não definiu (evita mexer em uploads)
      cfg.headers = { "Content-Type": "application/json", ...(cfg.headers || {}) };
    }

    return cfg;
  });
}

// aplica nos dois clientes
coerceNullBody(api);
coerceNullBody(mailer);

// ----------------------------------------------------
// TOASTS AUTOMÁTICOS PARA /emails/send
// ----------------------------------------------------
function wireEmailToasts(client: typeof api) {
  client.interceptors.response.use(
    (r) => {
      const method = r.config?.method?.toLowerCase();
      const url = r.config?.url ?? "";
      if (method === "post" && /\/emails\/send(\?|$)/i.test(url)) {
        pushToast("Notificação enviada com sucesso.", "success");
      }
      return r;
    },
    (err) => {
      const url = err?.config?.url ?? "";
      const rawMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Falha na comunicação.";
      if (/\/emails\/send(\?|$)/i.test(url)) {
        pushToast(`Falha ao enviar e-mail: ${rawMsg}`, "error");
      }
      err.message = rawMsg; // preserva o resto do erro
      return Promise.reject(err);
    }
  );
}
wireEmailToasts(api);
wireEmailToasts(mailer);

// ----------------------------------------------------
// INTERCEPTOR GENÉRICO PADRÃO (sem trocar o erro)
// ----------------------------------------------------
for (const c of [api, mailer]) {
  c.interceptors.response.use(
    (r) => r,
    (err) => {
      const rawMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Falha na comunicação.";
      err.message = rawMsg; // preserva status/headers/response
      return Promise.reject(err);
    }
  );
}



// ----------------------------------------------------
// AUTH: helper de redirect pra login (HashRouter + GitHub Pages)
// ----------------------------------------------------
function redirectToLoginFrom401() {
  try {
    const base = import.meta.env.BASE_URL || "/"; // ex: "/" em dev, "/dashboard/" no gh-pages

    // Em HashRouter o path real está no hash:
    //   http://localhost:5173/#/flows        -> "#/flows"
    //   https://.../dashboard/#/flows       -> "#/flows"
    const hash = window.location.hash || "";
    let fromPath = hash.replace(/^#/, "") || "/";

    // evita loop se já estiver no login
    if (fromPath.startsWith("/login")) {
      fromPath = "/";
    }

    const target = `${base}#/login?from=${encodeURIComponent(fromPath)}`;

    // se já estamos no login, não redireciona de novo
    if (!window.location.hash.startsWith("#/login")) {
      window.location.assign(target);
    }
  } catch {
    // deixa quieto se der algum erro bizarro de window/location
  }
}

// ----------------------------------------------------
// AUTH: Authorization + tratamento de 401 (com eject no HMR)
// ----------------------------------------------------
let authEjectors: { req?: number; res?: number } = {};

export function wireAuth() {
  // limpa interceptors antigos (HMR)
  if (authEjectors.req != null) api.interceptors.request.eject(authEjectors.req);
  if (authEjectors.res != null) api.interceptors.response.eject(authEjectors.res);

  // Request: adiciona Bearer automaticamente
  authEjectors.req = api.interceptors.request.use((cfg) => {
    const token = getAccessToken?.();
    if (token) {
      cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` };
    }
    return cfg;
  });

  // Response: 401 => limpa sessão e manda pro login certo
  authEjectors.res = api.interceptors.response.use(
    (r) => r,
    (err) => {
      const status = err?.response?.status;
      if (status === 401) {
        try { clearAuth?.(); } catch {}
        redirectToLoginFrom401();
      }
      return Promise.reject(err);
    }
  );
}
wireAuth();

// ----------------------------------------------------
// AUTH: também para o mailer (SMTP config é protegido)
// ----------------------------------------------------
let mailerAuthEjectors: { req?: number; res?: number } = {};

export function wireMailerAuth() {
  // limpa interceptors antigos (HMR)
  if (mailerAuthEjectors.req != null) mailer.interceptors.request.eject(mailerAuthEjectors.req);
  if (mailerAuthEjectors.res != null) mailer.interceptors.response.eject(mailerAuthEjectors.res);

  // Request: adiciona Bearer
  mailerAuthEjectors.req = mailer.interceptors.request.use((cfg) => {
    const token = getAccessToken?.();
    if (token) {
      cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` };
    }
    return cfg;
  });

  // Response: 401 → limpa auth e redireciona
  mailerAuthEjectors.res = mailer.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err?.response?.status === 401) {
        try { clearAuth?.(); } catch {}
        redirectToLoginFrom401();
      }
      return Promise.reject(err);
    }
  );
}







// ----------------------------------------------------
// SHIMS (mantidos para compat)
// ----------------------------------------------------
export function get<T = any>(url: string, config?: any) {
  return api.get<T>(url, config);
}
export function post<T = any>(url: string, data?: any, config?: any) {
  return api.post<T>(url, data, config);
}
export function patch<T = any>(url: string, data?: any, config?: any) {
  return api.patch<T>(url, data, config);
}
export function del<T = any>(url: string, config?: any) {
  return api.delete<T>(url, config);
}

export const mail = {
  get:  <T = any>(url: string, config?: any) => mailer.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => mailer.post<T>(url, data, config),
  patch:<T = any>(url: string, data?: any, config?: any) => mailer.patch<T>(url, data, config),
  del:  <T = any>(url: string, config?: any) => mailer.delete<T>(url, config),
};
