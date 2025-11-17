// src/pages/details/components/advanced/AppEndpointSection.tsx
import { useState, type FormEvent } from "react";
import { Link2 } from "lucide-react";
import { api } from "@/lib/http";
import Card from "../Card";
import type { AppDetails } from "../../types";

type Props = {
  app: AppDetails;
};

/* ---------- helpers pra lidar com serverExtraInfo (string JSON) ---------- */

type HealthPrefs = {
  enabled: boolean;
  intervalMinutes: number;
};

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
  if (typeof raw === "object") {
    return raw as any;
  }
  return {};
}

function getInitialHealthPrefs(app: any): HealthPrefs {
  const extra = parseServerExtra(app.serverExtraInfo);
  const hp = (extra?.healthPrefs ?? {}) as Partial<HealthPrefs>;
  return {
    enabled: hp.enabled ?? false,
    intervalMinutes: hp.intervalMinutes ?? 30,
  };
}

/* ----------------- componente ----------------- */

export function AppEndpointSection({ app }: Props) {
  const appKey = (app as any).ref ?? app.id;

  // endpoints normais
  const [baseUrl, setBaseUrl] = useState((app as any).appBaseUrl ?? "");
  const [apiUrl, setApiUrl] = useState((app as any).apiBaseUrl ?? "");
  const [webhookUrl, setWebhookUrl] = useState((app as any).webhookUrl ?? "");

  // prefs de health vindas do serverExtraInfo (string JSON)
  const initialHealth = getInitialHealthPrefs(app as any);
  const [healthEnabled, setHealthEnabled] = useState<boolean>(
    initialHealth.enabled,
  );
  const [healthInterval, setHealthInterval] = useState<number>(
    initialHealth.intervalMinutes,
  );

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!appKey) return;

    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      // pega o que já existe em serverExtraInfo e mergeia
      const prevExtra = parseServerExtra((app as any).serverExtraInfo);
      const nextExtra = {
        ...prevExtra,
        healthPrefs: {
          enabled: healthEnabled,
          intervalMinutes: healthInterval,
        },
      };

      await api.patch(`/apps/${appKey}`, {
        appBaseUrl: baseUrl || null,
        apiBaseUrl: apiUrl || null,
        webhookUrl: webhookUrl || null,

        // manda como STRING
        serverExtraInfo: JSON.stringify(nextExtra),
      });

      // feedback suave, sem alert do navegador
      setSaveMessage("Configurações salvas com sucesso.");
    } catch (err) {
      console.error("Erro ao salvar endpoints/health prefs do app", err);
      setSaveError("Erro ao salvar configurações do app.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title="Endpoint do Aplicativo"
      icon={<Link2 className="text-slate-500" size={18} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Configure endpoints avançados do app (base pública, API interna,
          webhooks, etc.) e as preferências de monitoramento de status.
        </p>

        {/* URLs */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700">
            URL pública do app
          </label>
          <input
            type="url"
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none ring-0 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            placeholder="ex: https://meuapp.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700">
            URL base da API
          </label>
          <input
            type="url"
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none ring-0 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            placeholder="ex: https://api.meuapp.com/v1"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700">
            URL de webhook padrão
          </label>
          <input
            type="url"
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none ring-0 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            placeholder="ex: https://meuapp.com/webhooks/eventos"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
        </div>

        {/* MONITORAMENTO / HEALTH PREFS (guardado como JSON string) */}
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 space-y-3">
          <div className="flex items-start gap-2">
            <input
              id="health-enabled"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
              checked={healthEnabled}
              onChange={(e) => setHealthEnabled(e.target.checked)}
            />
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="health-enabled"
                className="text-xs font-medium text-slate-800"
              >
                Verificar status da aplicação automaticamente
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700">
              Intervalo entre verificações
            </label>
            <select
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none ring-0 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100 disabled:text-slate-400"
              value={healthInterval}
              onChange={(e) => setHealthInterval(Number(e.target.value))}
              disabled={!healthEnabled}
            >
              <option value={10}>a cada 10 minutos</option>
              <option value={15}>a cada 15 minutos</option>
              <option value={30}>a cada 30 minutos</option>
              <option value={60}>a cada 60 minutos</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-2">
          {/* Mensagens de status */}
          {saveMessage && (
            <span className="text-xs text-emerald-600">{saveMessage}</span>
          )}
          {saveError && (
            <span className="text-xs text-red-600">{saveError}</span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar configurações do app"}
          </button>
        </div>
      </form>
    </Card>
  );
}
