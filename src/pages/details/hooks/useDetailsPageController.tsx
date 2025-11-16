import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Rocket } from "lucide-react";

import { useAppDetails } from "../useAppDetails";
import { usePublishApp } from "./usePublishApp";
import { useNotifyAppReady } from "./useNotifyAppReady";
import { shortRef, isPublishedPretty } from "../utils/status";
// ⬇️ importante: type-only import (não vira JS em runtime)
import type { ResizeableSquare, ResizeableWide } from "../utils/images";
import { resolveImages } from "../utils/images";

import { uploadLogo } from "@/lib/uploadLogo";

export function useDetailsPageController() {
  const { ref = "" } = useParams<{ ref: string }>();
  const { data: app, mutate } = useAppDetails(ref);
  const { publish, loading: publishing } = usePublishApp();
  const { sendAppReadyEmail, loading: notifying } = useNotifyAppReady();

  const [openModal, setOpenModal] = useState(false);
  const busy = publishing || notifying;
  const isPublicado = isPublishedPretty(app?.status);

  const subtitle = useMemo(() => {
    return ref
      ? `Visualizando informações do aplicativo #${app?.codigo ?? shortRef(ref)}`
      : "Selecione um item na lista para ver detalhes.";
  }, [ref, app?.codigo]);

  async function handleConfirm({
  square,
  wide,
  cred,
  notes,
  autoResize,
}: {
  square: ResizeableSquare | null;
  wide: ResizeableWide | null;
  cred: { loginEmail: string; setPasswordUrl?: string; tempPassword?: string } | null;
  notes?: string;
  autoResize?: boolean;
}): Promise<boolean> {
  const NEW_STATUS = "Publicado" as const;

  // resolve identificador
  const refForApi =
    (typeof ref === "string" && ref.trim()) ||
    (typeof app?.id === "string" && app.id.trim()) ||
    (app?.codigo != null ? String(app.codigo) : "");
  if (!refForApi) throw new Error("ref_indefinido: não foi possível resolver o identificador do app");

  // resolve imagens (faz upload se vier File)
  const { imageSquareUrl, candidateWideUrl } = await resolveImages({
    square,
    wide,
    autoResize,
    upload: async (f, type) => uploadLogo(f, { appId: app?.id ?? undefined, type }),
  });
  if (!imageSquareUrl && !candidateWideUrl) {
    throw new Error("Envie ao menos uma imagem (quadrada ou widescreen).");
  }

  const finalWide   = candidateWideUrl ?? app?.imageWideUrl ?? null;
  const finalSquare = imageSquareUrl ?? app?.imageSquareUrl ?? app?.logoUrl ?? null;
  const logoUrl     = finalWide ?? finalSquare ?? null;

  // publica no back
  await publish(refForApi, {
    status: NEW_STATUS,
    ...(logoUrl     ? { logoUrl } : {}),
    ...(finalSquare ? { imageSquareUrl: finalSquare } : {}),
    ...(finalWide   ? { imageWideUrl: finalWide } : {}),
  });

  // e-mail com imageUrl obrigatória
  const imageUrl = finalWide || finalSquare || app?.imageWideUrl || app?.logoUrl || null;
  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    throw new Error("imageUrl inválida para o e-mail (precisa ser http/https).");
  }
  if (app?.email) {
    try {
      await sendAppReadyEmail({
        to: [app.email],
        subject: `Seu app está pronto • ${app.nome}`,
        from: { name: "Sistema de Apps", address: "no-reply@appsystem.com" },
        data: {
          title: "Seu aplicativo está pronto!",
          app: {
            id: app.id, codigo: app.codigo, nome: app.nome,
            descricao: app.descricao ?? null, status: NEW_STATUS,
            repositorio: app.repositorio ?? null, ambiente: app.ambiente ?? null,
            dominio: app.dominio ?? null, email: app.email ?? null,
            telefone: app.telefone ?? null, valor: app.valor ?? null,
            criadoEm: app.criadoEm,
          },
          imageUrl,
          imageWideUrl: finalWide ?? null,
          imageSquareUrl: finalSquare ?? null,
          cred: cred ?? undefined,
          notes: notes ?? undefined,
        },
      });
    } catch (e) {
      console.warn("[app-ready email] falhou, mas publicação ok:", e);
    }
  }

  await mutate?.();      // revalida dados
  return true;           // <-- modal pode fechar sozinho se usar esse contrato
  }



  const rightActions = useMemo(() => {
    if (!app) return null;
    return (
      <button
        type="button"
        disabled={busy || isPublicado}
        onClick={() => setOpenModal(true)}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm transition ${
          isPublicado
            ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
        title={isPublicado ? "Já está publicado" : "Publicar app"}
      >
        <Rocket size={18} />
        {isPublicado ? "Publicado" : busy ? "Publicando…" : "Publicar app"}
      </button>
    );
  }, [app, busy, isPublicado]);

  return { app, subtitle,mutate, rightActions, openModal, setOpenModal, busy, handleConfirm } as const;
}
