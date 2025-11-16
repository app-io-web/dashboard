// src/pages/details/components/ui/Modal.tsx
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/* -------------------------------------------------
   PortalRoot – container estável para todos os modais
   ------------------------------------------------- */
let portalRoot: HTMLElement | null = null;

function getPortalRoot(): HTMLElement {
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.id = "modal-portal";
    document.body.appendChild(portalRoot);
  }
  return portalRoot;
}

/* ------------------------------------------------- */
type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string; // "max-w-lg" | "max-w-2xl"...
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidthClass = "max-w-lg",
}: ModalProps) {
  const lastFocusRef = useRef<HTMLElement | null>(null);

  /* ---------- ESC ---------- */
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  /* ---------- Foco + scroll lock ---------- */
  useEffect(() => {
    if (!open) return;

    lastFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = prev;
      lastFocusRef.current?.focus?.();
    };
  }, [open]);

  /* ---------- Limpeza do portal ao desmontar ---------- */
  useEffect(() => {
    return () => {
      // Remove o container somente se ele ficar vazio
      const root = portalRoot;
      if (root && root.children.length === 0) {
        root.remove();
        portalRoot = null;
      }
    };
  }, []); // roda uma única vez (componente global)

  if (!open) return null;

  const modal = (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[999] flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidthClass} mx-4 rounded-2xl bg-white shadow-xl`}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 active:scale-95"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <footer className="px-5 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );

  // Portaliza para o container estável
  return createPortal(modal, getPortalRoot());
}