// Serviço genérico para falar com SUA API (Express, Fastify, etc.) que acessa o Postgres.
// Ajuste BASE_URL se precisar (ou use VITE_API_URL no .env)

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

type FetchOpts = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function api<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

/** Atualiza parcialmente um App por ID (PATCH /apps/:id) */
export async function updateApp<T extends object>(
  id: number | string,
  patch: Partial<T>
): Promise<T> {
  return api<T>(`/apps/${id}`, { method: "PATCH", body: patch });
}

/** (Opcional) rota específica pra comandos, se preferir separar */
export async function updateAppCommands<T extends object>(
  id: number | string,
  comandos: unknown
): Promise<T> {
  return api<T>(`/apps/${id}/comandos`, { method: "PUT", body: { comandos } });
}
