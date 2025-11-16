// src/services/email.ts
import { mailer } from "@/lib/http";

export type EmailAddress = string | { name?: string; address: string };

// payload CERTO para o /emails/send do back
type StatusChangePayload = {
  to: EmailAddress | EmailAddress[];
  subject: string;               // subject é top-level
  template: "status-change";
  data: {
    app: string;                 // <-- era appName, TEM QUE SER "app"
    oldStatus: string;
    newStatus: string;
    notes?: string | null;
    appImageUrl?: string | null; // seu template pode ignorar se não usar
    appLink?: string | null;
  };
  from?: EmailAddress;
};

type GenericPayload = {
  to: EmailAddress | EmailAddress[];
  subject: string;
  template: "generic";
  data: any;
  from?: EmailAddress;
};

// o back retorna { ok, accepted, rejected, messageId, envelope }
type SendResponse = {
  ok: boolean;
  accepted: string[];
  rejected: string[];
  messageId?: string | null;
  envelope?: any;
};

export async function sendStatusChangeEmail(p: StatusChangePayload): Promise<SendResponse> {
  const { data } = await mailer.post("/emails/send", p);
  return data as SendResponse;
}

export async function sendGenericEmail(p: GenericPayload): Promise<SendResponse> {
  const { data } = await mailer.post("/emails/send", p);
  return data as SendResponse;
}

/** (opcional) pré-visualizar HTML renderizado do template */
export async function previewTemplate(template: "status-change" | "generic", data: any) {
  const res = await mailer.post("/emails/preview", { template, data });
  return res.data as { html: string };
}
