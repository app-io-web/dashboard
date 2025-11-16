// src/hooks/useNotifyStatus.ts
import { mail } from "@/lib/http";
import { normalizeAppForEmail } from "@/utils/email";
import type { AppDetails } from "../types";

type NotifyArgs = {
  to: string | string[];
  subject?: string;
  oldStatus: string;
  newStatus: string;
  notes?: string;
  app: AppDetails;
};

export function useNotifyStatus() {
  async function notify(args: NotifyArgs) {
    const to = Array.isArray(args.to) ? args.to.filter(Boolean) : [args.to].filter(Boolean);
    if (!to.length) throw new Error("Destinatário obrigatório");

    const subject = args.subject ?? `Atualização de status do app: ${args.app.nome || "App"}`;
    const app = normalizeAppForEmail(args.app, args.newStatus);

    // → chama o EMAIL-SERVER (:4008)
    await mail.post("/emails/status", {
      to,
      subject,
      oldStatus: args.oldStatus,
      newStatus: args.newStatus,
      notes: args.notes,
      app,
    });
  }

  return { notify };
}
