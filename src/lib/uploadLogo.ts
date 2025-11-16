// src/lib/uploadLogo.ts
import { api } from "@/lib/http";
import { getAccessToken } from "@/lib/auth";

type UploadLogoOpts = {
  appId?: string | null;
  type?: "logo" | "square" | "wide";
};

export async function uploadLogo(file: File, opts: UploadLogoOpts = {}) {
  const form = new FormData();
  form.append("file", file);

  if (opts.appId) form.append("appId", String(opts.appId));
  form.append("fileName", file.name);
  form.append("type", opts.type ?? "logo");

  const token = getAccessToken();

  const { data } = await api.post("/upload/logo", form, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 20000,
  });

  if (!data?.url) {
    throw new Error(data?.message || "Falha no upload.");
  }

  return data.url as string;
}
