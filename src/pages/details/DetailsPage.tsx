// src/pages/details/DetailsPage.tsx
import { useCallback, useState } from "react";
import PageHeader from "./components/PageHeader";
import InfoSection from "./components/sections/InfoSection";
import ConfigSection from "./components/sections/ConfigSection";
import ActivitySection from "./components/sections/ActivitySection";
import ContaSection from "./components/sections/ContaSection";
import ErrorBoundary from "@/components/ErrorBoundary";
import PublishAppModal from "./components/modals/PublishAppModal";
import { useDetailsPageController } from "./hooks/useDetailsPageController";
import { api } from "@/lib/http";
import { uploadLogo } from "@/lib/uploadLogo"; // ✅ vai subir FILE quando precisar
import ToastHost from "@/components/ToastHost";


import AppActionsDrawer, {
  type ImportantUrl,
  type AdminCred,
} from "./components/actions/AppActionsDrawer";

import { useSaveAppActions } from "./hooks/useSaveAppActions";

// util p/ redimensionar quando autoResize = true
// util p/ redimensionar quando autoResize = true
async function resizeImageTo(file: File, w: number, h: number) {
  // helper: tenta obter um bitmap a partir do File
  async function getBitmapFromFile(f: File): Promise<ImageBitmap | HTMLImageElement> {
    if ("createImageBitmap" in window) {
      try {
        // ✅ o tipo aceito é Blob/File, não ArrayBuffer
        return await createImageBitmap(f);
      } catch {
        // segue para fallback
      }
    }
    // Fallback: carrega via <img> + objectURL
    const url = URL.createObjectURL(f);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // Se algo der errado, devolve o original
  try {
    const src = await getBitmapFromFile(file);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    const srcW = (src as any).width;
    const srcH = (src as any).height;

    const srcRatio = srcW / srcH;
    const dstRatio = w / h;

    let sx = 0, sy = 0, sw = srcW, sh = srcH;
    if (srcRatio > dstRatio) {
      // fonte mais larga: corta laterais
      const newW = srcH * dstRatio;
      sx = (srcW - newW) / 2;
      sw = newW;
    } else if (srcRatio < dstRatio) {
      // fonte mais alta: corta topo/baixo
      const newH = srcW / dstRatio;
      sy = (srcH - newH) / 2;
      sh = newH;
    }

    ctx.drawImage(src as any, sx, sy, sw, sh, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92)
    );
    if (!blob) return file;

    const base = file.name.replace(/\.(png|jpe?g|webp|gif)$/i, "");
    return new File([blob], `${base}-${w}x${h}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}


export default function DetailsPage() {
  const {
    app,
    subtitle,
    rightActions,
    openModal,
    busy,
    handleConfirm,
    setOpenModal,
    ref,
    mutate, // pode não ser função – vamos proteger
  } = useDetailsPageController();

  const appKey = app?.ref ?? app?.id; // usamos a mesma chave que o back espera

  // 🔒 usa mutate apenas se for função (SWR-like)
  const swrMutate = typeof mutate === "function" ? (mutate as any) : undefined;

  const [actionsOpen, setActionsOpen] = useState(false);
  const [savingActions, setSavingActions] = useState(false);

  const initialUrls: ImportantUrl[] = (app as any)?.importantUrls ?? [];
  const initialCred: Partial<AdminCred> = (app as any)?.adminCredential ?? {};

  // passa o mutate seguro para o hook
  const saveActions = useSaveAppActions(ref || (app as any)?.id, swrMutate);

  // PATCH no servidor (o hook já faz otimista + revalidate se tiver mutate)
  const handleSaveActions = useCallback(
    async (payload: { urls: ImportantUrl[]; cred: AdminCred | null }) => {
      setSavingActions(true);
      try {
        await saveActions(payload as any);
        setActionsOpen(false);
      } finally {
        setSavingActions(false);
      }
    },
    [saveActions]
  );

  // GET fresco para popular o drawer ao abrir
  const refreshActions = useCallback(async () => {
    const id = ref || (app as any)?.id;
    if (!id) return;
    const { data } = await api.get(`/apps/${encodeURIComponent(String(id))}`);
    return {
      urls: data?.importantUrls ?? [],
      cred: data?.adminCredential ?? null,
    };
  }, [ref, (app as any)?.id]);

  // Otimista na página: só se houver mutate válido
  const handleSavedOptimistic = useCallback(
    (payload: { urls: ImportantUrl[]; cred: AdminCred | null }) => {
      if (!swrMutate) return; // sem mutate, não tenta otimizar aqui
      swrMutate(
        (prev: any) => (prev ? { ...prev, importantUrls: payload.urls, adminCredential: payload.cred } : prev),
        { revalidate: false }
      );
    },
    [swrMutate]
  );

  // Revalidação pós-salvar: se não tiver mutate, faz no-op (o drawer já busca fresco ao abrir)
  const revalidateAfterSave = useCallback(() => {
    if (swrMutate) return swrMutate(undefined, { revalidate: true });
    return Promise.resolve(); // fallback silencioso
  }, [swrMutate]);

  
  function toServerAdminCredential(
    cred: { kind: "setPasswordUrl" | "tempPassword"; loginEmail: string; setPasswordUrl?: string; tempPassword?: string } | null
  ) {
    if (!cred || !cred.loginEmail?.trim()) return null;
    if (cred.kind === "tempPassword" && cred.tempPassword?.trim()) {
      return { kind: "temp", loginEmail: cred.loginEmail.trim(), tempPassword: cred.tempPassword.trim() };
    }
    if (cred.kind === "setPasswordUrl" && cred.setPasswordUrl?.trim()) {
      return { kind: "reset", loginEmail: cred.loginEmail.trim(), setPasswordUrl: cred.setPasswordUrl.trim() };
    }
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      <PageHeader
        subtitle={subtitle}
        rightActions={rightActions}
        app={app}
        onOpenActions={() => setActionsOpen(true)}
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {app && (
              <>
                <div className="lg:col-span-7 space-y-6">
                  <ErrorBoundary><InfoSection app={app} /></ErrorBoundary>
                  <ErrorBoundary><ContaSection app={app} /></ErrorBoundary>
                </div>

                <div className="lg:col-span-5">
                  <ErrorBoundary><ConfigSection app={app} /></ErrorBoundary>
                </div>

                <div className="lg:col-span-12">
                  <ErrorBoundary><ActivitySection app={app} /></ErrorBoundary>
                </div>
              </>
            )}
          </div>
        </ErrorBoundary>
      </div>

      <PublishAppModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        saving={busy}
        onConfirm={async (args) => {
          const ok = await handleConfirm(args);
          if (ok) {
            setOpenModal(false);
            // 👇 espera o fechamento e recarrega
            setTimeout(() => window.location.reload(), 100);
          }
          return ok;
        }}
      />



      {app && (
          <AppActionsDrawer
            open={actionsOpen}
            onClose={() => setActionsOpen(false)}
            empresaId={app.empresaId}     // agora é seguro
            appId={app.id}
            appName={app.nome}
            initialUrls={(app as any)?.importantUrls ?? []}
            initialCred={(app as any)?.adminCred ?? (app as any)?.adminCredential ?? {}}
            initialImages={{
              imageSquareUrl: (app as any)?.imageSquareUrl ?? (app as any)?.logoUrl ?? null,
              imageWideUrl: (app as any)?.imageWideUrl ?? null,
              // @ts-expect-error compat
              logoUrl: (app as any)?.logoUrl ?? null,
            }}
            onRefresh={async () => {
              const appKey = app.ref ?? app.id;
              if (!appKey) return;
              const { data } = await api.get(`/apps/${encodeURIComponent(String(appKey))}`);
              return {
                urls: data?.importantUrls ?? [],
                cred: data?.adminCredential ?? null,
                images: {
                  imageSquareUrl: data?.imageSquareUrl ?? data?.logoUrl ?? null,
                  imageWideUrl: data?.imageWideUrl ?? null,
                  logoUrl: data?.logoUrl ?? null,
                },
              };
            }}
            onSaveAll={async ({ urls, cred, images }) => {
              const appKey = app.ref ?? app.id;
              if (!appKey) throw new Error("app key ausente (ref/id)");
              // ... resto do código que você já tinha
            }}
            onAfterSave={async () => {
              if (typeof mutate === "function") {
                await (mutate as any)(undefined, { revalidate: true });
              }
            }}
          />
        )}

      <ToastHost />
    </main>
  );
}
