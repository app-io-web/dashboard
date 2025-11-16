import { type ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: "blue" | "yellow" | "green" | "violet" | "slate";
};

const ringByAccent: Record<NonNullable<Props["accent"]>, string> = {
  blue:   "ring-blue-500/20 shadow-blue-500/10",
  yellow: "ring-amber-500/20 shadow-amber-500/10",
  green:  "ring-emerald-500/20 shadow-emerald-500/10",
  violet: "ring-violet-500/20 shadow-violet-500/10",
  slate:  "ring-slate-500/20 shadow-slate-500/10",
};

export default function MetricCard({ label, value, icon, accent = "slate" }: Props) {
  const ring = ringByAccent[accent];
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur
                     ring-1 ${ring} shadow-sm p-4 md:p-5`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">{label}</div>
        {icon && <div className="opacity-70">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl
                      [mask-image:radial-gradient(80%_60%_at_70%_10%,black,transparent)]
                      bg-gradient-to-br from-white/60 via-transparent to-transparent" />
    </div>
  );
}
