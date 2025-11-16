// src/pages/details/components/ui/EditModal.tsx
import { useEffect, useState, ReactNode } from "react";
import { Check, Loader2, X } from "lucide-react";
import Modal from "./Modal";

type EditModalProps = {
  open: boolean;
  title: string;
  type?: "text" | "url" | "textarea";
  initialValue?: string;
  placeholder?: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (value?: string) => Promise<void> | void;
  children?: ReactNode;
  autoCloseOnSave?: boolean;
  maxWidthClass?: string;
};

export default function EditModal({
  open,
  title,
  type = "text",
  initialValue = "",
  placeholder,
  saving,
  onClose,
  onSave,
  children,
  autoCloseOnSave = true,
  maxWidthClass = "max-w-xl",
}: EditModalProps) {
  const [value, setValue] = useState(initialValue);
  const hasCustomContent = !!children;

  /* -------------------------------------------------
     Sincroniza o valor interno apenas quando o modal abre
     ou quando o initialValue muda enquanto está aberto
     ------------------------------------------------- */
  useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  /* -------------------------------------------------
     Input padrão (text/url/textarea)
     ------------------------------------------------- */
  const Input =
    type === "textarea" ? (
      <textarea
        className="w-full min-h-[140px] resize-y rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    ) : (
      <input
        type={type}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );

  /* -------------------------------------------------
     Salvar – fecha apenas se não estiver salvando
     ------------------------------------------------- */
  async function handleSave() {
    await onSave(hasCustomContent ? undefined : value);
    if (autoCloseOnSave && !saving) onClose();
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        if (!saving) onClose();
      }}
      maxWidthClass={maxWidthClass}
      footer={
        <div className="flex items-center justify-end gap-3">
          {/* Cancelar */}
          <button
            type="button"
            disabled={!!saving}
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={16} />
            Cancelar
          </button>

          {/* Salvar – ícone dentro de wrapper fixo */}
          <button
            type="button"
            disabled={!!saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <span className="relative w-4 h-4">
              {saving ? (
                <Loader2 className="absolute inset-0 animate-spin" size={16} />
              ) : (
                <Check className="absolute inset-0" size={16} />
              )}
            </span>
            Salvar
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {hasCustomContent ? children : Input}
      </div>
    </Modal>
  );
}