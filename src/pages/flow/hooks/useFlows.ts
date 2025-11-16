// src/hooks/useFlows.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flowApi } from "../../../lib/flow";
import { clearAuth } from "@/lib/auth";

export type Empresa = {
  id: string;
  nome: string;
  imagemUrl?: string | null;
};

export type FlowStatus = "draft" | "active" | "archived";

export type Flow = {
  id: string;
  titulo: string;
  descricao?: string | null;
  status: FlowStatus;
  createdAt: string | null;
};

export type AppItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  imageSquareUrl?: string | null;
  imageWideUrl?: string | null;
  // compat antigo
  flowId?: string | null;
  // multi-flow de verdade
  flowIds?: string[];
  // se a API já mandar a lista de flows:
  flows?: { id: string; titulo?: string | null }[];
};

export function useFlows() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [flowApps, setFlowApps] = useState<Record<string, AppItem | null>>({});
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [loadingFlows, setLoadingFlows] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);

  // 1) Carrega empresas
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await flowApi.getUserEmpresas();
        if (!alive) return;
        setEmpresas(Array.isArray(data.items) ? data.items : []);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          clearAuth();
          navigate(
            `/login?next=${encodeURIComponent(
              location.pathname + location.search
            )}`
          );
          return;
        }
        console.error("Erro ao carregar empresas:", err);
        setEmpresas([]);
      } finally {
        if (alive) setLoadingEmpresas(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  // 2) Seleciona empresa → carrega fluxos + apps
  const selectEmpresa = async (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setFlows([]);
    setFlowApps({});
    setLoadingFlows(true);
    setLoadingApps(true);

    // vamos guardar os flows aqui pra usar depois na etapa dos apps
    let loadedFlows: Flow[] = [];

    try {
      // Carrega fluxos
      const { data: flowData } = await flowApi.getFlows(empresa.id);
      const items = Array.isArray(flowData.items) ? flowData.items : [];

      loadedFlows = items as Flow[]; // já está no formato certo na sua API
      setFlows(loadedFlows);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        clearAuth();
        navigate(
          `/login?next=${encodeURIComponent(
            location.pathname + location.search
          )}`
        );
        return;
      }
      console.error("Erro ao carregar fluxos:", err);
      loadedFlows = [];
      setFlows([]);
    } finally {
      setLoadingFlows(false);
    }

    try {
      // Carrega TODOS os apps da empresa
      const { data: appsData } = await flowApi.getApps(empresa.id);
      const appsList = Array.isArray(appsData.items) ? appsData.items : [];

      // Normaliza apps com multi-flow
      const normalizedApps: AppItem[] = appsList.map((a: any) => {
        const flowsFromObj = Array.isArray(a.flows)
          ? a.flows.map((f: any) => f?.id).filter(Boolean)
          : [];

        const flowIds = flowsFromObj;

        return {
          id: a.id,
          nome: a.nome,
          descricao: a.descricao ?? null,
          imageSquareUrl: a.imageSquareUrl ?? null,
          imageWideUrl: a.imageWideUrl ?? null,
          flowId: a.flowId ?? flowIds[0] ?? null, // compat
          flowIds,
          flows: Array.isArray(a.flows) ? a.flows : undefined,
        };
      });

      // Monta o mapa: flowId → App (para TODOS os flows do app)
      const map: Record<string, AppItem | null> = {};

      normalizedApps.forEach((app) => {
        const ids: string[] = [];

        if (Array.isArray(app.flowIds) && app.flowIds.length > 0) {
          ids.push(...app.flowIds);
        } else if (app.flowId) {
          ids.push(app.flowId);
        }

        ids.forEach((fid) => {
          if (!fid) return;
          map[fid] = app;
        });
      });

      // Preenche com null os fluxos que não têm app
      const next: Record<string, AppItem | null> = {};
      loadedFlows.forEach((f) => {
        next[f.id] = map[f.id] ?? null;
      });

      setFlowApps(next);
    } catch (err) {
      console.warn("Erro ao carregar apps para vinculação", err);
      setFlowApps({});
    } finally {
      setLoadingApps(false);
    }
  };

  // 3) Auto-seleciona única empresa
  useEffect(() => {
    if (empresas.length === 1 && !selectedEmpresa) {
      selectEmpresa(empresas[0]);
    }
  }, [empresas, selectedEmpresa]);

  // 4) Se chegarem novos flows depois, garante chave no flowApps
  useEffect(() => {
    if (flows.length > 0) {
      setFlowApps((prev) => {
        const next = { ...prev };
        flows.forEach((f) => {
          if (!(f.id in next)) next[f.id] = null;
        });
        return next;
      });
    }
  }, [flows]);

  return {
    empresas,
    selectedEmpresa,
    selectEmpresa,
    flows,
    flowApps,
    loadingEmpresas,
    loadingFlows,
    // simples: enquanto estiver carregando apps, todos os flows ficam "loading"
    loadingAppMap: loadingApps
      ? Object.fromEntries(flows.map((f) => [f.id, true]))
      : {},
    setSelectedEmpresa,
  };
}
