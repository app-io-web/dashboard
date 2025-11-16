// src/pages/details/hooks/useActivityLogger.ts
import { useCallback } from "react";
import type { AppDetails, Atividade } from "../../types";
import { criarAtividade } from "@/utils/activity";
import { useSaveApp } from "../hooks/useSaveApp";

type Options = {
  app: AppDetails | null;
  onAfterSave?: (updated: AppDetails) => void;
};

export function useActivityLogger({ app, onAfterSave }: Options) {
  const appId = app?.Id ?? app?.id;
  const { save } = useSaveApp(appId);

  const log = useCallback(
    async (tipo: Atividade["tipo"], texto: string, meta?: Record<string, unknown>) => {
      if (!app) return; // nada pra logar ainda

      const nova = criarAtividade(tipo, texto, meta);
      const atividades = [nova, ...(app.atividades ?? [])];
      const payload: Partial<AppDetails> = { atividades };

      const updated = await save(payload);
      onAfterSave?.(updated);
      return updated;
    },
    [app, onAfterSave, save]
  );

  return { log };
}
