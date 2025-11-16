import { Plus } from "lucide-react";

type Props = {
  empresa: { nome: string };
  onCreate: () => void;
};

export default function FlowListHeader({ empresa, onCreate }: Props) {
  return (
    <div className="mt-4 mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Fluxos • {empresa.nome}
        </h1>
        <p className="text-sm text-gray-500">
          Crie e gerencie automações visuais desta empresa.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:scale-[0.99] transition"
      >
        <Plus size={18} />
        Novo Fluxo
      </button>
    </div>
  );
}
