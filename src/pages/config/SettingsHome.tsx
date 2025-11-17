import SideMenu from "@/components/SideMenu";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  User2,
  ShieldCheck,
  KeyRound,
  ChevronRight,
  RefreshCw,
  PanelLeft,
  LogOut,
  Users,
} from "lucide-react";
import { api } from "@/lib/http";
import { clearAuth, getUser } from "@/lib/auth";

type ConfigSummary = {
  smtpConfigured?: boolean;
  profileCompleted?: boolean;
  mfaEnabled?: boolean;
  apiKeySet?: boolean;
};

const initialSummary: ConfigSummary = {
  smtpConfigured: undefined,
  profileCompleted: undefined,
  mfaEnabled: undefined,
  apiKeySet: undefined,
};

type SettingStatus =
  | { kind: "ok"; label: string }
  | { kind: "warn"; label: string }
  | { kind: "loading"; label: string };

type SettingItem = {
  id: string;
  title: string;
  description: string;
  to: string;
  icon: (props: { className?: string }) => JSX.Element;
  status: SettingStatus;
  accent: string;
  cta: string;
};

type SettingCardProps = Omit<SettingItem, "id">;

export default function SettingsHome() {
  const navigate = useNavigate();

  // pega user direto do storage
  const user = getUser();
  const isSuperUser = !!user?.isSuperUser;

  const [menuOpen, setMenuOpen] = useState(false);
  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  const [summary, setSummary] = useState<ConfigSummary>(initialSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await api.get<ConfigSummary>("/api/config/summary");
        if (alive) setSummary(r.data);
      } catch (e: any) {
        const msg =
          e?.response?.data?.error ||
          e?.message ||
          "Falha ao carregar status";
        if (alive) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(
    () => buildItems(summary, loading, isSuperUser),
    [summary, loading, isSuperUser],
  );

  return (
    <>
      {/* SideMenu controlado, igual no HomePage */}
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(to) => navigate(to)}
        onLogout={handleLogout}
      />

      <div className="min-h-[calc(100dvh-64px)] p-4 md:p-6 lg:p-8 bg-white">
        {/* Cabeçalho */}
        <header className="mb-6 md:mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Botão trigger (igual ao outro) */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-2.5 py-2 shadow-sm hover:bg-gray-50"
              title="Abrir menu"
            >
              <span className="sr-only">Abrir menu</span>
              <PanelLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                Configurações
              </h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                SMTP, Perfil, segurança e integrações. Tudo num lugar só.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-slate-900 hover:bg-gray-50 transition-colors"
              title="Recarregar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Recarregar</span>
            </button>

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
        </header>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {items.map(({ id, ...rest }) => (
            <SettingCard key={id} {...rest} />
          ))}
        </div>
      </div>
    </>
  );
}

function buildItems(
  summary: ConfigSummary,
  loading: boolean,
  isSuperUser: boolean,
): SettingItem[] {
  const statusFrom = (v?: boolean): SettingStatus =>
    loading || v === undefined
      ? { kind: "loading", label: "Checando…" }
      : v
      ? { kind: "ok", label: "OK" }
      : { kind: "warn", label: "Pendente" };

  const items: SettingItem[] = [
    {
      id: "smtp",
      title: "SMTP",
      description: "Envio de e-mails transacionais e notificações.",
      to: "/config/smtp",
      icon: Mail,
      status: statusFrom(summary.smtpConfigured),
      accent: "from-blue-600 to-blue-400",
      cta: summary.smtpConfigured ? "Gerenciar" : "Configurar",
    },
    {
      id: "perfil",
      title: "Perfil",
      description: "Nome, avatar e preferências da sua conta.",
      to: "/config/perfil",
      icon: User2,
      status: statusFrom(summary.profileCompleted),
      accent: "from-blue-700 to-blue-500",
      cta: summary.profileCompleted ? "Editar" : "Completar",
    },
    {
      id: "seguranca",
      title: "Segurança",
      description: "2FA, sessões e dispositivos.",
      to: "/config/seguranca",
      icon: ShieldCheck,
      status: statusFrom(summary.mfaEnabled),
      accent: "from-sky-700 to-sky-500",
      cta: summary.mfaEnabled ? "Gerenciar" : "Ativar 2FA",
    },
    {
      id: "api",
      title: "API Keys",
      description: "Chaves para integrações externas.",
      to: "/config/api-keys",
      icon: KeyRound,
      status: statusFrom(summary.apiKeySet),
      accent: "from-indigo-700 to-indigo-500",
      cta: summary.apiKeySet ? "Ver chaves" : "Criar chave",
    },
  ];

  // card extra só para Super Admin
  if (isSuperUser) {
    items.push({
      id: "users",
      title: "Usuários",
      description: "Criar e gerenciar usuários do painel (Super Admin).",
      to: "/config/users",
      icon: Users,
      status: { kind: "ok", label: "Restrito" },
      accent: "from-purple-700 to-purple-500",
      cta: "Abrir gestão",
    });
  }

  return items;
}

function SettingCard({
  title,
  description,
  to,
  icon: Icon,
  status,
  accent,
  cta,
}: SettingCardProps) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
    >
      <div className="p-5 flex items-start gap-4">
        <div
          className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} grid place-items-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 truncate">
              {title}
            </h3>
            <StatusPill status={status} />
          </div>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {description}
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:text-blue-700">
            {cta}
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: SettingStatus }) {
  if (status.kind === "loading") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-[11px] text-slate-600">
        <span className="size-1.5 rounded-full bg-gray-400 animate-pulse" />
        {status.label}
      </span>
    );
  }
  if (status.kind === "ok") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        {status.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
      <span className="size-1.5 rounded-full bg-amber-500" />
      {status.label}
    </span>
  );
}
