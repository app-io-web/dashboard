// src/pages/create/components/ActionsBar.tsx
import { ReactNode } from "react";

export function ActionsBar({
  busy,
  onClear,
  submitLabel,
  icon,
}: {
  busy?: boolean;
  onClear: () => void;
  submitLabel: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClear}
        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-slate-700 shadow-sm hover:shadow-md transition"
        disabled={busy}
      >
        Limpar
      </button>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-500 hover:shadow-md transition disabled:opacity-60"
      >
        {icon}
        {busy ? "Criando..." : submitLabel}
      </button>
    </div>
  );
}
