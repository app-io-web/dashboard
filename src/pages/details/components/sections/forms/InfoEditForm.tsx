import { Mail } from "lucide-react";
import { useId } from "react";
import type { AppDetails, AppStatus } from "../../../types";

export const STATUS_OPTIONS: AppStatus[] = [
  "Em planejamento",
  "Em estruturação",
  "Em desenvolvimento",
  "Em testes",
  "Homologação",
  "Em produção",
  "Manutenção",
  "Pausado",
  "Descontinuado",
];

type Props = {
  value: AppDetails;
  onChange: (patch: Partial<AppDetails>) => void;
  originalStatus: AppStatus;
  showNotifyButton?: boolean;
  onOpenNotify?: () => void;
};

export default function InfoEditForm({
  value,
  onChange,
  originalStatus,
  showNotifyButton,
  onOpenNotify,
}: Props) {
  const statusId = useId();

  return (
    <div className="space-y-4">

      <div>
        <label htmlFor={statusId} className="block text-sm text-slate-600 mb-1">
          Status
        </label>
        <div className="flex items-center gap-2">
          <select
            id={statusId}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={value.status || STATUS_OPTIONS[0]}
            onChange={(e) => onChange({ status: e.target.value as AppStatus })}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {showNotifyButton && value.status !== originalStatus && (
            <button
              type="button"
              onClick={onOpenNotify}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 px-2.5 py-2 hover:bg-slate-50"
              title="Notificar por e-mail sobre a troca de status"
            >
              <Mail size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
