import { Rocket } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  published?: boolean;
  busy?: boolean;
};

export default function RightActions({ published, busy, ...btn }: Props) {
  return (
    <button
      type="button"
      disabled={busy || published}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm transition ${
        published
          ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
      title={published ? "Já está publicado" : "Publicar app"}
      {...btn}
    >
      <Rocket size={18} />
      {published ? "Publicado" : busy ? "Publicando…" : "Publicar app"}
    </button>
  );
}
