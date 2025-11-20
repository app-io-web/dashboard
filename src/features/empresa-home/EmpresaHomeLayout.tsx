// src/features/empresa-home/EmpresaHomeLayout.tsx
import { useState, type ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import SideMenu from "@/components/SideMenu";
import { clearAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

type Props = {
  children: ReactNode;
};

export default function EmpresaHomeLayout({ children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      {/* Sidebar (seu componente global) */}
      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} onLogout={handleLogout} />

      {/* Conteúdo principal */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800/70 bg-slate-900/60 text-slate-200 hover:bg-slate-800 lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <PanelLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-slate-100">
                Portal da Empresa
              </h1>
              <p className="text-xs text-slate-400">
                Acompanhe apps, status e configurações.
              </p>
            </div>
          </div>
        </header>

        {/* Área de conteúdo injetada */}
        {children}
      </div>
    </div>
  );
}
