// src/pages/details/utils/images.ts
export type ResizeableSquare = { file?: File; url?: string };
export type ResizeableWide   = { file?: File; url?: string };

export async function resizeImageTo(file: File, width: number, height: number): Promise<File> {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  const mime = file.type.includes("png") ? "image/png" : "image/jpeg";
  const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), mime, 0.92)!);

  return new File([blob], file.name, { type: blob.type });
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
