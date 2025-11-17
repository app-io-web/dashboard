// src/pages/details/components/Card.tsx
import { ReactNode } from "react";

type Action = {
  label?: string;
  icon?: ReactNode;
  onClick: () => void;
  title?: string;
};

type Props = {
  title: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  actions?: Action[];
};

export default function Card({ title, icon, className, children, actions }: Props) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className ?? ""}`}>
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>

        {actions?.length ? (
          <div className="flex items-center gap-2">
            {actions.map((a, i) => {
              const iconOnly = !a.label;
              return (
                <button
                  key={i}
                  type="button"
                  title={a.title ?? a.label ?? "Ação"}
                  onClick={a.onClick}
                  className={
                    iconOnly
                      ? "inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100"
                      : "inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                  }
                >
                  {a.icon}
                  {a.label && <span>{a.label}</span>}
                </button>
              );
            })}
          </div>
        ) : null}
      </header>

      {children}
    </section>
  );
}
