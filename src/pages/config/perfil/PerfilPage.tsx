import SideMenu from "@/components/SideMenu";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, User, AlertCircle, CheckCircle2, RefreshCw, PanelLeft, LogOut } from "lucide-react";
import { api } from "@/lib/http";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  timezone: z.string().min(1, "Selecione um fuso horário"),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-slate-400";

export default function PerfilPage() {
  // === SideMenu ===
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);

  const detectedTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/Sao_Paulo",
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const avatarWatch = watch("avatarUrl");
  const nameWatch = watch("name");

  useEffect(() => {
    if (avatarWatch) setAvatarPreview(avatarWatch || null);
  }, [avatarWatch]);

  // carregar dados do usuário
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadErr(null);
        const r = await api.get<FormData>("/auth/me");
        const d = r.data;
        const initial: FormData = {
          name: d.name,
          email: d.email,
          avatarUrl: (d as any).avatarUrl || "",
          timezone: (d as any).timezone || detectedTz,
        };
        reset(initial);
        setAvatarPreview(initial.avatarUrl || null);
        setOriginalAvatarUrl(initial.avatarUrl || null);
      } catch (e: any) {
        setLoadErr("Falha ao carregar seu perfil. Tente novamente.");
        console.warn("Falha ao carregar /auth/me:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [reset, detectedTz]);

  // salvar
  const onSave = handleSubmit(async (values) => {
    await api.put("/auth/me", values);
    // se usar toast: toast.success("Perfil atualizado!");
    reset(values); // marca como não-dirty
  });

  return (
    <>
      {/* SideMenu controlado (mesmo componente e props do SettingsHome) */}
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(to) => {
          setMenuOpen(false);
          navigate(to);
        }}
        onLogout={handleLogout}
      />

      <div className="min-h-[calc(100dvh-64px)] bg-slate-50">
        {/* Header fino com trigger do menu */}
        <div className="sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/80 backdrop-blur border-b border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm hover:bg-slate-50"
                title="Abrir menu"
              >
                <span className="sr-only">Abrir menu</span>
                <PanelLeft className="w-5 h-5 text-slate-700" />
              </button>
              <span className="text-sm text-slate-500">Configurações / Perfil</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 transition"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="h-36 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 pb-16">
          {/* Card principal */}
          <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 overflow-hidden">
            {/* Cabeçalho do card */}
            <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <AvatarPreview
                    url={avatarPreview}
                    name={nameWatch}
                    onError={() => setAvatarPreview(null)}
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                      Meu perfil
                    </h1>
                    <p className="text-sm text-slate-500">
                      Gerencie suas informações e preferências de conta.
                    </p>
                  </div>
                </div>

                <StatusPill loading={loading} error={!!loadErr} dirty={isDirty} />
              </div>

              {loadErr && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    {loadErr}
                    <button
                      className="ml-2 inline-flex items-center gap-1 underline hover:no-underline"
                      onClick={() => location.reload()}
                    >
                      <RefreshCw className="h-4 w-4" /> Recarregar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Corpo do card */}
            <div className="px-5 sm:px-8 py-6">
              {loading ? (
                <SkeletonForm />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Coluna esquerda: Avatar + dicas */}
                  <div className="lg:col-span-1">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h3 className="text-sm font-medium text-slate-700 mb-3">Foto de perfil</h3>

                      <div className="flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                          <AvatarCircle url={originalAvatarUrl} name={nameWatch} size={80} />
                          <span className="text-xs font-medium text-slate-600">Foto antiga</span>
                        </div>

                        <span className="text-slate-400">→</span>

                        <div className="flex flex-col items-center gap-2">
                          <AvatarCircle url={avatarPreview} name={nameWatch} size={80} />
                          <span className="text-xs font-medium text-blue-600">Nova Foto</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna direita: Form */}
                  <div className="lg:col-span-2">
                    <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Nome" error={errors.name?.message}>
                        <input
                          {...register("name")}
                          className={inputCls}
                          placeholder="Seu nome completo"
                          autoComplete="name"
                        />
                      </Field>

                      <Field label="E-mail (login)" error={errors.email?.message}>
                        <input
                          {...register("email")}
                          readOnly
                          className={`${inputCls} opacity-70 cursor-not-allowed`}
                          autoComplete="email"
                        />
                      </Field>

                      <Field label="Avatar (URL)" error={errors.avatarUrl?.message}>
                        <input
                          {...register("avatarUrl")}
                          className={inputCls}
                          placeholder="https://exemplo.com/avatar.jpg"
                        />
                      </Field>

                      <Field label="Fuso horário" error={errors.timezone?.message}>
                        <div className="flex items-center gap-2">
                          <select {...register("timezone")} className={inputCls}>
                            {timezones.map((tz) => (
                              <option key={tz} value={tz}>
                                {tz}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="whitespace-nowrap rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 active:bg-slate-200 transition-colors"
                            onClick={() => setValue("timezone", detectedTz, { shouldDirty: true })}
                            title="Usar fuso horário detectado"
                          >
                            Usar detectado
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Detectado: <b>{detectedTz}</b>
                        </p>
                      </Field>

                      {/* Ações */}
                      <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                          onClick={() => reset()}
                          disabled={isSubmitting || !isDirty}
                          title="Descartar alterações"
                        >
                          Descartar
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting || !isDirty}
                          className={`rounded-xl px-5 py-2.5 inline-flex items-center gap-2 text-white font-medium shadow-sm transition-colors ${
                            isSubmitting || !isDirty
                              ? "bg-blue-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-500 active:bg-blue-700"
                          }`}
                          title={isDirty ? "Salvar alterações" : "Nada para salvar"}
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Salvar alterações
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rodapé sutil */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Dica: mantenha seu nome e avatar atualizados para uma experiência mais humana ✨
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------- componentes auxiliares ---------------------- */

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
      <div className="mb-1.5 text-sm font-medium text-slate-700">{label}</div>
      {children}
      {error && (
        <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
    </label>
  );
}

function AvatarPreview({
  url,
  name,
  onError,
  size = "md",
}: {
  url: string | null;
  name?: string;
  onError?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const sizeCls =
    size === "lg"
      ? "w-24 h-24"
      : size === "sm"
      ? "w-10 h-10"
      : "w-16 h-16";

  if (url) {
    return (
      <div
        className={`relative ${sizeCls} rounded-full overflow-hidden border border-slate-200 bg-slate-100`}
      >
        <img
          src={url}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={onError}
        />
      </div>
    );
  }

  const initials = getInitials(name);
  return (
    <div
      className={`${sizeCls} rounded-full border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center`}
      title="Sem imagem de avatar"
    >
      {initials ? (
        <span className="font-semibold">
          {size === "lg" ? initials.toUpperCase() : initials.toUpperCase()}
        </span>
      ) : (
        <User className={size === "lg" ? "w-7 h-7" : "w-5 h-5"} />
      )}
    </div>
  );
}

function AvatarCircle({
  url,
  name,
  size = 80,
}: {
  url: string | null;
  name?: string;
  size?: number;
}) {
  const cls = `rounded-full border border-slate-200 bg-slate-100 overflow-hidden`;
  const style = { width: size, height: size };

  if (url) {
    return (
      <div className={cls} style={style}>
        <img
          src={url}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  const initials = getInitials(name) || "🙂";
  return (
    <div
      className={`${cls} flex items-center justify-center text-slate-600`}
      style={style}
      title="Sem imagem de avatar"
    >
      <span className="font-semibold" style={{ fontSize: Math.round(size * 0.35) }}>
        {initials}
      </span>
    </div>
  );
}

function StatusPill({
  loading,
  error,
  dirty,
}: {
  loading: boolean;
  error: boolean;
  dirty: boolean;
}) {
  if (loading)
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-600 px-3 py-1.5 text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando…
      </span>
    );
  if (error)
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 px-3 py-1.5 text-xs">
        <AlertCircle className="h-3.5 w-3.5" /> Erro ao carregar
      </span>
    );
  if (dirty)
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-3 py-1.5 text-xs">
        <AlertCircle className="h-3.5 w-3.5" /> Alterações não salvas
      </span>
    );
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1.5 text-xs">
      <CheckCircle2 className="h-3.5 w-3.5" /> Tudo sincronizado
    </span>
  );
}

function SkeletonForm() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="h-6 w-40 bg-slate-200 rounded mb-3" />
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-28 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-10 w-full bg-slate-200 rounded-xl" />
          </div>
        ))}
        <div className="sm:col-span-2 flex justify-end">
          <div className="h-10 w-40 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function getInitials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] || "").join("");
}

const timezones = [
  "America/Sao_Paulo",
  "America/Fortaleza",
  "America/Manaus",
  "America/Belem",
  "America/Bahia",
  "America/Recife",
  "America/Cuiaba",
  "America/Porto_Velho",
  "America/Rio_Branco",
];
