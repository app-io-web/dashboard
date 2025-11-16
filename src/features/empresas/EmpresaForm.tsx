// src/features/empresas/EmpresaForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmpresa, type CreateEmpresaInput } from "./api";
import { pushToast } from "@/lib/toast";

const schema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  emailContato: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cnpj: z.string().min(11, "CNPJ muito curto").max(18, "CNPJ inválido").optional().or(z.literal("")),
  responsavel: z.string().optional().or(z.literal("")),
  loginEmail: z.string().email("E-mail de login inválido").optional().or(z.literal("")),
  loginPassword: z.string().min(6, "Mínimo de 6 caracteres").optional().or(z.literal("")),
}).refine(
  v => !(v.loginEmail && !v.loginPassword) && !(!v.loginEmail && v.loginPassword),
  { message: "Para credencial própria, preencha login e senha.", path: ["loginEmail"] }
);

type FormData = z.infer<typeof schema>;

export default function EmpresaForm() {
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    setSubmitting(true);
    try {
      const payload: CreateEmpresaInput = {
        nome: values.nome.trim(),
        emailContato: values.emailContato?.trim() || undefined,
        cnpj: values.cnpj?.trim() || undefined,
        responsavel: values.responsavel?.trim() || undefined,
        loginEmail: values.loginEmail?.trim() || undefined,
        loginPassword: values.loginPassword || undefined,
      };
      const saved = await createEmpresa(payload);
      pushToast({ type: "success", title: "Empresa criada", message: `“${saved.nome}” foi adicionada.` });
      nav("/empresas");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Erro ao criar";
      pushToast({ type: "error", title: "Falha ao salvar", message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Informações da empresa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome*" error={errors.nome?.message}>
            <input {...register("nome")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-sky-300 outline-none"/>
          </Field>

          <Field label="Responsável" error={errors.responsavel?.message}>
            <input {...register("responsavel")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-sky-300 outline-none"/>
          </Field>

          <Field label="E-mail de contato" error={errors.emailContato?.message}>
            <input {...register("emailContato")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-sky-300 outline-none"/>
          </Field>

          <Field label="CNPJ" error={errors.cnpj?.message}>
            <input {...register("cnpj")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-sky-300 outline-none"/>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Credenciais (opcional)</h2>
          <p className="text-xs text-slate-500">Preencha e-mail e senha para ativar login próprio da empresa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="E-mail de login" error={errors.loginEmail?.message}>
            <input {...register("loginEmail")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-sky-300 outline-none"/>
          </Field>

          <Field label="Senha" error={errors.loginPassword?.message}>
            <input type="password" {...register("loginPassword")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-sky-300 outline-none"/>
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => history.back()}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-60"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Salvar empresa
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}
