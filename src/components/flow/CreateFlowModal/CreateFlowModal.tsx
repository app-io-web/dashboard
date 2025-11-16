// src/components/flow/CreateFlowModal/CreateFlowModal.tsx
import AppRadioList from "./AppRadioList";
import { useCreateFlowModal } from "./useCreateFlowModal";

type Props = {
  open: boolean;
  empresa: { id: string; nome: string };
  onClose: () => void;
};

export default function CreateFlowModal({ open, empresa, onClose }: Props) {
  // ✅ passa (empresa.id, open, onClose)
  const {
    apps,
    selectedAppId,
    setSelectedAppId,
    newTitle,
    setNewTitle,
    loading,
    appsLoading,
    error,
    // loadApps, // não precisa mais aqui
    createFlow,
  } = useCreateFlowModal(empresa.id, open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
      />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-screen overflow-y-auto">
        <h3 className="text-2xl font-bold mb-2">Criar fluxo para {empresa.nome}</h3>
        <p className="text-gray-600 mb-4">
          Escolha o App ao qual este fluxo ficará vinculado.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título do fluxo
        </label>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full mb-4 rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Ex.: Onboarding de clientes"
          disabled={loading}
        />

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Selecionar App
            </label>
            {appsLoading && (
              <span className="text-xs text-gray-500">Carregando apps…</span>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm mb-2">
              {error}
            </div>
          )}

          <AppRadioList
            apps={apps}
            selectedAppId={selectedAppId}
            onSelect={setSelectedAppId}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={() => createFlow(false)}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50 transition"
            disabled={loading}
            title="Você poderá escolher o app depois dentro do editor"
          >
            Definir depois
          </button>
          <button
            onClick={() => createFlow(true)}
            className={`px-5 py-2 rounded-xl text-white font-medium transition ${
              selectedAppId
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
            disabled={!selectedAppId || loading}
          >
            {loading ? "Criando..." : "Criar vinculado"}
          </button>
        </div>
      </div>
    </div>
  );
}
