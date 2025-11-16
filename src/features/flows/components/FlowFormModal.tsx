// src/features/flows/components/FlowFormModal.tsx
import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save } from "lucide-react";
import { createFlow, updateFlow } from "@/features/flows/api";
import type { Flow, SaveFlowInput } from "@/features/flows/types";

const schema = z.object({
  empresaId: z.string().uuid("empresaId inválido"),
  name: z.string().min(2, "Informe um nome"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});
type FormData = z.infer<typeof schema>;

export default function FlowFormModal({
  open,
  onClose,
  existing,
  onCreated,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  existing?: Flow | null;
  onCreated?: (f: Flow) => void;
  onUpdated?: (f: Flow) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (existing) {
      setValue("empresaId", existing.empresaId);
      setValue("name", existing.name);
      setValue("description", existing.description ?? "");
      setValue("status", existing.status);
    }
  }, [existing]);

  async function onSubmit(data: FormData) {
    if (existing) {
      const res = await updateFlow(existing.id, data as Partial<SaveFlowInput>);
      onUpdated?.(res);
      onClose();
    } else {
      const res = await createFlow(data as SaveFlowInput);
      onCreated?.(res);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">{existing ? "Editar fluxo" : "Novo fluxo"}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="text-sm text-slate-700">Empresa ID</label>
            <input
              {...register("empresaId")}
              placeholder="UUID da empresa"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
            {errors.empresaId && <p className="mt-1 text-xs text-red-600">{errors.empresaId.message}</p>}
          </div>

          <div>
            <label className="text-sm text-slate-700">Nome</label>
            <input
              {...register("name")}
              placeholder="Ex: Fluxo de Onboarding"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm text-slate-700">Descrição</label>
            <textarea
              {...register("description")}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Status</label>
            <select
              {...register("status")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              defaultValue={existing ? existing.status : "draft"}
            >
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="archived">archived</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-3.5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              <Save size={16} />
              {existing ? "Salvar alterações" : "Criar fluxo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
