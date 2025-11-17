// src/pages/config/users/UsersListSection.tsx
import { useEffect, useState } from "react";
import { ShieldCheck, Crown, Loader2 } from "lucide-react";
import { api } from "@/lib/http";
import type { AdminUserRow } from "./types";

export function UsersListSection() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      const { data } = await api.get<AdminUserRow[]>("/auth/users");
      setUsers(data);
    } catch (err) {
      console.error("Erro ao carregar usuários", err);
      // aqui você pode trocar por toast custom do projeto
      // toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function updateLocalUser(id: string, patch: Partial<AdminUserRow>) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
    );
  }

  async function handleSave(u: AdminUserRow) {
    try {
      setSavingId(u.id);
      await api.patch(`/auth/users/${u.id}`, {
        role: u.role,
        isSuperUser: u.isSuperUser,
      });
      // toast.success("Usuário atualizado");
    } catch (err) {
      console.error("Erro ao atualizar usuário", err);
      // toast.error("Não foi possível atualizar o usuário");
      // ideal seria recarregar pra garantir estado sync:
      loadUsers();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-sky-500" />
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Usuários existentes
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie o papel global e acesso de cada usuário ao painel.
          </p>
        </div>
        <button
          type="button"
          onClick={loadUsers}
          className="ml-auto text-xs rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-50"
        >
          Atualizar lista
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando usuários...
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Nenhum usuário cadastrado ainda.
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Papel global</th>
                <th className="px-5 py-3 font-medium">Super Admin</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-slate-100 last:border-b hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900">
                        {u.name || "—"}
                      </span>
                      {u.isSuperUser && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                          <Crown className="h-3 w-3" />
                          Super Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 align-middle text-slate-600">
                    {u.email}
                  </td>
                  <td className="px-5 py-3 align-middle">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        updateLocalUser(u.id, {
                          role: e.target.value as AdminUserRow["role"],
                        })
                      }
                      className="w-32 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 align-middle">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                        checked={u.isSuperUser}
                        onChange={(e) =>
                          updateLocalUser(u.id, {
                            isSuperUser: e.target.checked,
                          })
                        }
                      />
                      <span>Sim</span>
                    </label>
                  </td>
                  <td className="px-5 py-3 align-middle text-right">
                    <button
                      type="button"
                      disabled={savingId === u.id}
                      onClick={() => handleSave(u)}
                      className="inline-flex items-center rounded-full bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                    >
                      {savingId === u.id && (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      )}
                      Salvar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
