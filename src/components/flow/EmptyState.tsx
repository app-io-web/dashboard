// src/components/flow/EmptyState.tsx
import { FALLBACK_SQUARE } from "@/constants/images"; // ajuste se não tiver esse arquivo

type Props = {
  onCreate: () => void;
};

export default function EmptyState({ onCreate }: Props) {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
      <img
        src={FALLBACK_SQUARE}
        alt="Nenhum fluxo"
        className="w-14 h-14 mx-auto mb-4 rounded"
      />
      <p className="text-gray-600 mb-6">Nenhum fluxo criado nesta empresa.</p>
      <button
        onClick={onCreate}
        className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Criar meu primeiro fluxo
      </button>
    </div>
  );
}