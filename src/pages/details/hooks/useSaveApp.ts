// src/pages/details/hooks/useSaveApp.ts
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { AppDetails } from "../types";

// remove undefined recursivamente (não mexe em null)
function stripUndefinedDeep<T>(obj: T): T {
  if (obj === undefined) return obj as any;
  if (obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(stripUndefinedDeep) as any;
  if (typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj as any)) {
      if (v === undefined) continue;
      out[k] = stripUndefinedDeep(v as any);
    }
    return out;
  }
  return obj;
}

export function useSaveApp(id: string | number, opts?: { onSuccess?: (updated: AppDetails) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (patch: Partial<AppDetails>) => {
    setSaving(true);
    setError(null);
    try {
      const hasComandos = Object.prototype.hasOwnProperty.call(patch, "comandos");
      const method = hasComandos ? "put" : "patch"; // <- regra de ouro
      const body = stripUndefinedDeep(patch);       // <- manda SÓ o patch

      const res = await api.request<AppDetails>({ url: `/apps/${id}`, method, data: body });
      const updated = res.data;
      opts?.onSuccess?.(updated);
      return updated;
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  }, [id, opts]);

  return { save, saving, error };
}
