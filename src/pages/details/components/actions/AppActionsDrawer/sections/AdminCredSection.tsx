// src/pages/details/components/actions/AppActionsDrawer/sections/AdminCredSection.tsx
import { KeyRound } from "lucide-react";
import type { AdminCred } from "../types";


export function AdminCredSection({
  credKind,
  setCredKind,
  loginEmail,
  setLoginEmail,
  setPasswordUrl,
  setSetPasswordUrl,
  tempPassword,
  setTempPassword,
}: {
  credKind: AdminCred["kind"];
  setCredKind: (k: AdminCred["kind"]) => void;
  loginEmail: string;
  setLoginEmail: (s: string) => void;
  setPasswordUrl: string;
  setSetPasswordUrl: (s: string) => void;
  tempPassword: string;
  setTempPassword: (s: string) => void;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <KeyRound size={18} className="text-violet-600" />
        Credencial administrativa
      </h3>

      <div className="space-y-3 rounded-xl border border-slate-200 p-3">
        <label className="block text-sm font-medium">E-mail de login</label>
        <input
          value={loginEmail}
          onChange={e => setLoginEmail(e.target.value)}
          placeholder="admin@empresa.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200"
        />

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
            <input
              type="radio"
              name="credKind"
              checked={credKind === "setPasswordUrl"}
              onChange={() => setCredKind("setPasswordUrl")}
            />
            <span className="text-sm">URL para definir senha</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
            <input
              type="radio"
              name="credKind"
              checked={credKind === "tempPassword"}
              onChange={() => setCredKind("tempPassword")}
            />
            <span className="text-sm">Senha temporária</span>
          </label>
        </div>

        {credKind === "setPasswordUrl" ? (
          <div className="grid gap-2">
            <input
              value={setPasswordUrl}
              onChange={e => setSetPasswordUrl(e.target.value)}
              placeholder="https://exemplo.com/definir-senha/..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200"
            />
            <p className="text-xs text-slate-500">Use o link oficial de primeiro acesso/definição de senha.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            <input
              value={tempPassword}
              onChange={e => setTempPassword(e.target.value)}
              placeholder="Senha provisória segura"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200"
            />
            <p className="text-xs text-slate-500">Evite reuso. Recomende troca no primeiro login.</p>
          </div>
        )}
      </div>
    </section>
  );
}
