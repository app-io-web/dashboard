// src/pages/details/hooks/useNotifyAppReady.ts
import { useState } from "react";
import { api } from "@/lib/http";

type EmailAddress = string | { name?: string; address: string };

type CredLink = { loginEmail: string; setPasswordUrl: string; tempPassword?: never };
type CredTemp = { loginEmail: string; tempPassword: string; setPasswordUrl?: never };
export type Cred = CredLink | CredTemp;

export interface AppReadyEmailPayload {
  to: EmailAddress | EmailAddress[];
  subject: string;
  from?: EmailAddress;
  data: {
    title?: string;
    app: any;
    imageSquareUrl?: string | null;
    imageWideUrl?: string | null;
    cred?: Cred;
    notes?: string;
  };
}


// src/pages/details/hooks/useNotifyAppReady.ts
import { useState } from "react";
// troque isso:
// import { mailer } from "@/lib/http";
// por isso:
import { api } from "@/lib/http";

type EmailAddress = string | { name?: string; address: string };

type CredLink = { loginEmail: string; setPasswordUrl: string; tempPassword?: never };
type CredTemp = { loginEmail: string; tempPassword: string; setPasswordUrl?: never };
export type Cred = CredLink | CredTemp;

export interface AppReadyEmailPayload {
  to: EmailAddress | EmailAddress[];
  subject: string;
  from?: EmailAddress;
  data: {
    title?: string;
    app: any;
    imageSquareUrl?: string | null;
    imageWideUrl?: string | null;
    cred?: Cred;
    notes?: string;
  };
}

export function useNotifyAppReady() {
  const [loading, setLoading] = useState(false);

  async function sendAppReadyEmail(payload: AppReadyEmailPayload) {
    setLoading(true);
    try {
      // usa o client com Bearer
      await api.post("/emails/app-ready", payload);
    } finally {
      setLoading(false);
    }
  }

  return { sendAppReadyEmail, loading };
}

