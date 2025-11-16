import MetricCard from "./MetricCard";
import { AppWindow, Wrench, CheckCircle2, Wallet } from "lucide-react";

export type Metrics = {
  totalApps: number;
  emDesenvolvimento: number;
  finalizados: number;
  totalValor: number;
};

const brl = (n: number) =>
  (Number(n) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export default function MetricsBar(m: Metrics) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <MetricCard
        label="Total de Apps"
        value={m.totalApps}
        icon={<AppWindow size={18} />}
        accent="blue"
      />
      <MetricCard
        label="Em Desenvolvimento"
        value={m.emDesenvolvimento}
        icon={<Wrench size={18} />}
        accent="yellow"
      />
      <MetricCard
        label="Finalizados"
        value={m.finalizados}
        icon={<CheckCircle2 size={18} />}
        accent="green"
      />
      <MetricCard
        label="Valor Total"
        value={brl(m.totalValor)}
        icon={<Wallet size={18} />}
        accent="violet"
      />
    </div>
  );
}
