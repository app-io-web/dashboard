// src/pages/details/components/ui/CopyButton.tsx
import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = {
  text: string;
  label?: string;
  className?: string;
  timeoutMs?: number;
};

export default function CopyButton({
  text,
  label = "Copiar",
  className = "",
  timeoutMs = 1500,
}: Props) {
  const [ok, setOk] = useState(false);

  async function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text ?? "");
      } else {
        const ta = document.createElement("textarea");
        ta.value = text ?? "";
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      // Em vez de trocar nós, só alternamos classes
      setOk(true);
      window.setTimeout(() => setOk(false), timeoutMs);
    } catch (err) {
      console.error("[copy] fail:", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 h-9 text-sm hover:bg-slate-50 transition ${className}`}
      aria-live="polite"
      aria-label={ok ? "Copiado" : label}
      title={ok ? "Copiado" : label}
    >
      {/* Ícones fixos, alterna visibilidade */}
      <span className="relative w-4 h-4 inline-flex items-center justify-center">
        <Copy size={16} className={ok ? "hidden" : "block"} aria-hidden />
        <Check size={16} className={ok ? "block" : "hidden"} aria-hidden />
      </span>

      {/* Textos fixos, alterna visibilidade */}
      <span className={ok ? "hidden" : "block"}>{label}</span>
      <span className={ok ? "block" : "hidden"}>Copiado</span>
    </button>
  );
}
