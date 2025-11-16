// src/utils/activity.ts
import type { Atividade } from "@/pages/details/types";

export function criarAtividade(
  tipo: Atividade["tipo"],
  texto: string,
  meta?: Record<string, unknown>
): Atividade {
  return {
    tipo,
    texto,
    quando: new Date().toISOString(),
    meta,
  };
}

// helper para formatar quando (exibição)
export function formatarQuando(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}
