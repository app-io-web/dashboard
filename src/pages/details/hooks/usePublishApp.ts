// src/pages/details/hooks/usePublishApp.ts
import { useState } from "react";
import { api } from "@/lib/http";

type ImgType = "logo" | "square" | "wide";

type PublishParams = {
  ref: string;
  appId?: string | null;           // organiza no S3
  status?: string | null;          // se não enviar, o back força "Publicado"

  // Pode mandar URL direta, File ou ambos (URL tem prioridade se vier)
  logoUrl?: string | null;
  logoFile?: File | null;

  imageSquareUrl?: string | null;  // 1000x1000
  squareFile?: File | null;

  imageWideUrl?: string | null;    // capa wide (1920x1080)
  wideFile?: File | null;
};

function isNonEmpty(s?: string | null): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

export function usePublishApp() {
  const [loading, setLoading] = useState(false);

  async function publish(ref: string, body: Record<string, string | undefined>) {
    const safeRef = (ref ?? "").toString().trim();
    if (!safeRef) {
      throw new Error("invalid_ref: ref vazio/indefinido ao publicar");
    }

    setLoading(true);
    try {
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === "string" && v.trim()) clean[k] = v.trim();
      }

      // DEBUG opcional:
      // console.log("[publish] POST /apps/%s/publish payload:", safeRef, clean);

      const { data } = await api.post(`/apps/${encodeURIComponent(safeRef)}/publish`, clean);
      return data?.app ?? data ?? true;
    } finally {
      setLoading(false);
    }
  }

  return { publish, loading };
}
