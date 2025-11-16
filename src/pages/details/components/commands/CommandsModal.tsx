import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import CodeBlock from "../ui/CodeBlock";

// Lista de linguagens suportadas
const LANGUAGES = [
  { value: "bash", label: "Bash" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "csharp", label: "C#" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "github", label: "GitHub Actions (YAML)" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "markdown", label: "Markdown" },
  { value: "plaintext", label: "Texto Simples" },
] as const;

export type CmdGroup = {
  titulo?: string;
  linguagem: string; // nova propriedade
  linhas: string[];
};

type Props = {
  open: boolean;
  initial: any[];
  saving?: boolean;
  onClose: () => void;
  onSave: (next: CmdGroup[]) => Promise<void> | void;
};

// ---- helpers ----
function pickLine(x: unknown): string {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") {
    const a = x as any;
    return (a.linha ?? a.line ?? "") as string;
  }
  return "";
}

function normalize(input: any): CmdGroup[] {
  if (!Array.isArray(input)) return [];
  return input.map((g: any) => ({
    titulo: g?.titulo ?? "",
    linguagem: g?.linguagem ?? "bash", // padrão
    linhas: Array.isArray(g?.linhas) ? g.linhas.map(pickLine).filter(Boolean) : [],
  }));
}
// ----------------------------------------

export default function CommandsModal({ open, initial, saving, onClose, onSave }: Props) {
  const normalized = useMemo(() => normalize(initial), [initial]);
  const [groups, setGroups] = useState<CmdGroup[]>(normalized);

  useEffect(() => {
    if (open) setGroups(normalized);
  }, [open, normalized]);

  function setGroup(i: number, g: CmdGroup) {
    setGroups((prev) => prev.map((it, idx) => (idx === i ? g : it)));
  }

  function removeGroup(i: number) {
    setGroups((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title="Editar Comandos"
      maxWidthClass="max-w-4xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50 disabled:opacity-50"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              await onSave(groups);
              onClose();
            }}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {groups.map((g, idx) => {
          const code = g.linhas.join("\n");

          return (
            <div key={idx} className="rounded-lg border border-slate-200 p-4 bg-slate-50">
              {/* Título + Linguagem + Remover */}
              <div className="mb-3 flex flex-col sm:flex-row gap-2">
                <input
                  className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
                  placeholder="Título do grupo (ex: Deploy)"
                  value={g.titulo ?? ""}
                  onChange={(e) => setGroup(idx, { ...g, titulo: e.target.value })}
                  disabled={saving}
                />

                <select
                  value={g.linguagem}
                  onChange={(e) => setGroup(idx, { ...g, linguagem: e.target.value })}
                  disabled={saving}
                  className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => removeGroup(idx)}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-sm text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                  disabled={saving}
                >
                  <Trash2 size={16} />
                  Remover
                </button>
              </div>

              {/* Editor + Pré-visualização */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Comandos (uma linha por comando)
                  </label>
                  <textarea
                    className="min-h-[140px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
                    placeholder="npm run build&#10;docker build . -t app"
                    value={code}
                    onChange={(e) =>
                      setGroup(idx, {
                        ...g,
                        linhas: e.target.value
                          .replace(/\r\n/g, "\n")
                          .split("\n")
                          .filter((line) => line.trim() !== ""),
                      })
                    }
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Pré-visualização
                  </label>
                  <div className="rounded-md border border-slate-200 bg-gray-900 p-0 overflow-hidden">
                    <CodeBlock
                      text={code || "# Nenhum comando"}
                      language={g.linguagem}
                      className="text-xs"
                    />

                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Adicionar novo grupo */}
        <div className="flex justify-center">
          <button
            onClick={() =>
              setGroups((prev) => [
                ...prev,
                { titulo: "Novo grupo", linguagem: "bash", linhas: [""] },
              ])
            }
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            disabled={saving}
          >
            <Plus size={18} />
            Adicionar Grupo
          </button>
        </div>
      </div>
    </Modal>
  );
}