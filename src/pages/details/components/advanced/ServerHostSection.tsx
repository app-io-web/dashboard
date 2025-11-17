// src/pages/details/components/advanced/ServerHostSection.tsx
import { useState, type FormEvent } from "react";
import { Server } from "lucide-react";
import { api } from "@/lib/http";
import Card from "../Card";
import type { AppDetails } from "../../types";

type Props = {
  app: AppDetails;
};

/* ---------- helpers pra lidar com serverExtraInfo (string JSON) ---------- */

type ExtraObj = {
  healthPrefs?: {
    enabled: boolean;
    intervalMinutes: number;
  };
  infraNotes?: string;
  // qualquer outra coisa que você queira pendurar depois
  [key: string]: any;
};

function parseServerExtra(raw: unknown): ExtraObj {
  if (!raw) return {};
  if (typeof raw === "string") {
    // tenta tratar como JSON. Se não for JSON, assume que é só texto antigo
    try {
      return JSON.parse(raw) as ExtraObj;
    } catch {
      return { infraNotes: raw };
    }
  }
  if (typeof raw === "object") {
    return raw as ExtraObj;
  }
  return {};
}

export function ServerHostSection({ app }: Props) {
  const appKey = (app as any).ref ?? app.id;

  const [serverHost, setServerHost] = useState(app.serverHost ?? "");
  const [serverLocation, setServerLocation] = useState(
    app.serverLocation ?? "",
  );

  const initialExtra = parseServerExtra(app.serverExtraInfo as any);
  const [infraNotes, setInfraNotes] = useState(initialExtra.infraNotes ?? "");
  const hasHealthPrefs = !!initialExtra.healthPrefs;

  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!appKey) return;

    setSaving(true);
    try {
      // pega o que já existe em serverExtraInfo
      const prevExtra = parseServerExtra((app as any).serverExtraInfo);

      const nextExtra: ExtraObj = {
        ...prevExtra,
        infraNotes: infraNotes || undefined, // se vazio, some do JSON
      };

      if (!nextExtra.infraNotes) {
        delete nextExtra.infraNotes;
      }

      // se sobrar só healthPrefs (ou nada), ainda assim manda como JSON ou null
      const hasAnyKey = Object.keys(nextExtra).length > 0;

      await api.patch(`/apps/${appKey}`, {
        serverHost: serverHost || null,
        serverLocation: serverLocation || null,
        serverExtraInfo: hasAnyKey ? JSON.stringify(nextExtra) : null,
      });
      // aqui depois você pluga toast bonitinho
    } catch (err) {
      console.error("Erro ao salvar servidor/host", err);
      window.alert("Erro ao salvar servidor/host");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title="Servidor / Host"
      icon={<Server className="text-blue-600" size={18} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Configure host do servidor, localização física e infos adicionais.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700">
              Host / IP do servidor
            </label>
            <input
              type="text"
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="ex: app01.minhaempresa.com"
              value={serverHost}
              onChange={(e) => setServerHost(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-700">
              Localização do servidor
            </label>
            <input
              type="text"
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="ex: São Paulo - Datacenter 1"
              value={serverLocation}
              onChange={(e) => setServerLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700">
            Infos extras do servidor
          </label>

          {/* aqui o usuário só mexe nas notas; healthPrefs fica oculto */}
          <textarea
            className="min-h-[80px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="ex: versão do SO, specs, observações de infra..."
            value={infraNotes}
            onChange={(e) => setInfraNotes(e.target.value)}
          />

          {hasHealthPrefs && (
            <span className="text-[11px] text-slate-500">
              Parte das informações extras (&quot;healthPrefs&quot;) está
              armazenada aqui, mas é gerenciada automaticamente pelas
              configurações de monitoramento abaixo e não pode ser editada
              diretamente.
              {/* se quiser o “morrão”, dá pra trocar por algo tipo:
                 Configurações automáticas: {"{ \"healthPrefs\": \"••••\" }"}
              */}
            </span>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar servidor / host"}
          </button>
        </div>
      </form>
    </Card>
  );
}
