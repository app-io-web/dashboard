// src/pages/details/components/sections/ActivitySection.tsx
import { useState, useMemo } from "react";
import { Activity, Mail, GitBranch, Globe, FileText, Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../Card";
import type { AppDetails, Atividade } from "../../types";
import { formatarQuando } from "@/utils/activity";

function Icone({ tipo }: { tipo: Atividade["tipo"] }) {
  switch (tipo) {
    case "status":
      return <Shuffle className="text-blue-600" size={16} />;
    case "descricao":
      return <FileText className="text-emerald-600" size={16} />;
    case "email":
      return <Mail className="text-violet-600" size={16} />;
    case "repositorio":
      return <GitBranch className="text-orange-600" size={16} />;
    case "dominio":
      return <Globe className="text-cyan-600" size={16} />;
    default:
      return <Activity className="text-slate-600" size={16} />;
  }
}

export default function ActivitySection({ app }: { app: AppDetails }) {
  const lista = app.atividades ?? [];
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  const totalPaginas = Math.ceil(lista.length / porPagina);

  const atividadesVisiveis = useMemo(() => {
    const start = (pagina - 1) * porPagina;
    return lista.slice(start, start + porPagina);
  }, [lista, pagina]);

  return (
    <Card title="Atividades recentes" icon={<Activity className="text-blue-600" size={20} />} className="lg:col-span-3">
      {lista.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Nada por aqui ainda. As mudanças que você fizer serão registradas automaticamente.
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {atividadesVisiveis.map((a, i) => (
              <li key={i} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Icone tipo={a.tipo} />
                  <span className="text-sm text-slate-700">{a.texto}</span>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatarQuando(a.quando)}
                </span>
              </li>
            ))}
          </ul>

          {/* Controles de paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4 text-sm">
              <button
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                <ChevronLeft size={16} /> Anterior
              </button>

              <span className="text-slate-600">
                Página {pagina} de {totalPaginas}
              </span>

              <button
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >
                Próxima <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
