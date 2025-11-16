// pages/flow/components/Sidebar.tsx
import { useState } from "react";
import {
  Workflow,
  GitFork,
  Database,
  Globe2,
  MessagesSquare,
  ChevronDown,
  Share2, // 👈 novo ícone para Subfluxo
} from "lucide-react";

type Props = { onAddNode: (type: string) => void };

const MAIN_BLOCKS = [
  { type: "step", label: "Step", icon: Workflow },
  { type: "decision", label: "Decision", icon: GitFork },
  { type: "callFlow", label: "Subfluxo", icon: Share2 }, // 👈 novo bloco principal
] as const;

const STEP_SUBBLOCKS = [
  { type: "step:database", label: "Banco de dados", icon: Database },
  { type: "step:request", label: "Requisição", icon: Globe2 },
  { type: "step:external", label: "Comunicação externa", icon: MessagesSquare },
] as const;

function draggablePayload(type: string) {
  // Mantém compat com handlers existentes: envia o type como string.
  return type;
}

export default function Sidebar({ onAddNode }: Props) {
  const [openStep, setOpenStep] = useState(true);

  // Detecta ambiente touch (mobile/tablet)
  const isTouch =
    typeof window !== "undefined" && "ontouchstart" in window;

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData(
      "application/reactflow",
      draggablePayload(nodeType)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const BlockItem = ({
    type,
    label,
    Icon,
    hint,
  }: {
    type: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    hint?: string;
  }) => (
    <div
      draggable={!isTouch} // 👉 só arrasta em desktop
      onDragStart={
        isTouch ? undefined : (e) => onDragStart(e, type)
      }
      // Mobile + Desktop: um clique/tap já adiciona o node
      onClick={() => onAddNode(type)}
      // Mantém o double-click pra quem curte no desktop
      onDoubleClick={() => onAddNode(type)}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer select-none border border-gray-200"
      title={
        hint ??
        (isTouch
          ? "Toque para inserir este bloco"
          : "Arraste para o canvas ou clique para inserir")
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onAddNode(type);
      }}
    >
      <Icon className="h-5 w-5 shrink-0 text-gray-700" />
      <span className="font-medium text-gray-800">{label}</span>
    </div>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white pb-3">
        <h2 className="text-lg font-bold">Blocos</h2>
        <p className="text-xs pb-2 text-gray-500">
          {isTouch
            ? "Toque em um bloco para adicioná-lo ao fluxo"
            : "Duplo clique ou arraste pro canvas"}
        </p>
        <p className="text-xs text-blue-500">
          Os Nodes são apenas demonstração de como vai funcionar o fluxo do seu app
        </p>
      </div>

      <div className="space-y-2">
        {/* Principais */}
        {MAIN_BLOCKS.map((b) => (
          <BlockItem
            key={b.type}
            type={b.type}
            label={b.label}
            Icon={b.icon}
            hint={
              b.type === "callFlow"
                ? "Chama outro fluxo do mesmo app (subfluxo)"
                : b.type === "decision"
                ? "Nó de decisão (Sim/Não)"
                : "Step genérico"
            }
          />
        ))}

        {/* Submenu do Step */}
        <div className="rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setOpenStep((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
            aria-expanded={openStep}
          >
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">
                Step – padrões
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                openStep ? "rotate-180" : ""
              }`}
            />
          </button>

          {openStep && (
            <div className="p-2 pt-0 space-y-2">
              {STEP_SUBBLOCKS.map((sb) => (
                <BlockItem
                  key={sb.type}
                  type={sb.type}
                  label={sb.label}
                  Icon={sb.icon}
                  hint="Variante de Step"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
