// src/pages/NovaEmpresaPage.tsx
import EmpresaForm from "@/features/empresas/EmpresaForm";

export default function NovaEmpresaPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Nova empresa</h1>
        <p className="text-slate-600 text-sm">Preencha os dados para cadastrar a empresa.</p>
      </div>
      <EmpresaForm />
    </div>
  );
}
