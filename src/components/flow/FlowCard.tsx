// src/components/flow/FlowCard.tsx
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import fallbackWide from "@/assets/LOGO_ANIMADA_1920x1080.gif";

type FlowStatus = "draft" | "active" | "archived";

type Flow = {
  id: string;
  titulo: string;
  descricao?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

type AppItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  imageSquareUrl?: string | null;
  imageWideUrl?: string | null;
  flowId?: string | null;   // compat: primeiro flow
  flowIds?: string[];       // TODOS os flows vinculados a esse app
};

type Props = {
  flow: Flow;
  app: AppItem | null;
  loadingApp: boolean;
  empresaId: string;
};

const STATUS_DEFAULT: FlowStatus = "draft";
const statusMap: Record<FlowStatus, { label: string; className: string }> = {
  active: { label: "Ativo",   className: "bg-emerald-100 text-emerald-800" },
  draft:  { label: "Rascunho", className: "bg-amber-100 text-amber-800" },
  archived: { label: "Arquivado", className: "bg-gray-100 text-gray-700" },
};

function normalizeStatus(s: unknown): FlowStatus {
  const raw = (typeof s === "string" ? s : "").trim().toLowerCase();
  if (raw === "ativo") return "active";
  if (raw === "rascunho") return "draft";
  if (raw === "arquivado") return "archived";
  if (raw === "active" || raw === "draft" || raw === "archived") return raw as FlowStatus;
  return STATUS_DEFAULT;
}

const isNonEmpty = (v?: string | null) => !!(v && v.trim().length > 0);
const normalizeUrl = (u?: string | null) => {
  if (!isNonEmpty(u)) return undefined;
  const s = u!.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return s.startsWith("/") ? `${location.origin}${s}` : `${location.origin}/${s}`;
};

// Helpers de multi-fluxo por app
const flowsForApp = (app?: AppItem | null): string[] => {
  if (!app) return [];
  if (Array.isArray(app.flowIds) && app.flowIds.length > 0) return app.flowIds;
  return app.flowId ? [app.flowId] : [];
};

export default function FlowCard({ flow, app, loadingApp, empresaId }: Props) {
  const navigate = useNavigate();

  const candidates = useMemo(
    () =>
      [
        normalizeUrl(app?.imageWideUrl),
        normalizeUrl(app?.imageSquareUrl),
        fallbackWide,
      ].filter(Boolean) as string[],
    [app?.imageWideUrl, app?.imageSquareUrl]
  );

  const [src, setSrc] = useState<string>(candidates[0] ?? fallbackWide);
  useEffect(() => setSrc(candidates[0] ?? fallbackWide), [candidates]);

  const handleImgError = () => {
    const idx = candidates.findIndex((c) => c === src);
    const next = candidates[idx + 1] ?? fallbackWide;
    if (next !== src) setSrc(next);
  };

  const baseAppName =
    loadingApp ? "Carregando…" : app?.nome?.trim() ? app.nome : "Sem app vinculado";

  const appFlows = flowsForApp(app);
  const totalFlows = appFlows.length;
  const thisFlowIncluded =
    !!flow.id && (appFlows.includes(flow.id) || app?.flowId === flow.id);

  // texto do “badge” que mostra o app + info de multi-fluxo
  let appBadgeText = baseAppName;
  if (!loadingApp && app && totalFlows > 1) {
    if (thisFlowIncluded) {
      appBadgeText = `${baseAppName} • compartilhado com +${totalFlows - 1} fluxo(s)`;
    } else {
      appBadgeText = `${baseAppName} • usado em ${totalFlows} fluxo(s)`;
    }
  }

  const statusKey = normalizeStatus(flow.status);
  const status = statusMap[statusKey];

  const goToEditor = () =>
    navigate(`/flow/${flow.id}?empresaId=${empresaId}`, {
      state: { flow, empresaId },
    });

  // IMPORTANTE: passa o app no state (continua igual)
  const goToSettings = () => {
    navigate(`/flow/${flow.id}/settings?empresaId=${empresaId}`, {
      state: {
        flowId: flow.id,
        empresaId,
        appId: app?.id ?? null,
        appName: app?.nome ?? null,
        app: app ?? null,
      },
    });
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-md transition overflow-hidden">
      <button
        className="block w-full h-36 bg-gray-100"
        onClick={goToEditor}
        title="Abrir no editor"
      >
        <img
          src={src}
          onError={handleImgError}
          alt={baseAppName}
          loading="lazy"
          className="w-full h-36 object-cover"
        />
      </button>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-base font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-700"
            onClick={goToEditor}
            title={flow.titulo}
          >
            {flow.titulo}
          </h3>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
              app
                ? "bg-emerald-50 border-emerald-200 text-green-700"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                app ? "bg-emerald-500" : "bg-gray-400"
              }`}
            />
            {appBadgeText}
          </span>
        </div>

        {flow.descricao && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {flow.descricao}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            {flow.createdAt
              ? new Date(flow.createdAt).toLocaleDateString("pt-BR")
              : "—"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={goToEditor}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Abrir
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={goToSettings}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
