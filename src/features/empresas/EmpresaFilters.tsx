import { SlidersHorizontal, Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type SortKey = "nome_asc" | "nome_desc" | "recente" | "antigas";

export default function EmpresaFilters({
  q, setQ, sort, setSort,
}: {
  q: string;
  setQ: Dispatch<SetStateAction<string>>;
  sort: SortKey;
  setSort: Dispatch<SetStateAction<SortKey>>;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome..."
          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white border border-slate-200">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-transparent text-slate-800 text-sm focus:outline-none"
          >
            <option value="recente">Mais recentes</option>
            <option value="antigas">Mais antigas</option>
            <option value="nome_asc">Nome (A–Z)</option>
            <option value="nome_desc">Nome (Z–A)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
