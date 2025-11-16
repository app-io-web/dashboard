import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Save,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Wand2,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/http";
import SideMenu from "@/components/SideMenu";
import { clearAuth } from "@/lib/auth";

/* ------------------ Validação ------------------ */
const schema = z.object({
  host: z.string().min(1, "Host obrigatório"),
  port: z.coerce.number().int().positive().default(587),
  secure: z.boolean().default(false),
  user: z.string().min(1, "Usuário obrigatório"),
  pass: z.string().min(1, "Senha obrigatória"),
  fromName: z.string().min(1, "Nome do remetente obrigatório"),
  fromEmail: z.string().email("E-mail inválido"),
  testEmail: z.string().email("E-mail de teste inválido").optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

/* ------------------ Normalizadores ------------------ */
function normalizeIn(data: any): FormData {
  const user = data?.user ?? data?.auth?.user ?? data?.username ?? "";
  const pass = data?.pass ?? data?.auth?.pass ?? data?.passwordApp ?? "";
  return {
    host: data?.host ?? "",
    port: Number(data?.port ?? 587),
    secure: Boolean(data?.secure ?? false),
    user,
    pass,
    fromName: data?.fromName ?? "Progress App",
    fromEmail: data?.fromEmail ?? "",
    testEmail: "",
  };
}
function normalizeOut(v: FormData) {
  return {
    host: v.host,
    port: v.port,
    secure: v.secure,
    username: v.user,
    passwordApp: v.pass,
    fromName: v.fromName,
    fromEmail: v.fromEmail,
  };
}

/* ------------------ UI helpers ------------------ */
const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed";
const labelCls = "mb-1 text-sm text-slate-700";
const errCls = "mt-1 text-xs text-red-600";

type PresetKey = "custom" | "gmail" | "office" | "mailpit" | "umbler" | "hostgator";
const PRESETS: Record<
  PresetKey,
  { label: string; host: string; port: number; secure: boolean; userHint?: string }
> = {
  custom: { label: "Personalizado", host: "", port: 587, secure: false },
  gmail: {
    label: "Gmail (App Password)",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    userHint: "Seu endereço @gmail.com ou do seu domínio Google Workspace",
  },
  office: {
    label: "Outlook / Office 365",
    host: "smtp.office365.com",
    port: 587,
    secure: true,
    userHint: "Seu e-mail do Microsoft 365",
  },
  mailpit: { label: "Mailpit (dev)", host: "localhost", port: 1025, secure: false, userHint: "qualquer" },
  umbler: { label: "Umbler", host: "smtp.umbler.com", port: 587, secure: true },
  hostgator: { label: "HostGator", host: "brXXXX.hostgator.com.br", port: 465, secure: true },
};

export default function SmtpPage() {
  /* --------- Side menu --------- */
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  /* --------- Estados --------- */
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<null | { at: Date; ok: boolean }>(null);
  const [testState, setTestState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [preset, setPreset] = useState<PresetKey>("custom");
  const [showPass, setShowPass] = useState(false);
  const serverSnapshotRef = useRef<FormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: normalizeIn({}) });

  const secure = watch("secure");
  const port = watch("port");
  const fromEmail = watch("fromEmail");

  /* --------- Auto-ajuste porta TLS --------- */
  useEffect(() => {
    if ([25, 465, 587, 1025].includes(Number(port))) {
      if (secure && port !== 465) setValue("port", 465);
      if (!secure && port === 465) setValue("port", 587);
    }
  }, [secure]); // eslint-disable-line

  /* --------- Carrega do servidor --------- */
  async function fetchServer() {
    setLoading(true);
    try {
      const r = await api.get("/smtp");   // << trocado
      const d = normalizeIn(r.data);
      serverSnapshotRef.current = d;
      reset(d, { keepDirty: false });
      const match = (Object.keys(PRESETS) as PresetKey[]).find(
        (k) =>
          k !== "custom" &&
          PRESETS[k].host.toLowerCase() === d.host.toLowerCase() &&
          PRESETS[k].port === d.port &&
          PRESETS[k].secure === d.secure
      );
      setPreset(match ?? "custom");
    } catch {
      // mantém defaults
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServer();
  }, []);

  /* --------- Presets --------- */
  function applyPreset(k: PresetKey) {
    setPreset(k);
    const p = PRESETS[k];
    setValue("host", p.host);
    setValue("port", p.port);
    setValue("secure", p.secure);
  }

  /* --------- Ações --------- */
  const onSave = handleSubmit(async (values) => {
  setTestState("idle");
  setTestMsg(null);
  await api.put("/smtp", normalizeOut(values));  // << trocado
  setLastSaved({ at: new Date(), ok: true });
  serverSnapshotRef.current = values;
  });


  const onTest = handleSubmit(async (values) => {
    setTestState("sending");
    setTestMsg(null);
    try {
      const toRequested = values.testEmail || values.fromEmail;
      const r = await api.post("/smtp/test", { to: toRequested }); // << trocado

      const realTo = r?.data?.to || toRequested;

      setTestState("ok");
      setTestMsg(
        typeof r?.data?.message === "string"
          ? r.data.message
          : `E-mail de teste enviado para ${realTo}.`
      );
    } catch (e: any) {
      setTestState("err");
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Falha ao enviar e-mail de teste.";
      setTestMsg(msg);
    }
  });



  const onReload = () => fetchServer();

  const saving = isSubmitting || loading;
  const saveBtnLabel = saving ? "Salvando..." : "Salvar";
  const testBtnLabel = testState === "sending" ? "Enviando..." : "Enviar e-mail de teste";

  const statusBadge = useMemo(() => {
    if (testState === "ok")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-xs px-2 py-1 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Teste OK
        </span>
      );
    if (testState === "err")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 text-xs px-2 py-1 border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5" /> Teste falhou
        </span>
      );
    if (lastSaved)
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 text-slate-700 text-xs px-2 py-1 border border-slate-200">
          {lastSaved.ok ? "Salvo" : "Erro"} {formatTime(lastSaved.at)}
        </span>
      );
    return null;
  }, [testState, lastSaved]);

  return (
    <div className="bg-slate-50 min-h-[100dvh]">
      {/* --- Side Menu --- */}
      <SideMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onNavigate={(to) => navigate(to)}
        onLogout={handleLogout}
      />
      {/* --- Topbar como na página de perfil --- */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-2 text-slate-700"
                title="Abrir menu"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Configurações de SMTP</h1>
              {statusBadge ? <div className="ml-2">{statusBadge}</div> : null}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-sm text-slate-800"
              >
                Voltar
              </Link>
              <button
                type="button"
                onClick={onReload}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 inline-flex items-center gap-2 text-sm text-slate-800"
                title="Recarregar valores do servidor"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-2 text-slate-700"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Conteúdo --- */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Card de presets */}
        <section className="mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 md:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Preset do provedor</h2>
                <p className="text-sm text-slate-500">Preenche host/porta/TLS. Confirme usuário e remetente.</p>
              </div>
              <Wand2 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`rounded-xl px-3 py-2 border text-sm transition ${
                      preset === k
                        ? "border-blue-400 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                    }`}
                    onClick={() => applyPreset(k)}
                  >
                    {PRESETS[k].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Form principal em card */}
        <form onSubmit={onSave} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 md:p-5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Credenciais SMTP</h2>
              <p className="text-sm text-slate-500">Configure o servidor, autenticação e remetente padrão.</p>
            </div>

            <div className="p-4 md:p-6 space-y-5">
              <Field label="Host" error={errors.host?.message}>
                <input
                  {...register("host")}
                  className={inputCls}
                  placeholder="smtp.seudominio.com"
                  disabled={saving}
                />
                <Hint>Ex.: smtp.gmail.com, smtp.office365.com, brXXXX.hostgator.com.br</Hint>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Porta" error={errors.port?.message}>
                  <input
                    type="number"
                    {...register("port", { valueAsNumber: true })}
                    className={inputCls}
                    placeholder="587"
                    disabled={saving}
                    inputMode="numeric"
                  />
                  <Hint>587 (STARTTLS) ou 465 (TLS/SSL)</Hint>
                </Field>
                <Field label="TLS/SSL">
                  <label className="inline-flex items-center gap-2 text-slate-700">
                    <input type="checkbox" {...register("secure")} className="h-4 w-4" disabled={saving} />
                    {secure ? "Ativado (465)" : "Desativado (587/25)"}
                  </label>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Usuário" error={errors.user?.message}>
                  <input
                    {...register("user")}
                    className={inputCls}
                    placeholder="no-reply@seudominio.com"
                    disabled={saving}
                  />
                  {preset !== "custom" && PRESETS[preset].userHint ? (
                    <Hint>{PRESETS[preset].userHint}</Hint>
                  ) : null}
                </Field>

                <Field label="Senha" error={errors.pass?.message}>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      {...register("pass")}
                      className={`${inputCls} pr-10`}
                      disabled={saving}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 text-slate-500"
                      onClick={() => setShowPass((s) => !s)}
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Hint>
                    Gmail: use <em>App Password</em> (2FA necessária). Office 365: SMTP Auth habilitado.
                  </Hint>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome do remetente" error={errors.fromName?.message}>
                  <input
                    {...register("fromName")}
                    className={inputCls}
                    placeholder="Seu App"
                    disabled={saving}
                  />
                </Field>
                <Field label="E-mail do remetente" error={errors.fromEmail?.message}>
                  <input
                    {...register("fromEmail")}
                    className={inputCls}
                    placeholder="no-reply@seudominio.com"
                    disabled={saving}
                  />
                  <Hint>
                    Muitos provedores exigem que o remetente seja o <strong>mesmo</strong> do usuário.
                  </Hint>
                </Field>
              </div>

              <Field label="E-mail para teste (opcional)" error={errors.testEmail?.message}>
                <input
                  {...register("testEmail")}
                  className={inputCls}
                  placeholder="voce@exemplo.com"
                  disabled={saving}
                />
                <Hint>
                  Se vazio, envia para <code className="text-slate-700">{fromEmail || "o remetente"}</code>.
                </Hint>
              </Field>
            </div>

            {/* Barra de ações do form (parecida com perfil) */}
            <div className="px-4 md:px-6 pb-5">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 inline-flex items-center gap-2 disabled:opacity-60"
                  title={isDirty ? "Salvar alterações" : "Nada alterado"}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saveBtnLabel}
                </button>

                <button
                  type="button"
                  onClick={onTest}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 px-4 py-2 inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {testState === "sending" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {testBtnLabel}
                </button>

                {testMsg ? (
                    <div
                      className={`text-sm px-3 py-2 rounded-xl border ${
                        testState === "ok"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      <div>{testMsg}</div>

                      {testState === "ok" && (
                        <div className="mt-1 text-xs text-slate-700">
                          Por gentileza, acesse a{" "}
                          <strong>caixa de enviados</strong> do seu e-mail para confirmar se o
                          teste foi realmente disparado.
                          {" "}
                          Se você estiver usando Gmail, você pode abrir direto os enviados por aqui:{" "}
                          <a
                            href="https://mail.google.com/mail/u/2/#sent"
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                          >
                            abrir enviados do Gmail
                          </a>.
                        </div>
                      )}
                    </div>
                        ) : null}

              </div>
            </div>
          </div>

          {/* Card de dicas rápidas (estilo help no perfil) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 md:p-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Dicas rápidas</h3>
            </div>
            <div className="p-4 md:p-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                <li>Gmail exige 2FA + App Password. O usuário costuma ser seu e-mail completo.</li>
                <li>No Office 365, habilite “SMTP AUTH” para a conta usada como remetente.</li>
                <li>Em ambientes de dev, o Mailpit (localhost:1025) é o amigo que não julga.</li>
              </ul>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

/* ------------------ Subcomponentes ------------------ */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className={labelCls}>{label}</div>
      {children}
      {error ? <div className={errCls}>{error}</div> : null}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 text-xs text-slate-500">{children}</div>;
}

/* ------------------ Utils ------------------ */
function formatTime(d: Date) {
  const p2 = (n: number) => n.toString().padStart(2, "0");
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}
