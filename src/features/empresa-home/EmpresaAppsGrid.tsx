// src/features/empresa-home/EmpresaAppsGrid.tsx
import { Plus, RefreshCw } from "lucide-react";
import EmpresaAppCard from "./EmpresaAppCard";

type Empresa = {
  id: string;
  nome: string;
};

type AppItem = {
  id: string;
  nome: string;
  status?: string | null;
  descricao?: string | null;
  iconUrl?: string | null;
};

type Props = {
  empresa: Empresa;
  apps: AppItem[];
  onNewApp: () => void;
};

export default function EmpresaAppsGrid({ empresa, apps, onNewApp }: Props) {
  const hasApps = apps && apps.length > 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-100">
            Apps da empresa
          </h3>
          <p className="text-xs text-slate-400 md:text-sm">
            Gerencie os aplicativos vinculados a{" "}
            <span className="font-medium text-slate-200">{empresa.nome}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>

          <button
            type="button"
            onClick={onNewApp}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400"
          >
            <Plus size={14} />
            Novo app
          </button>
        </div>
      </div>

      {hasApps ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {apps.map((app) => (
            <li key={app.id}>
              <EmpresaAppCard app={app} empresaId={empresa.id} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/70 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-200">
            Nenhum app cadastrado ainda.
          </p>
          <p className="max-w-md text-xs text-slate-400">
            Comece criando um novo app para acompanhar status, URLs importantes,
            servidor e integrações dessa empresa.
          </p>
          <button
            type="button"
            onClick={onNewApp}
            className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-medium text-emerald-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400"
          >
            <Plus size={14} />
            Criar primeiro app
          </button>
        </div>
      )}
    </section>
  );
}
