// src/components/flow/CreateFlowModal/useCreateFlowModal.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/http";
import { clearAuth } from "@/lib/auth";

export type AppItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  imageSquareUrl?: string | null;
};

export function useCreateFlowModal(
  empresaId: string,
  open: boolean,
  onClose: () => void
) {
  const navigate = useNavigate();

  // --- estado da lista de apps ---
  const [apps, setApps] = useState<AppItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // --- estado do formulário ---
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("Novo fluxo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 1) CARREGAR APPS DA EMPRESA QUANDO O MODAL ABRIR
  // ============================================================
  useEffect(() => {
    if (!open || !empresaId) return;

    // resetar sempre que abrir
    setSelectedAppId(null);
    setError(null);
    setNewTitle("Novo fluxo");

    const loadApps = async () => {
      try {
        setAppsLoading(true);

        const res = await api.get("/apps", {
          params: { empresaId },
        });

        const data = res.data;

        console.log("RAW DATA APPS:", data);

        const list: AppItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.apps)
          ? data.apps
          : Array.isArray(data?.items)
          ? data.items
          : [];

        console.log("APPS DO MODAL:", list);

        setApps(list);
      } catch (err: any) {
        console.error("Erro ao carregar apps no modal", err);
        setError("Não foi possível carregar os apps desta empresa.");
      } finally {
        setAppsLoading(false);
      }
};




    loadApps();
  }, [open, empresaId]);

  // ============================================================
  // 2) CRIAR FLUXO
  //    bindApp = true  -> cria já vinculado ao selectedAppId
  //    bindApp = false -> cria sem appId (Definir depois)
  // ============================================================
  const createFlow = async (bindApp: boolean) => {
    if (!empresaId) return;

    if (bindApp && !selectedAppId) {
      setError("Selecione um app para criar o fluxo vinculado.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: any = {
        titulo: newTitle?.trim() || "Novo fluxo",
        empresaId,
      };

      if (bindApp && selectedAppId) {
        payload.appId = selectedAppId;
      }

      const res = await api.post("/flows", payload);
      const data = res.data;
      const flow = data.flow ?? data;

      onClose();

      if (flow?.id) {
        navigate(`/flow/${flow.id}?empresaId=${empresaId}`);
      }
    } catch (err: any) {
      console.error("Erro ao criar fluxo", err);

      if (err?.response?.status === 401) {
        clearAuth();
        window.location.href = "/login";
        return;
      }

      const msg =
        err?.response?.data?.message ||
        "Não foi possível criar o fluxo. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    apps,
    appsLoading,
    selectedAppId,
    setSelectedAppId,
    newTitle,
    setNewTitle,
    loading,
    error,
    createFlow,
  };
}
