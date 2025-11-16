// src/pages/details/components/sections/InfoSection.tsx
import { Info, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Card from "../Card";
import Badge from "../ui/Badge";
import EditModal from "../ui/EditModal";
import type { AppDetails } from "../../types";
import { useSaveApp } from "../../hooks/useSaveApp";
import InfoEditForm, { STATUS_OPTIONS } from "./forms/InfoEditForm";
import { useNotifyStatus } from "../../hooks/useNotifyStatus";
import { formatBRL } from "@/utils/money";
import { useActivityLogger } from "../../hooks/useActivityLogger";
import { normalizeAppForEmail } from "@/utils/email";

function statusLabel(s: unknown): string {
  if (typeof s === "string") return s;
  if (s && typeof s === "object") {
    const any = s as any;
    return (
      (typeof any.label === "string" && any.label) ||
      (typeof any.text === "string" && any.text) ||
      (typeof any.name === "string" && any.name) ||
      (typeof any.value === "string" && any.value) ||
      "—"
    );
  }
  return "—";
}

function coerceNullableString(v: unknown): string | null {
  if (v == null) return null;
  return String(v);
}

function coerceNullableNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toast(msg: string) {
  // shadcn/ui, sonner, ou seu provider custom? Tenta alguns padrões comuns:
  // @ts-expect-error – existe em runtime?
  if (window?.toast?.success) window.toast.success(msg);
  // @ts-expect-error – sonner?
  else if (window?.sonner?.toast) window.sonner.toast(msg);
  else if (window?.dispatchEvent) {
    window.dispatchEvent(
      new CustomEvent("app:toast", {
        detail: { type: "success", message: msg },
      }),
    );
    console.info("[toast]", msg);
  } else {
    console.info("[toast]", msg);
  }
}

type Props = { app: AppDetails };

export default function InfoSection({ app }: Props) {
  const [localApp, setLocalApp] = useState<AppDetails>({
    ...app,
    atividades: app.atividades ?? [],
  });

  const [open, setOpen] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  const [askEmail, setAskEmail] = useState(false);

  // 🔹 NOVO: modal só pro nome
  const [nameOpen, setNameOpen] = useState(false);
  const [nameInput, setNameInput] = useState<string>(app.nome ?? "");

  const prevStatusRef = useRef<string>(statusLabel(app.status));
  const nextStatusRef = useRef<string>(statusLabel(app.status));

  const { notify, loading: notifying } = useNotifyStatus();
  const { log } = useActivityLogger({
    app: localApp,
    onAfterSave: (updated) => setLocalApp(updated as AppDetails),
  });

  const { save, saving } = useSaveApp((localApp as any).Id ?? localApp.id, {
    onSuccess: async (updated) => {
      const safe = (updated as AppDetails) ?? localApp;
      setLocalApp(safe);
      setOpen(false);

      if (statusChanged) {
        await autoNotifyStatusEmail({
          appNow: safe,
          prevStatus: prevStatusRef.current,
          nextStatus: nextStatusRef.current,
        });
        setStatusChanged(false);
      }
    },
  });

  useEffect(() => {
    setLocalApp((prev) => ({
      ...prev,
      ...app,
      atividades: app.atividades ?? [],
    }));
    const cur = statusLabel(app.status);
    prevStatusRef.current = cur;
    nextStatusRef.current = cur;
    setStatusChanged(false);

    // 🔹 SINCRONIZA O INPUT DO NOME TAMBÉM
    setNameInput(app.nome ?? "");
  }, [app]);

  const prevStatusStr = statusLabel(localApp.status);

  function buildPatchFromLocal(app: AppDetails, localApp: AppDetails) {
    const patch: {
      status?: string;
      valor?: number | null;
      descricao?: string | null;
    } = {};

    const localStatusStr = statusLabel(localApp.status);
    const appStatusStr = statusLabel(app.status);

    if (localStatusStr !== appStatusStr) patch.status = localStatusStr;

    const localValor = coerceNullableNumber(localApp.valor ?? null);
    const appValor = coerceNullableNumber(app.valor ?? null);
    if (localValor !== appValor) patch.valor = localValor;

    const localDesc = coerceNullableString(localApp.descricao ?? null);
    const appDesc = coerceNullableString(app.descricao ?? null);
    if (localDesc !== appDesc) patch.descricao = localDesc;

    return patch;
  }

  async function handleSalvarInfo() {
    const anterior = {
      status: statusLabel(localApp.status),
      descricao: coerceNullableString(localApp.descricao ?? null),
      valor: coerceNullableNumber(localApp.valor ?? null),
    };

    const base = buildPatchFromLocal(app, localApp);

    if (!Object.prototype.hasOwnProperty.call(base, "descricao")) {
      base.descricao = coerceNullableString(localApp.descricao ?? null);
    }
    if (!Object.prototype.hasOwnProperty.call(base, "valor")) {
      base.valor = coerceNullableNumber(localApp.valor ?? null);
    }

    const soBlindagem =
      Object.keys(base).length > 0 &&
      !Object.prototype.hasOwnProperty.call(base, "status") &&
      coerceNullableString(localApp.descricao ?? null) === anterior.descricao &&
      coerceNullableNumber(localApp.valor ?? null) === anterior.valor;

    if (soBlindagem) {
      setOpen(false);
      return;
    }

    const updated = (await save(base)) as AppDetails | undefined;
    const next = updated ?? { ...localApp, ...base };
    setLocalApp(next as AppDetails);

    if (base.status !== undefined && base.status !== anterior.status) {
      await log("status", `Status alterado de "${anterior.status}" para "${base.status}".`, {
        de: anterior.status,
        para: base.status,
      });
    }
    if (typeof base.descricao === "string" && base.descricao !== anterior.descricao) {
      await log("descricao", "Descrição atualizada.", { tamanho: base.descricao.length });
    }
    if (Object.prototype.hasOwnProperty.call(base, "valor") && base.valor !== anterior.valor) {
      await log(
        "outro",
        `Valor do app atualizado para ${base.valor != null ? base.valor : "—"}.`,
        {
          de: anterior.valor,
          para: base.valor,
        },
      );
    }
  }

  // 🔹 NOVO: salvar apenas o nome
  async function handleSalvarNome() {
    const anteriorNome = localApp.nome ?? null;
    const novoNome = nameInput.trim() || null;

    // nada mudou, só fecha
    if (novoNome === anteriorNome) {
      setNameOpen(false);
      return;
    }

    const updated = (await save({ nome: novoNome })) as AppDetails | undefined;
    const safe = updated ?? ({ ...localApp, nome: novoNome } as AppDetails);
    setLocalApp(safe);

    await log(
      "nome",
      `Nome do app alterado de "${anteriorNome ?? "—"}" para "${novoNome ?? "—"}".`,
      {
        de: anteriorNome,
        para: novoNome,
      },
    );

    toast("Nome do app atualizado.");
    setNameOpen(false);
  }

  async function autoNotifyStatusEmail(opts: {
    appNow: AppDetails;
    prevStatus: string;
    nextStatus: string;
  }) {
    const { appNow, prevStatus, nextStatus } = opts;

    const raw = (appNow.email ?? "") as string;
    const to = raw
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (to.length === 0) {
      console.warn(
        "[status-email] Nenhum destinatário encontrado em app.email; notificação não enviada.",
      );
      toast("Status atualizado. Nenhum destinatário configurado para e-mail.");
      return;
    }

    const subject = `Atualização de status do app: ${
      appNow.nome ?? `App #${appNow.id}`
    }`;
    const message =
      `Olá,\n\n` +
      `O status do aplicativo **${
        appNow.nome ?? `App #${appNow.id}`
      }** foi alterado de **${prevStatus}** para **${nextStatus}**.\n\n` +
      `Se você não reconhece esta alteração, responda este e-mail.\n\n` +
      `— Equipe de Plataforma`;

    const preparedApp = normalizeAppForEmail ? normalizeAppForEmail(appNow) : appNow;

    await notify({
      to,
      subject,
      oldStatus: prevStatus,
      newStatus: nextStatus,
      notes: message,
      appImageUrl: (appNow as any)?.imagemUrl ?? null,
      appLink: appNow.dominio ?? null,
      app: preparedApp,
    });

    await log("email", `E-mail enviado para ${to.join(", ")}.`, {
      para: to,
      assunto: subject,
      de: prevStatus,
      paraStatus: nextStatus,
    });

    toast("Notificação enviada com sucesso.");
  }

  function statusColorClass(status: string) {
    switch (status) {
      case "Em planejamento":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "Em estruturação":
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "Em desenvolvimento":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Em testes":
        return "bg-violet-100 text-violet-700 border-violet-200";
      case "Homologação":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Em produção":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Manutenção":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Pausado":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Descontinuado":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  }

  return (
    <>
      <Card
        title="Informações"
        icon={<Info className="text-blue-600" size={20} />}
        className="lg:col-span-2"
        actions={[
          {
            icon: <Pencil size={14} />,
            label: "Editar",
            title: "Editar informações",
            onClick: () => {
              setStatusChanged(false);
              const cur = statusLabel(localApp.status);
              prevStatusRef.current = cur;
              nextStatusRef.current = cur;
              setOpen(true);
            },
          },
        ]}
      >
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Nome</dt>
            <dd className="text-slate-900 font-medium flex items-center gap-2">
              <span>
                {localApp.nome || (
                  <span className="text-slate-400">Ex.: Portal de Cupons</span>
                )}
              </span>

              {/* 🔹 BOTÃOZINHO SÓ DO NOME */}
              <button
                type="button"
                onClick={() => {
                  setNameInput(localApp.nome ?? "");
                  setNameOpen(true);
                }}
                className="inline-flex items-center rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Editar nome do app"
              >
                <Pencil size={14} />
              </button>
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">Status</dt>
            <dd>
              <Badge className={statusColorClass(statusLabel(localApp.status))}>
                {statusLabel(localApp.status) || statusLabel(STATUS_OPTIONS?.[0])}
              </Badge>
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">Valor do App</dt>
            <dd className="text-slate-900 font-medium">
              {localApp.valor != null ? (
                formatBRL(Number(localApp.valor))
              ) : (
                <span className="text-slate-400">Defina o valor</span>
              )}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-slate-500">Descrição</dt>
            <dd className="text-slate-900 whitespace-pre-line">
              {localApp.descricao ||
                "Dashboard para gestão de cupons, integração NocoDB e upload S3/MinIO."}
            </dd>
          </div>
        </dl>
      </Card>

      {/* MODALZÃO DE INFO (status/valor/descrição) */}
      {open && (
        <EditModal
          title="Informações"
          open={open}
          saving={saving || notifying}
          onClose={() => setOpen(false)}
          onSave={async () => {
            await handleSalvarInfo();
          }}
          autoCloseOnSave={false}
          maxWidthClass="max-w-2xl"
        >
          <InfoEditForm
            value={localApp}
            originalStatus={prevStatusStr}
            onChange={(next) => {
              const nextStatusStr = statusLabel(next.status ?? localApp.status);
              if (next.status && nextStatusStr !== prevStatusStr) {
                prevStatusRef.current = prevStatusStr;
                nextStatusRef.current = nextStatusStr;
                setStatusChanged(true);
              } else if (next.status && nextStatusStr === prevStatusStr) {
                setStatusChanged(false);
              }
              setLocalApp((prev) => ({ ...prev, ...next }));
            }}
            showNotifyButton={false}
            onOpenNotify={() => {}}
          />
        </EditModal>
      )}

      {/* 🔹 NOVO: MODAL SÓ DO NOME */}
      {nameOpen && (
        <EditModal
          title="Editar nome do app"
          open={nameOpen}
          saving={saving}
          onClose={() => setNameOpen(false)}
          onSave={handleSalvarNome}
          autoCloseOnSave={false}
          maxWidthClass="max-w-sm"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Nome do app
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex.: Portal de Cupons"
            />
            <p className="text-xs text-slate-400">
              Esse nome aparece na Home, nos e-mails e em outras partes do painel.
            </p>
          </div>
        </EditModal>
      )}
    </>
  );
}
