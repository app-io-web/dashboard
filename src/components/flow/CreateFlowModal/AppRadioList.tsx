// src/components/flow/CreateFlowModal/AppRadioList.tsx
import { FALLBACK_SQUARE } from "@/constants/images";

type AppItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  imageSquareUrl?: string | null;
};

type Props = {
  apps: AppItem[];
  selectedAppId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

export default function AppRadioList({ apps, selectedAppId, onSelect, disabled }: Props) {
  if (apps.length === 0) {
    return (
      <div className="p-4 rounded-xl border text-gray-600 text-center">
        Nenhum app encontrado nesta empresa.
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-auto grid gap-3">
      {apps.map((app) => (
        <label
          key={app.id}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:border-blue-400 transition ${
            selectedAppId === app.id
              ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
              : "border-gray-200"
          }`}
        >
          <input
            type="radio"
            name="app"
            value={app.id}
            checked={selectedAppId === app.id}
            onChange={() => onSelect(app.id)}
            className="mt-0.5"
            disabled={disabled}
          />
          {app.imageSquareUrl ? (
            <img
              src={app.imageSquareUrl}
              alt={app.nome}
              className="w-10 h-10 rounded-md object-cover"
            />
          ) : (
            <img
              src={FALLBACK_SQUARE}
              alt=""
              className="w-10 h-10 rounded-md object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900">{app.nome}</div>
            {app.descricao && (
              <div className="text-xs text-gray-500 line-clamp-1">{app.descricao}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}