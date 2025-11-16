// src/pages/create/CreatePage.tsx
import { useState } from "react";
import { Plus, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/http";
import { TextField } from "./components/TextField";
import { TextArea } from "./components/TextArea";
import { SelectField } from "./components/SelectField";
import { ActionsBar } from "./components/ActionsBar";
import { EmpresaField } from "./components/EmpresaField"; // 👈 novo

/** Status “bonitos” que teu backend já converte para enum */
type Status =
  | "Em planejamento"
  | "Em estruturação"
  | "Em desenvolvimento"
  | "Em testes"
  | "Homologação"
  | "Em produção"
  | "Manutenção"
  | "Descontinuado"
  | "Publicado";

type Ambiente =
  | "GitPages"
  | "Vercel"
  | "Netlify"
  | "CloudflarePages"
  | "Render"
  | "Railway"
  | "FlyIO"
  | "VPS"
  | "AWS"
  | "GoogleCloud"
  | "Firebase"
  | "Outro";

type NewAppPayload = {
  nome: string;
  descricao?: string;
  status?: Status;
  ambiente?: Ambiente;
  dominio?: string | null;
  repositorio?: string | null;
  email?: string | null;
  valor?: number | null;
  /** Campos extras suportados no back (opcionais na criação) */
  telefone?: string | null;
  empresaId?: string | null; // 👈 novo
};

export default function CreatePage() {
  const navigate = useNavigate();

  function safeBack() {
    // Se houver histórico, volta; senão, vai pra home
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  }

  const [form, setForm] = useState<NewAppPayload>({
    nome: "",
    descricao: "",
    status: "Em planejamento",
    ambiente: "GitPages",
    dominio: "",
    repositorio: "",
    email: "",
    valor: undefined,
    telefone: "",
    empresaId: null, // 👈 novo
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof NewAppPayload>(key: K, value: NewAppPayload[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // validações rápidas
    const nome = form.nome?.trim();
    if (!nome || nome.length < 3) {
      setError("Informe um nome com pelo menos 3 caracteres.");
      return;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Email inválido.");
      return;
    }
    if (form.dominio && !/^https?:\/\/.+/i.test(form.dominio)) {
      setError("Domínio/URL deve começar com http:// ou https://");
      return;
    }
    if (form.repositorio && !/^https?:\/\/.+/i.test(form.repositorio)) {
      setError("Repositório deve ser uma URL válida (http/https).");
      return;
    }

    // número: aceita “300” e “300,50”
    const parsedValor =
      typeof form.valor === "number"
        ? form.valor
        : (() => {
            const raw = (form.valor as unknown as string) ?? "";
            if (typeof raw !== "string") return null;
            const v = raw.trim();
            if (!v) return null;
            const n = Number(v.replace(",", "."));
            return Number.isFinite(n) ? n : null;
          })();

    // payload: strings vazias -> null/undefined
    const payload: NewAppPayload = {
      nome,
      descricao: form.descricao?.trim() || undefined,
      status: form.status,
      ambiente: form.ambiente,
      dominio: form.dominio?.trim() ? form.dominio.trim() : null,
      repositorio: form.repositorio?.trim() ? form.repositorio.trim() : null,
      email: form.email?.trim() ? form.email.trim() : null,
      telefone: (form.telefone as any)?.trim ? ((form.telefone as any).trim() || null) : null,
      valor: parsedValor ?? null,
      empresaId: form.empresaId || null, // 👈 envia pro back
    };

    setBusy(true);
    try {
      const res = await api.post("/apps", payload);
      const created = res.data as { id?: string; ref?: string };
      const appKey = created.ref ?? created.id;

      if (appKey) {
        navigate(`/apps/${appKey}`);
        return;
      }
      setBusy(false);
      setError("Criado, mas não recebi um identificador de retorno.");
    } catch (err: any) {
      setBusy(false);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Erro ao criar o aplicativo. Confira os campos e tente novamente."
      );
    }
  }

  function handleClear() {
    setForm({
      nome: "",
      descricao: "",
      status: "Em planejamento",
      ambiente: "GitPages",
      dominio: "",
      repositorio: "",
      email: "",
      valor: undefined,
      telefone: "",
      empresaId: null, // 👈 mantém o reset
    });
    setError(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      {/* Topbar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Plus className="text-blue-600" size={22} />
              <h1 className="text-2xl font-bold tracking-tight">Criar novo aplicativo</h1>
            </div>

            <button
              type="button"
              onClick={safeBack}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50 active:scale-[0.99]"
              title="Voltar"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
          </div>

          <p className="text-slate-500 mt-1">
            Defina as informações iniciais. Você poderá ajustar detalhes depois.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        <form
          className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 space-y-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <TextField
            label="Nome do aplicativo"
            placeholder="Ex.: Portal de Cupons"
            value={form.nome}
            onChange={(v) => set("nome", v)}
            required
          />

          <TextArea
            label="Descrição"
            placeholder="Descreva brevemente a finalidade do app…"
            value={form.descricao || ""}
            onChange={(v) => set("descricao", v)}
            rows={4}
          />

          <EmpresaField
            value={form.empresaId ?? null}
            onChange={(id) => set("empresaId", id)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField<Status>
              label="Status"
              value={form.status || "Em planejamento"}
              onChange={(v) => set("status", v)}
              options={[
                "Em planejamento",
                "Em estruturação",
                "Em desenvolvimento",
                "Em testes",
                "Homologação",
                "Em produção",
                "Manutenção",
                "Descontinuado",
                "Publicado",
              ]}
            />

            <SelectField<Ambiente>
              label="Ambiente"
              value={form.ambiente || "GitPages"}
              onChange={(v) => set("ambiente", v)}
              options={[
                "GitPages",
                "VPS",
                "Vercel",
                "Netlify",
                "AWS",
                "CloudflarePages",
                "Railway",
                "GoogleCloud",
                "Render",
                "Firebase",
                "FlyIO",
                "Outro",
              ]}
            />
          </div>

          <TextField
            label="Domínio / URL pública"
            placeholder="https://minhaapp.empresa.com.br"
            value={form.dominio || ""}
            onChange={(v) => set("dominio", v)}
            hint="Opcional. Use http:// ou https://"
          />

          <TextField
            label="Repositório (Git)"
            placeholder="https://github.com/GRUPOMAX/portal"
            value={form.repositorio || ""}
            onChange={(v) => set("repositorio", v)}
            hint="Opcional."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Email do responsável"
              placeholder="exemplo@empresa.com"
              value={form.email || ""}
              onChange={(v) => set("email", v)}
              hint="Opcional. Usado para convites/avisos."
            />
            <TextField
              label="Telefone"
              placeholder="+55 27 99999-9999"
              value={(form.telefone as any) || ""}
              onChange={(v) => set("telefone", v as any)}
              hint="Opcional."
            />
          </div>

          <TextField
            label="Valor (R$)"
            placeholder="300"
            value={form.valor?.toString() ?? ""}
            onChange={(v) => {
              const trimmed = v.trim();
              if (!trimmed) return set("valor", undefined as any);
              const n = Number(trimmed.replace(",", "."));
              set("valor", Number.isFinite(n) ? (n as number) : (form.valor ?? undefined));
            }}
            inputMode="decimal"
            hint="Opcional."
          />

          <ActionsBar
            busy={busy}
            onClear={handleClear}
            submitLabel="Criar aplicativo"
            icon={<Save size={18} />}
          />
        </form>
      </div>
    </main>
  );
}
