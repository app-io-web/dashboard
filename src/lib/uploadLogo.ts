// src/lib/uploadLogo.ts
import axios from "axios";
import { getAccessToken } from "@/lib/auth";

export async function uploadLogo(
  file: File,
  a?: string | { appId?: string | null; type?: "logo" | "square" | "wide" },
  b?: "logo" | "square" | "wide"
) {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3333";

  let appId: string | undefined;
  let type: "logo" | "square" | "wide" = "logo";

  if (typeof a === "string") {
    appId = a;
    if (b) type = b;
  } else if (a && typeof a === "object") {
    appId = a.appId ?? undefined;
    if (a.type) type = a.type;
  }

  const form = new FormData();
  form.append("file", file);
  if (appId) form.append("appId", appId);
  form.append("fileName", file.name);
  form.append("type", type);

  const token = getAccessToken();

  const { data } = await axios.post(`${baseURL}/upload/logo`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 20000,
  });

  if (!data?.url) throw new Error(data?.message || "Falha no upload.");
  return data.url as string;
}
