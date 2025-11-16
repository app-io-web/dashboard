// FlowSettings.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "@/lib/http";

type AppItem = {
  id: string;
  nome: string;
  empresaId: string | null;
  empresaNome?: string | null;
  flowId?: string | null;     // primeiro flow (compat)
  flowIds?: string[];         // todos os flows vinculados
  // opcional: se quiser usar depois
  // flows?: { id: string; titulo?: string | null }[];
};

export default function FlowSettings() {
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();
  const empresaId = sp.get("empresaId") || "";
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [apps, setApps] = useState<AppItem[]>([]);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const disabled = !id || !empresaId;

  const selectedApp = useMemo(
    () => apps.find((app) => app.id === currentAppId) ?? null,
    [apps, currentAppId]
  );

  // =============================================
  // Carrega dados do fluxo (nome/descrição)
  // =============================================
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get(`/flows/${id}`);
        if (cancelled) return;

        const nome = data?.flow?.nome ?? data?.nome ?? data?.titulo ?? "";
        const desc = data?.flow?.descricao ?? data?.descricao ?? "";

        setTitle(nome || "");
        setDescription(desc || "");
      } catch {
        if (!cancelled) {
          setTitle("");
          setDescription("");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =============================================
  // Carrega apps e descobre o vinculado pelo flowId
  // =============================================
  useEffect(() => {
    if (!id || !empresaId) return;

    let isCancelled = false;

    const loadApps = async () => {
      try {
        const { data } = await api.get("/apps", { params: { empresaId } });
        if (isCancelled) return;

        const listaApps: AppItem[] = (data?.items ?? []).map((a: any) => {
          // a.flows vem do backend (apps.ts):
          // flows: flowsByAppId.get(a.id) ?? []
          const flows = Array.isArray(a.flows) ? a.flows : [];

          const flowIds: string[] = flows
            .map((f: any) => f?.id)
            .filter(Boolean);

          return {
            id: a.id,
            nome: a.nome,
            empresaId: a.empresaId ?? a.empresa?.id ?? null,
            empresaNome: a.empresaNome ?? a.empresa?.nome ?? null,
            flowId: a.flowId ?? flowIds[0] ?? null, // compat
            flowIds,
          };
        });

        setApps(listaApps);

        // encontra se este flow já está vinculado a algum app
        const appVinculado = listaApps.find((app) => {
          if (!id) return false;
          const flows = flowsFor(app);
          return flows.includes(id);
        });

        setCurrentAppId(appVinculado?.id ?? null);
      } catch {
        if (!isCancelled) {
          setApps([]);
          setCurrentAppId(null);
        }
      }
    };

    loadApps();
    return () => {
      isCancelled = true;
    };
  }, [id, empresaId]);

  const flowsFor = (app: AppItem): string[] => {
    if (Array.isArray(app.flowIds) && app.flowIds.length > 0) return app.flowIds;
    return app.flowId ? [app.flowId] : [];
  };

  const otherFlowCount = (app: AppItem) => {
    if (!id) return 0;
    return flowsFor(app).filter((flow) => flow && flow !== id).length;
  };

  const labelFor = (app: AppItem) => {
    if (!app.id) return app.nome;
    const flows = flowsFor(app);
    const count = flows.length;
    if (!count) return app.nome;

    const onThisFlow = id ? flows.includes(id) : false;
    if (onThisFlow && count === 1) return `${app.nome} — vinculado a este fluxo`;
    if (onThisFlow && count > 1)
      return `${app.nome} — vinculado a este e +${count - 1} fluxo(s)`;
    return `${app.nome} — já vinculado a ${count} fluxo${count > 1 ? "s" : ""}`;
  };

  const options = useMemo(
    () => [{ id: "", nome: "— Nenhum —" }, ...apps],
    [apps]
  );

  const onSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      // 1) Descobre o que mudou (nome/descrição)
      const { data: getData } = await api.get(`/flows/${id}`);
      const currentNome = getData?.flow?.nome ?? getData?.nome ?? getData?.titulo ?? "";
      const currentDesc = getData?.flow?.descricao ?? getData?.descricao ?? "";

      const payload: Record<string, any> = {};
      const newNome = (title ?? "").trim();
      const newDesc = (description ?? "").trim();

      if (newNome && newNome !== currentNome) payload.nome = newNome;
      if (newDesc !== (currentDesc ?? "")) payload.descricao = newDesc || null;

      if (Object.keys(payload).length > 0) {
        await api.patch(`/flows/${id}`, payload);
      }

      // 2) Atualiza vínculo appId do flow
      await api.patch(
        `/flows/${id}/app`,
        { appId: currentAppId || null },
        { params: { empresaId } }
      );

      navigate(`/flow/${id}?empresaId=${empresaId}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center">
        {/* ESQUERDA: título + status do app vinculado exibido DIRETO */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            ← Voltar
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Configurações do Fluxo</h1>
            {selectedApp ? (
              <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                <span className="text-gray-400">•</span>{" "}
                <span className="text-gray-500">App:</span>{" "}
                <a
                  href={`/apps/${selectedApp.id}?empresaId=${empresaId}`}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition text-xs font-medium"
                  title={`Ir para o app ${selectedApp.nome}`}
                >
                  <span>{selectedApp.nome}</span>
                  {selectedApp.empresaNome && (
                    <span className="text-[10px] text-gray-500">{selectedApp.empresaNome}</span>
                  )}
                </a>
                <span className="text-gray-400">•</span>{" "}
                <span className="text-emerald-700 font-medium">
                  vinculado a este fluxo
                </span>
                {otherFlowCount(selectedApp) > 0 && (
                  <>
                    <span className="text-gray-400">•</span>{" "}
                    <span className="text-amber-600 font-medium">
                      também usado em {otherFlowCount(selectedApp)} outro(s) fluxo(s)
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-400">Sem app vinculado</div>
            )}
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={isSaving || disabled}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Fluxo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">App vinculado</label>
            <select
              value={currentAppId ?? ""}
              onChange={(e) => setCurrentAppId(e.target.value || null)}
              className="mt-1 block w-full rounded border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={disabled}
            >
              {options.map((opt) => (
                <option key={opt.id || "none"} value={opt.id}>
                  {labelFor(opt as AppItem)}
                </option>
              ))}
            </select>

            {!currentAppId && (
              <p className="text-xs text-gray-500 mt-1">Nenhum app vinculado</p>
            )}
            {selectedApp && otherFlowCount(selectedApp) > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Este app já está em outros {otherFlowCount(selectedApp)} fluxo(s), mas o vínculo é permitido.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
