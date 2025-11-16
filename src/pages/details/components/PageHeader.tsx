// src/pages/details/components/PageHeader.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, PanelRightOpen } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

// (mantém os imports locais se quiser como 3º nível de fallback)
import fallbackLogoLocal from "@/assets/LOGO.jpg";
import fallbackWideLocal from "@/assets/WIDESCREEN.jpg";

// 👇 fallbacks remotos solicitados
const FALLBACK_SQUARE = "https://i.postimg.cc/DZLm9b7L/LOGO.jpg";
const FALLBACK_WIDE = "https://i.postimg.cc/B6Htr1JD/WIDESCREEN.jpg";

type Props = {
  subtitle: string;
  rightActions?: ReactNode;
  onOpenActions?: () => void;
  app?: {
    nome?: string;
    imageSquareUrl?: string | null;
    imageWideUrl?: string | null;
    status?: string;
    logoUrl?: string | null;
  };
};

export default function PageHeader({ subtitle, rightActions, onOpenActions, app }: Props) {
  // Logo com fallback remoto (e local como último recurso)
  const [logoUrl, setLogoUrl] = useState<string>(
    app?.imageSquareUrl || app?.logoUrl || FALLBACK_SQUARE || fallbackLogoLocal,
  );

  // Background com pré-carregamento para pegar erro
  const [bgUrl, setBgUrl] = useState<string>(app?.imageWideUrl || FALLBACK_WIDE || fallbackWideLocal);

  // Quando props mudarem, revalida as URLs
  useEffect(() => {
    // logo
    const candidateLogo = app?.imageSquareUrl || app?.logoUrl;
    setLogoUrl(candidateLogo || FALLBACK_SQUARE || fallbackLogoLocal);

    // background
    const candidateBg = app?.imageWideUrl;
    if (!candidateBg) {
      setBgUrl(FALLBACK_WIDE || fallbackWideLocal);
    } else {
      const img = new Image();
      img.onload = () => setBgUrl(candidateBg);
      img.onerror = () => setBgUrl(FALLBACK_WIDE || fallbackWideLocal);
      img.src = candidateBg;
    }
  }, [app?.imageSquareUrl, app?.logoUrl, app?.imageWideUrl]);

  return (
    <div
      className={`
        relative w-full border-b border-gray-200 text-white
        bg-slate-900
        min-h-[220px] md:min-h-[260px]
        bg-[position:center_38%] md:bg-center
        bg-cover bg-no-repeat
      `}
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25 mix-blend-multiply" />

      <div className="relative mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <img
            src={logoUrl}
            alt={app?.nome || "Logo do app"}
            className="w-24 h-24 rounded-2xl shadow-lg ring-1 ring-white/20 object-cover bg-white/10 backdrop-blur-sm"
            onError={() => setLogoUrl(FALLBACK_SQUARE || fallbackLogoLocal)}
          />

          <div>
            <h1 className="text-3xl font-bold tracking-tight drop-shadow-md">
              {app?.nome || "Detalhes do aplicativo"}
            </h1>
            <p className="text-white/85 mt-1">{subtitle}</p>
            {app?.status && (
              <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
                {app.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenActions}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white shadow-sm hover:bg-white/20 transition"
            title="Abrir menu de ações do app"
          >
            <PanelRightOpen size={18} />
            AÇÕES
          </button>

          {rightActions}

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white shadow-sm hover:bg-white/20 transition"
          >
            <ArrowLeft size={18} />
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
