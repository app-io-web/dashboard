// src/pages/details/hooks/useSaveAppActions.ts
import { useCallback } from "react";
import { api } from "@/lib/http";

export type ImportantUrl = { id: string; label: string; url: string };
export type AdminCredFront =
  | { kind: "setPasswordUrl"; loginEmail: string; setPasswordUrl: string; tempPassword?: never }
  | { kind: "tempPassword";   loginEmail: string; tempPassword: string;   setPasswordUrl?: never };

// completa http(s) se vier sem protocolo
function normalizeUrl(s: string) {
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

// mapeia pro backend (reset|temp)
function mapCredToServer(cred: AdminCredFront | null) {
  if (!cred) return null;
  if (cred.kind === "setPasswordUrl") {
    return { kind: "reset", loginEmail: cred.loginEmail, setPasswordUrl: cred.setPasswordUrl };
  }
  return { kind: "temp", loginEmail: cred.loginEmail, tempPassword: cred.tempPassword };
}

/**
 * Hook para salvar ações do app:
 * - aplica mutate otimista (UI atualiza na hora)
 * - envia PATCH pro servidor
 * - revalida o cache (confirma/rollback)
 *
 * `mutate` deve ser o mutate do seu useDetailsPageController (SWR-like):
 *   mutate(updater, { revalidate?: boolean })
 */
export function useSaveAppActions(
  ref?: string | number,
  mutate?: (updater?: any, opts?: { revalidate?: boolean }) => Promise<any> | any
) {
  return useCallback(
    async (payload: { urls: ImportantUrl[]; cred: AdminCredFront | null }) => {
      if (!ref) throw new Error("App ref ausente");

      // 1) OTIMISTA: aplica no cache local imediatamente
      await Promise.resolve(
        mutate?.((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            importantUrls: payload.urls,
            adminCredential: payload.cred,
          };
        }, { revalidate: false })
      );

      try {
        // 2) BACKEND: normaliza e envia
        const body = {
          importantUrls: (payload.urls || []).map(u => ({
            id: String(u.id || "").trim(),
            label: String(u.label || "").trim(),
            url: normalizeUrl(String(u.url || "").trim()),
          })),
          adminCredential: mapCredToServer(payload.cred),
        };

        await api.patch(`/apps/${encodeURIComponent(String(ref))}`, body);

        // 3) CONFIRMAÇÃO: revalida pra garantir consistência
        await Promise.resolve(mutate?.(undefined, { revalidate: true }));
      } catch (err) {
        // 4) ROLLBACK simples: revalida trazendo estado do servidor
        await Promise.resolve(mutate?.(undefined, { revalidate: true }));
        throw err;
      }
    },
    [ref, mutate]
  );
}
