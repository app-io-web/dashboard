import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  appName?: string | null;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteAppModal({ open, appName, loading, onConfirm, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [confirmText, setConfirmText] = useState("");

  // reset input ao abrir
  useEffect(() => {
    if (open) setConfirmText("");
  }, [open]);

  // fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const mustType = (appName ?? "").trim();
  const canDelete = confirmText.trim() === mustType && !loading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="delete-title"
    >
      {/* overlay */}
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />
      {/* card */}
      <div
        ref={ref}
        className="relative w-[min(560px,92vw)] rounded-2xl bg-white shadow-2xl border border-slate-200 p-6"
      >
        <h2 id="delete-title" className="text-lg font-semibold text-slate-900">
          Excluir aplicativo
        </h2>

        <p className="mt-2 text-sm text-slate-700">
          Tem certeza que deseja <span className="font-semibold text-red-600">excluir</span>{" "}
          {appName ? <>“{appName}”</> : "este aplicativo"}?
        </p>

        {/* confirmação */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-600">
            Para confirmar, digite exatamente o nome do app:
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700 border border-slate-200">
              {mustType || "—"}
            </code>
          </div>
          <input
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Digite o nome do app aqui…"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            O botão “Excluir” só será liberado quando o nome coincidir.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={!canDelete}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block animate-pulse">Excluindo…</span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Excluir
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
