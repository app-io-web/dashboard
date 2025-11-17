// src/pages/details/components/sections/ConfigSection.tsx
import {
  Settings,
  ExternalLink,
  Terminal,
  Pencil,
  Cloud,
  Image as ImageIcon,
  Info,
  Server,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../Card";
import type { AppDetails } from "../../types";
import { useSaveApp } from "../../hooks/useSaveApp";
import EditModal from "../ui/EditModal";
import CommandsModal, { type CmdGroup } from "../commands/CommandsModal";

/* ---------------- helpers ---------------- */

function displayText(s?: string) {
  if (!s) return "";
  return s.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Aceita string | { linha } | { line } → string
function pickLine(x: unknown): string {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") {
    const anyx = x as any;
    return (anyx.linha ?? anyx.line ?? "") as string;
  }
  return "";
}

// Normaliza grupos vindo do backend (linhas podem ser objetos)
function normalizeCmdGroups(input: any): CmdGroup[] {
  if (!Array.isArray(input)) return [];
  return input.map((g: any) => ({
    titulo: g?.titulo ?? "",
    linhas: Array.isArray(g?.linhas) ? g.linhas.map(pickLine).filter(Boolean) : [],
  }));
}

// Desnormaliza para enviar ao backend (string[] -> { linha })
function denormalizeCmdGroups(input: CmdGroup[]) {
  return input.map((g) => ({
    titulo: g.titulo ?? "",
    linhas: (g.linhas ?? []).map((s) => ({ linha: s })),
  }));
}

function normalizeUrl(u: string) {
  const s = u.trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
}

function sanitizeBucket(x: string) {
  return x.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9.-]/g, "");
}

function isEqual(a?: string, b?: string) {
  return (a ?? "").trim() === (b ?? "").trim();
}

function toNullIfEmpty(s: string | undefined | null) {
  const v = (s ?? "").trim();
  return v.length ? v : null;
}

/* -------- helpers de HEALTH / SERVER STATUS -------- */

type HealthUi = {
  title: string;    // texto curto pro tooltip / ação
  tooltip: string;  // texto completo do último resultado
  iconClass: string;
  dotClass: string;
};

// mesmo helper que usamos em outros lugares
function parseServerExtra(raw: unknown): any {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      console.warn("serverExtraInfo inválido, não é JSON. Ignorando.");
      return {};
    }
  }
  if (typeof raw === "object") return raw as any;
  return {};
}

function isAutoHealthEnabled(app: any): boolean {
  const extra = parseServerExtra(app?.serverExtraInfo);
  const hp = (extra as any)?.healthPrefs;
  if (!hp || typeof hp !== "object") return false;
  return Boolean((hp as any).enabled);
}

function formatWhen(whenRaw: any): string {
  if (!whenRaw) return "";
  const d = new Date(whenRaw);
  if (Number.isNaN(d.getTime())) return "";
  // formato curtinho pt-BR
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getHealthInfo(app: any): HealthUi {
  const endpoint = app?.healthEndpointUrl as string | undefined;
  const status = (app?.lastHealthStatus ?? "") as string;
  const ms = app?.lastHealthMs as number | null | undefined;
  const when = app?.lastHealthAt;

  const autoEnabled = isAutoHealthEnabled(app);

  // 🔸 PRIORIDADE: auto health desativado → sempre alerta amarelo,
  // independente de endpoint ou último status.
  if (!autoEnabled) {
    const hasEndpoint = !!endpoint;

    const baseTooltip = hasEndpoint
      ? `A verificação automática do status da aplicação está desativada.\nUm endpoint de health está configurado (${endpoint}), mas só será usado em verificações manuais.`
      : "A verificação automática do status da aplicação está desativada e nenhum endpoint de health está configurado.";

    return {
      title: "Monitor automático desativado",
      tooltip: `${baseTooltip}\nAtive nas configurações avançadas do app.`,
      iconClass: "text-amber-500",
      dotClass: "bg-amber-400 animate-pulse",
    };
  }

  // Sem endpoint configurado
  if (!endpoint) {
    return {
      title: "Monitor de servidor desligado",
      tooltip: "Nenhum endpoint de health configurado para este app.",
      iconClass: "text-slate-400",
      dotClass: "bg-slate-300",
    };
  }

  // Endpoint mas ainda não rodou
  if (!when) {
    return {
      title: "Aguardando primeira verificação",
      tooltip: `Endpoint configurado: ${endpoint}\nAinda não há resultados de health.`,
      iconClass: "text-slate-400",
      dotClass: "bg-slate-300",
    };
  }

  const safeMs = typeof ms === "number" && ms >= 0 ? ms : undefined;
  const whenLabel = formatWhen(when) || "horário indisponível";

  const statusUpper = status?.toString().toUpperCase();
  const isUp = statusUpper === "UP" || statusUpper === "OK";

  // thresholds de latência
  let dotClass = "bg-slate-300";
  let iconClass = "text-slate-500";
  let statusLabel = isUp ? "Online" : "Offline/Erro";

  if (!isUp) {
    dotClass = "bg-red-500";
    iconClass = "text-red-500";
  } else if (safeMs !== undefined) {
    if (safeMs <= 200) {
      dotClass = "bg-emerald-500";
      iconClass = "text-emerald-600";
      statusLabel = "Online (rápido)";
    } else if (safeMs <= 1000) {
      dotClass = "bg-amber-400";
      iconClass = "text-amber-500";
      statusLabel = "Online (lento)";
    } else {
      dotClass = "bg-red-500";
      iconClass = "text-red-500";
      statusLabel = "Online (muito lento)";
    }
  }

  const msLabel = safeMs !== undefined ? `${safeMs} ms` : "latência desconhecida";

  const tooltip = `Último health: ${statusLabel}\n${msLabel}\n${whenLabel}`;

  return {
    title: statusLabel,
    tooltip,
    iconClass,
    dotClass,
  };
}

/* ---------------- component ---------------- */

type Props = { app: AppDetails };

export default function ConfigSection({ app }: Props) {
  const [localApp, setLocalApp] = useState(app);
  const navigate = useNavigate();

  const { save, saving } = useSaveApp((localApp as any).Id ?? (localApp as any).id, {
    onSuccess: (updated) => {
      setLocalApp((prev) => ({ ...prev, ...updated } as AppDetails));
    },
    onError: (err) => {
      console.error(err);
      alert("Falha ao salvar. Veja o console para detalhes.");
    },
  });

  // abrir/fechar modais
  const [openRepo, setOpenRepo] = useState(false);
  const [openSite, setOpenSite] = useState(false);
  const [openDesc, setOpenDesc] = useState(false);
  const [openCmd, setOpenCmd] = useState(false);
  const [openAmb, setOpenAmb] = useState(false);
  const [openBucket, setOpenBucket] = useState(false);

  // comandos normalizados no front
  const normalizedCmds = useMemo(
    () => normalizeCmdGroups((localApp as any)?.comandos),
    [localApp]
  );

  const renderLink = (value?: string) =>
    value ? (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
        title="Abrir link"
      >
        <ExternalLink size={16} />
      </a>
    ) : null;

  const saveIfChanged = useCallback(
    async (patch: Partial<AppDetails>) => {
      // só envia campos que realmente mudaram
      const toSend: Record<string, any> = {};
      for (const [k, v] of Object.entries(patch)) {
        // @ts-expect-error index
        const cur = (localApp as any)[k];
        if (typeof v === "string") {
          if (!isEqual(cur, v)) toSend[k] = v;
        } else if (JSON.stringify(cur) !== JSON.stringify(v)) {
          toSend[k] = v;
        }
      }
      if (Object.keys(toSend).length === 0) return;
      await save(toSend);
    },
    [localApp, save]
  );

  const appKey = (localApp as any).ref ?? (localApp as any).id;
  const healthUi = useMemo(() => getHealthInfo(localApp as any), [localApp]);

  return (
    <>
      <Card
        title="Configurações"
        icon={<Settings className="text-blue-600" size={20} />}
        actions={[
          // indicador de servidor / health
          {
            icon: (
              <div className="relative inline-flex items-center justify-center">
                <Server
                  size={18}
                  className={`transition-colors ${healthUi.iconClass}`}
                />
                <span
                  className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-white ${healthUi.dotClass}`}
                />
              </div>
            ),
            title: healthUi.tooltip,
            onClick: () => navigate(`/apps/${appKey}/advanced-config`),
          },
          // botão info padrão
          {
            icon: <Info size={18} />,
            title: "Configurações avançadas",
            onClick: () => navigate(`/apps/${appKey}/advanced-config`),
          },
        ]}
      >
        <ul className="divide-y divide-slate-100 text-sm">
          <Row
            label="Repositório"
            value={localApp.repositorio}
            addon={renderLink(localApp.repositorio)}
            onEdit={() => setOpenRepo(true)}
            disabled={saving}
          />

          <Row
            label="URL do aplicativo"
            value={localApp.dominio}
            addon={renderLink(localApp.dominio)}
            onEdit={() => setOpenSite(true)}
            disabled={saving}
          />

          {/* SEMPRE mostrar — se vazio, aparece “—” e botão Adicionar */}
          <Row
            label={
              <span className="inline-flex items-center gap-2">
                <Cloud size={16} className="text-slate-400" />
                Ambiente
              </span>
            }
            value={localApp.ambiente}
            onEdit={() => setOpenAmb(true)}
            disabled={saving}
          />

          {/* SEMPRE mostrar — se vazio, aparece “—” e botão Adicionar */}
          <Row
            label={
              <span className="inline-flex items-center gap-2">
                <ImageIcon size={16} className="text-slate-400" />
                Bucket S3
              </span>
            }
            value={localApp.bucketS3}
            onEdit={() => setOpenBucket(true)}
            disabled={saving}
          />

          <Row
            label="Descrição"
            value={displayText(localApp.descricao)}
            multiline
            onEdit={() => setOpenDesc(true)}
            disabled={saving}
          />

          {/* Comandos */}
          <li className="grid [grid-template-columns:160px_minmax(0,1fr)] items-center gap-4 py-3">
            <div className="pt-2 text-slate-500">Comandos</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setOpenCmd(true)}
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 enabled:hover:bg-slate-50 transition disabled:opacity-50"
                  title="Editar comandos"
                >
                  <Terminal size={16} />
                  Editar comandos
                </button>
              </div>
            </div>
          </li>
        </ul>
      </Card>

      {/* Modais — re-monta com o valor atual via `key` */}
      <EditModal
        key={`repo:${localApp.repositorio ?? ""}`}
        open={openRepo}
        onClose={() => setOpenRepo(false)}
        title="Editar repositório"
        type="url"
        initialValue={(localApp.repositorio ?? "").trim()}
        saving={saving}
        placeholder="https://github.com/usuario/repositorio"
        onSave={async (next) => {
          const url = normalizeUrl(next);
          await saveIfChanged({ repositorio: url });
        }}
      />

      <EditModal
        key={`site:${localApp.dominio ?? ""}`}
        open={openSite}
        onClose={() => setOpenSite(false)}
        title="Editar URL do aplicativo"
        type="url"
        initialValue={(localApp.dominio ?? "").trim()}
        saving={saving}
        placeholder="https://app.seudominio.com"
        onSave={async (next) => {
          const url = normalizeUrl(next);
          await saveIfChanged({ dominio: url });
        }}
      />

      <EditModal
        key={`desc:${localApp.descricao ?? ""}`}
        open={openDesc}
        onClose={() => setOpenDesc(false)}
        title="Editar descrição"
        type="textarea"
        initialValue={localApp.descricao ?? ""}
        saving={saving}
        placeholder="Breve descrição do app…"
        onSave={async (next) => {
          const cleaned = displayText(next);
          await saveIfChanged({ descricao: cleaned });
        }}
      />

      <EditModal
        key={`amb:${localApp.ambiente ?? ""}`}
        open={openAmb}
        onClose={() => setOpenAmb(false)}
        title="Editar ambiente"
        type="text"
        initialValue={(localApp.ambiente ?? "").trim()}
        saving={saving}
        placeholder="Ex.: GitHub Pages, VPS, Cloud, On-premise…"
        onSave={async (next) => {
          // permite limpar: envia null
          await saveIfChanged({ ambiente: toNullIfEmpty(next) as any });
        }}
      />

      <EditModal
        key={`bucket:${localApp.bucketS3 ?? ""}`}
        open={openBucket}
        onClose={() => setOpenBucket(false)}
        title="Editar bucket S3"
        type="text"
        initialValue={(localApp.bucketS3 ?? "").trim()}
        saving={saving}
        placeholder="ex.: portal-imagens"
        onSave={async (next) => {
          const cleaned = sanitizeBucket(next);
          await saveIfChanged({ bucketS3: toNullIfEmpty(cleaned) as any });
        }}
      />

      <CommandsModal
        open={openCmd}
        onClose={() => setOpenCmd(false)}
        initial={normalizedCmds}
        saving={saving}
        onSave={async (next) => {
          await saveIfChanged({ comandos: denormalizeCmdGroups(next) as any });
        }}
      />
    </>
  );
}

/* ---------------- Row ---------------- */

function Row({
  label,
  value,
  addon,
  multiline,
  onEdit,
  disabled,
}: {
  label: string | React.ReactNode;
  value?: string | null;
  addon?: React.ReactNode;
  multiline?: boolean;
  onEdit: () => void;
  disabled?: boolean;
}) {
  const shown = (value ?? "").trim();
  const isEmpty = shown.length === 0;

  return (
    <li className="grid [grid-template-columns:160px_minmax(0,1fr)_140px] items-start gap-4 py-3">
      <div className="pt-2 text-slate-500">{label}</div>

      <div className="min-w-0 flex-1 overflow-hidden">
        {multiline ? (
          <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-900 max-h-40 overflow-auto pr-1">
            {isEmpty ? <span className="text-slate-400">—</span> : shown}
          </p>
        ) : (
          <div className="flex items-center gap-2 min-h-10 overflow-hidden">
            <span className={isEmpty ? "text-slate-400" : "text-slate-900"}>
              {isEmpty ? "—" : <span className="truncate">{shown}</span>}
            </span>
            {addon}
          </div>
        )}
      </div>

      <div className="flex justify-end shrink-0">
        <button
          onClick={onEdit}
          disabled={disabled}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 enabled:hover:bg-slate-50 transition disabled:opacity-50"
          title={isEmpty ? "Adicionar" : "Editar"}
        >
          <Pencil size={16} />
          {isEmpty ? "Adicionar" : "Editar"}
        </button>
      </div>
    </li>
  );
}
