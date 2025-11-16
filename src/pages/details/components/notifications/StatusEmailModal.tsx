// src/pages/details/components/notifications/StatusEmailModal.tsx
import { useMemo, useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { Mail } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSend: (to: string, subject: string, message: string) => Promise<void> | void;
  defaultTo?: string;
  appName: string;
  previousStatus: string;
  newStatus: string;
  saving?: boolean;
};

export default function StatusEmailModal({
  open,
  onClose,
  onSend,
  defaultTo,
  appName,
  previousStatus,
  newStatus,
  saving,
}: Props) {
  const templates = useMemo(() => {
    const subject = `Atualização de status do app: ${appName}`;
    const message =
      `Olá,\n\n` +
      `O status do aplicativo **${appName}** foi alterado de **${previousStatus}** para **${newStatus}**.\n\n` +
      `Se você não reconhece esta alteração, responda este e-mail.\n\n` +
      `— Equipe de Plataforma`;
    return { subject, message };
  }, [appName, previousStatus, newStatus]);

  const [to, setTo] = useState(defaultTo ?? "");
  const [subject, setSubject] = useState(templates.subject);
  const [message, setMessage] = useState(templates.message);

  // quando o template ou defaultTo mudarem, reflita nos inputs (sem “colar” valores velhos)
  useEffect(() => {
    setSubject(templates.subject);
    setMessage(templates.message);
  }, [templates.subject, templates.message]);

  useEffect(() => {
    setTo(defaultTo ?? "");
  }, [defaultTo]);

  // permite múltiplos destinatários separados por vírgula/; (validação leve)
  const toIsEmpty = to.split(/[;,]/).map(s => s.trim()).filter(Boolean).length === 0;

  return (
    <Modal
      open={open}
      title="Notificar alteração de status"
      icon={<Mail className="text-blue-600" />}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-3 py-2 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={() => onSend(to, subject, message)}
            disabled={saving || toIsEmpty}
            title={toIsEmpty ? "Informe ao menos um destinatário" : ""}
          >
            {saving ? "Enviando..." : "Enviar"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Para</label>
          <input
            type="text"
            placeholder="dono@empresa.com.br, responsavel@dominio.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
          <p className="text-xs text-slate-500 mt-1">Separe múltiplos e-mails por vírgula ou ponto e vírgula.</p>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Assunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Mensagem</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full min-h-[160px] rounded-lg border border-slate-200 px-3 py-2"
          />
          <p className="text-xs text-slate-500 mt-1">Aceita **negrito** e quebras de linha; converteremos para HTML.</p>
        </div>
      </div>
    </Modal>
  );
}
