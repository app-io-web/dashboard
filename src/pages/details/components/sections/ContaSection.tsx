// src/pages/details/components/sections/ContaSection.tsx
import { Mail, Phone, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import Card from "../Card";
import type { AppDetails } from "../../types";
import EditModal from "../ui/EditModal";
import { useSaveApp } from "../../hooks/useSaveApp";

type Props = { app: AppDetails };

export default function ContaSection({ app }: Props) {
  const [localApp, setLocalApp] = useState<AppDetails>(app);
  const [editing, setEditing] = useState<null | "email" | "telefone">(null);

  const { save, saving } = useSaveApp(localApp.id, {
    onSuccess(updated) {
      setLocalApp((prev) => ({ ...prev, ...updated }));
      setEditing(null);
    },
  });

  const fields = useMemo(
    () => [
      {
        key: "email" as const,
        label: "E-mail",
        icon: <Mail size={18} className="text-blue-600 shrink-0" />,
        value: localApp.email ?? "—",
        placeholder: "ex: dono@empresa.com.br",
        validate: (v: string) =>
          /\S+@\S+\.\S+/.test(v.trim()) || "Informe um e-mail válido.",
      },
      {
        key: "telefone" as const,
        label: "Telefone",
        icon: <Phone size={18} className="text-blue-600 shrink-0" />,
        value: localApp.telefone ?? "—",
        placeholder: "ex: +55 (11) 91234-5678",
        validate: (v: string) =>
          v.trim().length >= 8 || "Informe um telefone válido.",
      },
    ],
    [localApp.email, localApp.telefone]
  );

  async function handleSave(field: "email" | "telefone", value: string) {
    const f = fields.find((x) => x.key === field)!;
    const verdict = f.validate(value);
    if (verdict !== true) {
      // EditModal não tem erro embutido, então vamos recusar o save
      // e deixar o usuário ajustar o valor. Poderíamos evoluir o modal
      // depois pra exibir esse texto.
      throw new Error(typeof verdict === "string" ? verdict : "Valor inválido");
    }
    const patch: Partial<AppDetails> = { [field]: value.trim() };
    await save(patch);
  }

  return (
    <>
      <Card
        title="Informações da Conta"
        icon={<Mail className="text-blue-600" size={20} />}
      >
        <ul className="space-y-3 text-sm">
          {fields.map((f) => (
            <li
              key={f.key}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                {f.icon}
                <span className="text-slate-500">{f.label}</span>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-slate-900 truncate max-w-[240px] sm:max-w-[320px]">
                  {f.value}
                </span>
                <button
                  type="button"
                  onClick={() => setEditing(f.key)}
                  className="inline-flex items-center rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition"
                  title={`Editar ${f.label.toLowerCase()}`}
                >
                  <Pencil size={14} className="mr-1" />
                  Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Modal reusável */}
      {editing && (
        <EditModal
          open={true}
          title={editing === "email" ? "Editar e-mail" : "Editar telefone"}
          type="text"
          initialValue={
            editing === "email"
              ? localApp.email ?? ""
              : localApp.telefone ?? ""
          }
          placeholder={
            editing === "email"
              ? "dono@empresa.com.br"
              : "+55 (11) 91234-5678"
          }
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={(value) => handleSave(editing, value)}
        />
      )}
    </>
  );
}
