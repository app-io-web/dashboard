import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  X, LayoutGrid, Building2, Settings, HelpCircle, LogOut, Workflow 
} from "lucide-react";

type Item = {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const ITEMS: Item[] = [
  { label: "Apps",          to: "/",         icon: LayoutGrid },
  { label: "Empresas",      to: "/empresas", icon: Building2 },
  { label: "Fluxos",        to: "/flows",    icon: Workflow },   // 👈 novo
  { label: "Configurações", to: "/config",   icon: Settings },
  { label: "Ajuda",         to: "/ajuda",    icon: HelpCircle },
];

export type SideMenuProps = {
  open: boolean;
  /** API controlada (preferível) */
  onOpenChange?: (v: boolean) => void;
  /** API legada */
  onClose?: () => void;
  onNavigate?: (to: string) => void;
  onLogout?: () => void;
};

export default function SideMenu({
  open,
  onOpenChange,
  onClose,
  onNavigate,
  onLogout,
}: SideMenuProps) {
  const loc = useLocation();
  const active = useMemo(() => loc.pathname || "/", [loc.pathname]);

  // fallbacks seguros
  const safeClose = () => {
    if (onClose) onClose();
    else if (onOpenChange) onOpenChange(false);
    // se nenhum veio, vira no-op
  };
  const safeNavigate = (to: string) => {
    if (onNavigate) onNavigate(to);
    safeClose();
  };
  const safeLogout = () => {
    if (onLogout) onLogout();
  };

  // Fecha com ESC e trava scroll do body quando aberto
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") safeClose();
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]); // safeClose é estável o suficiente pro nosso caso

  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={safeClose}
        aria-hidden={!open}
      />

      {/* Drawer */}
      <aside
        className={[
          "fixed left-0 top-0 z-50 h-full w-72",
          "bg-white border-r border-gray-200 shadow-2xl",
          "transition-transform duration-300 will-change-transform",
          open ? "translate-x-0" : "-translate-x-full",
          "rounded-r-2xl overflow-hidden",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Menu lateral"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="font-semibold tracking-tight">Painel</div>
          <button
            className="rounded-lg border border-gray-200 px-2 py-1 hover:bg-gray-50"
            onClick={safeClose}
            title="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="px-2 py-3 space-y-1">
          {ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = active === to || (to !== "/" && active.startsWith(to));
            return (
              <button
                key={to}
                onClick={() => safeNavigate(to)}
                className={[
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
              >
                <Icon size={18} className={isActive ? "opacity-90" : "opacity-70"} />
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="my-2 border-t border-gray-200" />

        <div className="px-2 py-2">
          <button
            onClick={safeLogout}
            className="w-full inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-left border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition"
            title="Sair da conta"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair</span>
          </button>
        </div>

        <div className="absolute bottom-0 inset-x-0 px-4 py-3 text-xs text-gray-400">
          © {new Date().getFullYear()} — dashboard
        </div>
      </aside>
    </>
  );
}
