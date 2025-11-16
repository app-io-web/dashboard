// src/features/flows/components/FlowStepsEditor.tsx
import { useMemo, useState } from "react";
import { Plus, GripVertical, Trash2, CheckCircle2 } from "lucide-react";
import type { FlowStep } from "@/features/flows/types";

export default function FlowStepsEditor({
  value,
  onChange,
}: {
  value: FlowStep[];
  onChange: (steps: FlowStep[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const ordered = useMemo(() => [...value].sort((a, b) => a.order - b.order), [value]);

  function addStep() {
    const next: FlowStep = {
      title: title.trim() || `Passo ${value.length + 1}`,
      description: desc.trim() || "",
      order: value.length ? Math.max(...value.map((s) => s.order)) + 1 : 1,
      done: false,
    };
    onChange([...value, next]);
    setTitle("");
    setDesc("");
  }

  function removeStep(idxOrder: number) {
    const filtered = value.filter((s) => s.order !== idxOrder);
    // reordena sequencialmente
    const re = filtered
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({ ...s, order: i + 1 }));
    onChange(re);
  }

  function move(stepOrder: number, dir: -1 | 1) {
    const idx = ordered.findIndex((s) => s.order === stepOrder);
    const j = idx + dir;
    if (j < 0 || j >= ordered.length) return;
    const swapped = [...ordered];
    [swapped[idx].order, swapped[j].order] = [swapped[j].order, swapped[idx].order];
    // normaliza
    const normalized = swapped
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({ ...s, order: i + 1 }));
    onChange(normalized);
  }

  function toggleDone(order: number) {
    const next = value.map((s) => (s.order === order ? { ...s, done: !s.done } : s));
    onChange(next);
  }

  function editTitle(order: number, v: string) {
    const next = value.map((s) => (s.order === order ? { ...s, title: v } : s));
    onChange(next);
  }
  function editDesc(order: number, v: string) {
    const next = value.map((s) => (s.order === order ? { ...s, description: v } : s));
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {/* Adicionar novo */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do passo"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descrição (opcional)"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={addStep}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            Adicionar passo
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {ordered.map((s) => (
          <div key={s.order} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-start gap-3">
              <GripVertical className="text-slate-400 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    value={s.title}
                    onChange={(e) => editTitle(s.order, e.target.value)}
                    className={
                      "w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 " +
                      (s.done
                        ? "border-green-300 bg-green-50 text-green-800 focus:ring-green-200"
                        : "border-slate-300 bg-white text-slate-900 focus:ring-blue-200")
                    }
                  />
                  <button
                    onClick={() => toggleDone(s.order)}
                    className={
                      "rounded-lg border px-2 py-1 text-xs " +
                      (s.done
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-slate-300 bg-white text-slate-700")
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      {s.done ? "Feito" : "Marcar"}
                    </span>
                  </button>
                </div>
                <textarea
                  value={s.description ?? ""}
                  onChange={(e) => editDesc(s.order, e.target.value)}
                  rows={2}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <button
                    onClick={() => move(s.order, -1)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(s.order, +1)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeStep(s.order)}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-red-700"
                  >
                    <Trash2 size={14} />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {ordered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Nenhum passo. Adicione o primeiro aí em cima.
          </div>
        )}
      </div>
    </div>
  );
}
