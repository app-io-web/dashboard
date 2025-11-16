// src/components/flow/FlowGrid.tsx
import FlowCard from "./FlowCard";
// ⬇️ tipo-only import
import type { Flow, AppItem } from "../../pages/flow/hooks/useFlows";

type Props = {
  flows: Flow[];
  flowApps: Record<string, AppItem | null>;
  loadingAppMap: Record<string, boolean>;
  empresaId: string;
};

export default function FlowGrid({ flows, flowApps, loadingAppMap, empresaId }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
      {flows.map((flow) => (
        <FlowCard
          key={flow.id}
          flow={flow}
          app={flowApps[flow.id] ?? null}
          loadingApp={loadingAppMap[flow.id] ?? false}
          empresaId={empresaId}
        />
      ))}
    </div>
  );
}
