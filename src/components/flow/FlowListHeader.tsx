import { Plus } from "lucide-react";

type Props = {
  empresa: { nome: string };
  onCreate: () => void;
};

export default function FlowListHeader({ empresa, onCreate }: Props) {
  return (
    <div className="mt-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight break-words">
          Fluxos • {empresa.nome}
        </h1>
        <p className="text-sm text-gray-500">
          Crie e gerencie automações visuais desta empresa.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:scale-[0.99] transition"
      >
        <Plus size={18} />
        Novo Fluxo
      </button>
    </div>
  );
}
