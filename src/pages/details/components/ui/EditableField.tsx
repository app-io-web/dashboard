import { useEffect, useMemo, useState } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";

type EditableFieldProps = {
  label: string;
  value?: string;
  type?: "text" | "url" | "textarea";
  placeholder?: string;
  disabled?: boolean;
  saving?: boolean;
  onSave: (next: string) => Promise<void> | void;
  className?: string;
  renderRightAddon?: (value?: string) => React.ReactNode;
};

export default function EditableField({
  label,
  value,
  type = "text",
  placeholder = "",
  disabled,
  saving,
  onSave,
  className,
  renderRightAddon,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  const InputEl = useMemo(() => {
    const base =
      "w-full rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 px-3 text-sm";
    if (type === "textarea") {
      return (
        <textarea
          className={`${base} py-2 min-h-[96px] resize-y`}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={disabled || saving}
        />
      );
    }
    return (
      <input
        className={`${base} h-10`}
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={disabled || saving}
        type={type === "url" ? "url" : "text"}
      />
    );
  }, [type, draft, disabled, saving, placeholder]);

  async function handleSave() {
    if (draft === (value ?? "")) {
      setEditing(false);
      return;
    }
    await onSave(draft);
    setEditing(false);
  }

  return (
    <li
      className={[
        "group grid grid-cols-[140px,1fr,auto] items-start gap-3",
        "rounded-xl px-3 py-2 hover:bg-slate-50/60",
        className ?? "",
      ].join(" ")}
    >
      {/* Coluna: label */}
      <div className="min-w-36 pt-2 text-slate-500">{label}</div>

      {/* Coluna: conteúdo */}
      <div className="flex min-w-0 flex-col">
        {!editing ? (
          <div className="flex items-center gap-2 min-h-10">
            <span className="truncate text-slate-900">
              {value?.trim() ? value : <span className="text-slate-400">—</span>}
            </span>
            {renderRightAddon?.(value)}
          </div>
        ) : (
          <div>{InputEl}</div>
        )}
      </div>

      {/* Coluna: ações (toolbar fantasma) */}
      <div className="flex items-center gap-2">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 hover:bg-white/80 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={disabled}
            title="Editar"
          >
            <Pencil size={16} />
            Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(false)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
              disabled={saving}
              title="Cancelar"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              disabled={saving}
              title="Salvar"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Salvar
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
