// components/Toolbar.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type React from "react";
import { api } from "@/lib/http";

type AppBasic = {
  id: string;
  nome: string;
  empresa?: { nome: string } | null;
  flowId?: string | null;
  flowIds?: string[];
};

interface Props {
  title: string;
  onSave: () => void;
  isSaving: boolean;
  onBack: () => void;
  flowId?: string;
  empresaId?: string;
  app?: AppBasic | null;
  onAppDetected?: (app: AppBasic | null) => void;
}

export default function Toolbar({
  title,
  onSave,
  isSaving,
  onBack,
  flowId,
  empresaId,
  app: appFromHook,
  onAppDetected,
}: Props) {
  const navigate = useNavigate();
  const [appVinculado, setAppVinculado] = useState<AppBasic | null>(appFromHook ?? null);
  const [isLoadingApp, setIsLoadingApp] = useState(false);

  useEffect(() => {
    console.log("=== [Toolbar] EFFECT RODANDO ===");
    console.log("flowId:", flowId, "empresaId:", empresaId, "appFromHook:", appFromHook);

    if (!flowId || !empresaId) {
      console.log("[Toolbar] Fluxo novo ou sem empresa. Usando appFromHook:", appFromHook);
      setAppVinculado(appFromHook ?? null);
      onAppDetected?.(appFromHook ?? null);
      return;
    }

    let cancelled = false;
    setIsLoadingApp(true);

    const loadApp = async () => {
      console.log("[Toolbar] Consultando API /apps?empresaId=" + empresaId);

      try {
        const { data } = await api.get<{ items: any[] }>("/apps", {
          params: { empresaId },
        });

        if (cancelled) return;

        console.log("[Toolbar] RESPOSTA /apps:", data);

        const appsList: AppBasic[] = (data?.items ?? []).map((a: any) => {
          const flowIdsFromApi: string[] = [];

          if (Array.isArray(a.flowIds)) {
            flowIdsFromApi.push(...a.flowIds);
          }

          if (Array.isArray(a.flows)) {
            flowIdsFromApi.push(
              ...a.flows
                .map((f: any) => f?.id)
                .filter((id: any): id is string => typeof id === "string")
            );
          }

          if (a.flowId && typeof a.flowId === "string") {
            flowIdsFromApi.push(a.flowId);
          }

          const uniqueFlowIds = Array.from(new Set(flowIdsFromApi));

          const appNorm: AppBasic = {
            id: a.id,
            nome: a.nome,
            empresa: a.empresa ?? { nome: a.empresaNome ?? null },
            flowId: a.flowId ?? null,
            flowIds: uniqueFlowIds,
          };

          console.log("[Toolbar] app normalizado:", appNorm);

          return appNorm;
        });

        console.log("[Toolbar] appsList normalizado:", appsList);

        const vinculado =
          appsList.find((a) => {
            if (!flowId) return false;

            const match =
              (Array.isArray(a.flowIds) && a.flowIds.includes(flowId)) ||
              a.flowId === flowId;

            if (match) {
              console.log(
                "[Toolbar] MATCH encontrado para flowId",
                flowId,
                "no app",
                a.id,
                "flowIds:",
                a.flowIds,
                "flowId (legacy):",
                a.flowId
              );
            }

            return match;
          }) ?? null;

        if (!vinculado) {
          console.log(
            "[Toolbar] Nenhum app vinculado a este fluxo.",
            "flowId procurado:",
            flowId
          );
        }

        setAppVinculado(vinculado);
        onAppDetected?.(vinculado);
      } catch (err) {
        console.error("[Toolbar] ERRO ao consultar /apps", err);
        setAppVinculado(null);
        onAppDetected?.(null);
      } finally {
        if (!cancelled) {
          console.log("[Toolbar] carregamento finalizado.");
          setIsLoadingApp(false);
        }
      }
    };

    loadApp();

    return () => {
      cancelled = true;
      console.log("[Toolbar] EFFECT cancelado.");
    };
  // 🔥 TIRA o onAppDetected daqui pra parar o loop
  }, [flowId, empresaId, appFromHook]);

  const app = appVinculado ?? null;

  const isVinculadoAEsteFluxo =
    !!flowId &&
    !!app &&
    (Array.isArray(app.flowIds)
      ? app.flowIds.includes(flowId)
      : app.flowId === flowId);

  const estaVinculadoAOutroFluxo =
    !!flowId &&
    !!app &&
    (Array.isArray(app.flowIds)
      ? app.flowIds.some((id) => id !== flowId)
      : !!app.flowId && app.flowId !== flowId);

  const goToApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (app?.id && empresaId) {
      navigate(`/apps/${app.id}?empresaId=${empresaId}`);
    }
  };

  const goToSettings = () => {
    if (flowId && empresaId) {
      navigate(`/flow/${flowId}/settings?empresaId=${empresaId}`);
    }
  };

  return (
    <div className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          ← Voltar
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

          {isLoadingApp ? (
            <div className="text-sm text-gray-400 mt-1">Carregando app...</div>
          ) : app ? (
            <div className="text-sm text-gray-500 mt-1">
              <span className="text-gray-400">App:</span>{" "}
              <button
                onClick={goToApp}
                className="text-blue-600 hover:underline font-medium cursor-pointer bg-transparent border-none"
                title={`Ir para o app ${app.nome}`}
              >
                {app.nome}
              </button>

              {app.empresa?.nome && (
                <>
                  {" "}
                  <span className="text-gray-400">•</span>{" "}
                  <span className="text-gray-600">{app.empresa.nome}</span>
                </>
              )}

              {isVinculadoAEsteFluxo && (
                <>
                  {" "}
                  <span className="text-gray-400">•</span>{" "}
                  <span className="text-emerald-700 font-medium">
                    vinculado a este fluxo
                  </span>
                </>
              )}

              {estaVinculadoAOutroFluxo && (
                <>
                  {" "}
                  <span className="text-gray-400">•</span>{" "}
                  <span className="text-amber-600 font-medium">
                    também usado em outros fluxos
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400 mt-1">Sem app vinculado</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {flowId && empresaId && (
          <button
            onClick={goToSettings}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Configurações
          </button>
        )}

        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
