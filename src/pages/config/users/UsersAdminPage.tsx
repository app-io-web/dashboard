// src/pages/config/users/UsersAdminPage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, UserPlus, PanelLeft, LogOut } from "lucide-react";
import { api } from "@/lib/http";
import { getUser, clearAuth } from "@/lib/auth"; // pega user direto do storage + logout
import SideMenu from "@/components/SideMenu";
import { UsersListSection } from "./UsersListSection";

type Role = "OWNER" | "ADMIN" | "MEMBER";

export default function UsersAdminPage() {
  const navigate = useNavigate();

  // user logado, vindo do localStorage/sessionStorage
  const user = getUser();
  const isSuperUser = !!user?.isSuperUser;

  // --- SideMenu controlado (igual EmpresasPage) ---
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }
  // -------------------------------------------------

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [newIsSuperUser, setNewIsSuperUser] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isSuperUser) {
    return (
      <>
        {/* Drawer do menu lateral */}
        <SideMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={(to) => navigate(to)}
          onLogout={handleLogout}
        />

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Header com botão de menu + logout */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm hover:bg-slate-50"
              title="Abrir menu"
            >
              <span className="sr-only">Abrir menu</span>
              <PanelLeft className="w-5 h-5 text-slate-700" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>

          <div className="max-w-xl mx-auto rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 border border-red-200">
                <ShieldCheck className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-red-900">
                  Acesso negado
                </h1>
                <p className="mt-1 text-sm text-red-800">
                  Apenas Super Admins podem acessar esta área de gestão de usuários.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/config")}
                  className="mt-3 inline-flex items-center text-sm font-medium text-red-800 hover:text-red-900"
                >
                  ← Voltar para Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Email e senha são obrigatórios.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name: name || null,
        email,
        password,
        role,
        isSuperUser: newIsSuperUser,
      });

      setSuccessMsg("Usuário criado com sucesso!");
      setName("");
      setEmail("");
      setPassword("");
      setRole("MEMBER");
      setNewIsSuperUser(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao criar usuário. Confira os dados e tente novamente.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Drawer do menu lateral */}
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(to) => navigate(to)}
        onLogout={handleLogout}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Header com botão de menu + logout (padrão das páginas) */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm hover:bg-slate-50"
            title="Abrir menu"
          >
            <span className="sr-only">Abrir menu</span>
            <PanelLeft className="w-5 h-5 text-slate-700" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition"
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Gestão de Usuários
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Área exclusiva de Super Admin para criar novos usuários do painel.
              </p>
              <span className="mt-2 inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                Super Admin • Controle global de acesso
              </span>
            </div>
          </div>

          {/* Card do formulário */}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Criar novo usuário
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Defina as credenciais iniciais e o papel global do usuário.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Opcional"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Defina a senha inicial"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Papel global
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="OWNER">OWNER (dono global)</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Esses papéis seguem o enum <code>Role</code> do banco
                    (OWNER, ADMIN, MEMBER).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="superuser"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={newIsSuperUser}
                  onChange={(e) => setNewIsSuperUser(e.target.checked)}
                />
                <label htmlFor="superuser" className="text-sm text-slate-700">
                  Esse usuário também é Super Admin
                </label>
              </div>

              {errorMsg && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {successMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                <button
                  type="button"
                  className="text-sm font-medium text-slate-600 hover:text-slate-800"
                  onClick={() => navigate("/config")}
                >
                  ← Voltar para Configurações
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? "Criando..." : "Criar usuário"}
                </button>
              </div>
            </form>
          </div>

          {/* Lista de usuários */}
          <UsersListSection />
        </div>
      </div>
    </>
  );
}
