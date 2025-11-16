// src/lib/toast.ts
export type ToastKind = "success" | "error" | "info";

type ToastEventDetail = {
  id: string;
  message: string;
  kind: ToastKind;
  ttl?: number;
};

export function pushToast(message: string, kind: ToastKind = "info", ttl = 3500) {
  const detail: ToastEventDetail = { id: crypto.randomUUID(), message, kind, ttl };
  window.dispatchEvent(new CustomEvent<ToastEventDetail>("app:toast", { detail }));
}
