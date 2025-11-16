// src/components/ToastHost.tsx
import { useEffect, useState } from "react";

type ToastKind = "success" | "error" | "info";
type T = { id: string; message: string; kind: ToastKind; ttl?: number };

export default function ToastHost() {
  const [list, setList] = useState<T[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const any = e as CustomEvent<T>;
      const t = any.detail;
      setList((prev) => [...prev, t]);
      const timeout = t.ttl ?? 3500;
      setTimeout(() => setList((prev) => prev.filter((x) => x.id !== t.id)), timeout);
    };
    window.addEventListener("app:toast", onToast as any);
    return () => window.removeEventListener("app:toast", onToast as any);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {list.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto min-w-[260px] max-w-[360px] rounded-xl px-4 py-3 shadow-lg ring-1",
            t.kind === "success" && "bg-green-50 text-green-900 ring-green-200",
            t.kind === "error" && "bg-red-50 text-red-900 ring-red-200",
            t.kind === "info" && "bg-slate-50 text-slate-900 ring-slate-200",
          ].filter(Boolean).join(" ")}
          role="status"
        >
          <p className="text-sm font-medium">{t.message}</p>
        </div>
      ))}
    </div>
  );
}
