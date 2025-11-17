// src/pages/details/components/advanced/HealthMonitorSection.tsx
import { useState, type FormEvent } from "react";
import { Activity } from "lucide-react";
import { api } from "@/lib/http";
import Card from "../Card";
import type { AppDetails } from "../../types";

type Props = {
  app: AppDetails;
};

export function HealthMonitorSection({ app }: Props) {
  const appKey = (app as any).ref ?? app.id;

  const [healthEndpointUrl, setHealthEndpointUrl] = useState(
    app.healthEndpointUrl ?? ""
  );

  // estado local pro monitoramento
  const [lastStatus, setLastStatus] = useState<string>(
    app.lastHealthStatus ?? "—"
  );
  const [lastMs, setLastMs] = useState<number | null>(
    app.lastHealthMs ?? null
  );
  const [lastAt, setLastAt] = useState<string>(
    app.lastHealthAt
      ? new Date(app.lastHealthAt).toLocaleString()
      : "—"
  );

  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  async function runPing(currentUrl: string) {
    if (!appKey) return;

    setChecking(true);
    try {
      const { data } = await api.post(`/apps/${appKey}/ping`, {
        // se quiser usar a URL recém digitada, manda override
        overrideUrl: currentUrl || undefined,
      });

      const nowStr = new Date().toLocaleString();
      const ms = typeof data.ms === "number" ? data.ms : null;
      const statusText: string =
        typeof data.statusText === "string"
          ? data.statusText
          : data.ok === false
          ? "DOWN"
          : "OK";

      setLastStatus(statusText);
      setLastMs(ms);
      setLastAt(nowStr);
    } catch (err) {
      console.error("Erro ao pingar health endpoint", err);
      // fallback: marca como DOWN
      setLastStatus("DOWN");
      setLastAt(new Date().toLocaleString());
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!appKey) return;

    setSaving(true);
    try {
      // 1) salva a URL no app
      await api.patch(`/apps/${appKey}`, {
        healthEndpointUrl: healthEndpointUrl || null,
      });

      // 2) já dispara o ping usando a URL recém salva
      await runPing(healthEndpointUrl);
    } catch (err) {
      console.error("Erro ao salvar health endpoint", err);
      window.alert("Erro ao salvar/testar health endpoint");
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || checking;

  return (
    <Card
      title="Health / Monitoramento"
      icon={<Activity className="text-emerald-500" size={18} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Configure o endpoint de saúde para monitorar status e tempo de resposta
          do app.
        </p>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700">
            URL do endpoint de health
          </label>
          <input
            type="url"
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            placeholder="ex: https://api.meuapp.com/health"
            value={healthEndpointUrl}
            onChange={(e) => setHealthEndpointUrl(e.target.value)}
          />
        </div>

        {/* Info de leitura vinda do backend + últimos pings */}
        <div className="grid gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700 md:grid-cols-3">
          <div>
            <span className="font-semibold">Último status:</span>{" "}
            <span>{lastStatus}</span>
          </div>
          <div>
            <span className="font-semibold">Último tempo:</span>{" "}
            <span>{lastMs != null ? `${lastMs} ms` : "—"}</span>
          </div>
          <div>
            <span className="font-semibold">Última checagem:</span>{" "}
            <span>{lastAt}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={busy || !healthEndpointUrl}
            onClick={() => runPing(healthEndpointUrl)}
            className="inline-flex items-center rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checking ? "Testando..." : "Testar agora"}
          </button>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Salvando & testando..." : "Salvar health endpoint"}
          </button>
        </div>
      </form>
    </Card>
  );
}
