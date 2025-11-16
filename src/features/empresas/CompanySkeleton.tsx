// src/features/empresas/CompanySkeleton.tsx
export default function CompanySkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100" />
        <div className="flex-1 min-w-0">
          <div className="h-5 w-48 bg-slate-100 rounded" />
          <div className="mt-2 h-4 w-32 bg-slate-100 rounded" />
          <div className="mt-3 flex gap-2">
            <div className="h-5 w-24 bg-slate-100 rounded" />
            <div className="h-5 w-20 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
