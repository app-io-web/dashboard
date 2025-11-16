// src/pages/details/utils/images.ts
export type ResizeableSquare = { file?: File; url?: string };
export type ResizeableWide   = { file?: File; url?: string };

// mantém tipo/extension, pula GIF e respeita proporção
export async function resizeImageTo(file: File, maxW: number, maxH: number): Promise<File> {
  // se não for imagem, não mexe
  if (!file.type.startsWith("image/")) return file;

  const ext = file.name.split(".").pop()?.toLowerCase();
  const originalMime = file.type || (ext ? `image/${ext}` : "image/jpeg");

  // GIF: NÃO REDIMENSIONA, senão mata animação e ainda corre risco de virar JPG
  if (ext === "gif" || originalMime === "image/gif") {
    return file;
  }

  const url = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });

    const { width, height } = img;

    // já está menor que o alvo → mantém
    if (width <= maxW && height <= maxH) {
      return file;
    }

    const ratio = Math.min(maxW / width, maxH / height);
    const targetW = Math.round(width * ratio);
    const targetH = Math.round(height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, targetW, targetH);

    // mantém o mime original (quando for imagem), senão cai pra PNG
    const targetMime = originalMime.startsWith("image/") ? originalMime : "image/png";

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar blob da imagem"))),
        targetMime,
        targetMime === "image/jpeg" ? 0.9 : 1 // qualidade só mexe em JPEG
      );
    });

    // mantém o MESMO NOME E EXTENSÃO do arquivo original
    return new File([blob], file.name, { type: blob.type || targetMime });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function resolveImages({
  square,
  wide,
  autoResize,
  upload,
}: {
  square: ResizeableSquare | null;
  wide: ResizeableWide | null;
  autoResize?: boolean;
  upload: (file: File, type: "square" | "wide") => Promise<string>;
}): Promise<{ imageSquareUrl: string | null; candidateWideUrl: string | null }> {
  let imageSquareUrl: string | null = null;
  let candidateWideUrl: string | null = null;

  if (square?.url?.trim()) {
    imageSquareUrl = square.url.trim();
  } else if (square?.file) {
    const f = autoResize ? await resizeImageTo(square.file, 1000, 1000) : square.file;
    imageSquareUrl = await upload(f, "square");
  }

  if (wide?.url?.trim()) {
    candidateWideUrl = wide.url.trim();
  } else if (wide?.file) {
    const f = autoResize ? await resizeImageTo(wide.file, 1920, 1080) : wide.file;
    candidateWideUrl = await upload(f, "wide");
  }

  return { imageSquareUrl, candidateWideUrl };
}

