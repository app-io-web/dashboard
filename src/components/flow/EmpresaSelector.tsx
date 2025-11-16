// src/components/flow/EmpresaSelector.tsx
import { Link } from "react-router-dom";
import { useFlows } from "../../pages/flow/hooks/useFlows";
import { FALLBACK_SQUARE } from "@/constants/images";

type Props = {
  empresas: Empresa[];
  onSelect: (e: Empresa) => void;
};

export default function EmpresaSelector({ empresas, onSelect }: Props) {
  if (empresas.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow">
        <img src={FALLBACK_SQUARE} alt="" className="w-16 h-16 mx-auto mb-4 rounded" />
        <p className="text-gray-600 mb-6">Você ainda não faz parte de nenhuma empresa.</p>
        <Link
          to="/empresas/nova"
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          + Criar minha primeira empresa
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {empresas.map((empresa) => (
        <button
          key={empresa.id}
          onClick={() => onSelect(empresa)}
          className="bg-white rounded-2xl border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-md transition p-6 text-left"
        >
          <div className="flex items-center gap-4">
            {empresa.imagemUrl ? (
              <img src={empresa.imagemUrl} alt={empresa.nome} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white font-bold">
                {empresa.nome[0]?.toUpperCase() ?? "E"}
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-900">{empresa.nome}</div>
              <div className="text-xs text-gray-500">Clique para ver fluxos</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}