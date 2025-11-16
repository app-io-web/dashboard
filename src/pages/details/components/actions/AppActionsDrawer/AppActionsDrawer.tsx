import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { X, Save, Shield, Trash, Workflow } from "lucide-react";

import { ImportantUrlsSection } from "./sections/ImportantUrlsSection";
import { AdminCredSection } from "./sections/AdminCredSection";
import { ImageEditorSection } from "./sections/ImageEditorSection";
import DeleteAppModal from "../../modals/DeleteAppModal";
import { toast } from "sonner";
import { api } from "@/lib/http";
import { useNavigate } from "react-router-dom";

import type { AdminCred, ImportantUrl, DrawerImages } from "./types";
import { uuid, normalizeUrl } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  empresaId?: string; // 👈 já existia, agora vamos usar de verdade

  appId?: string;
  initialUrls?: ImportantUrl[];
  initialCred?: Partial<AdminCred>;
  initialImages?: DrawerImages;

  onSaveAll?: (payload: {
    urls: ImportantUrl[];
    cred: AdminCred | null;
    images: {
      square: { file?: File; url?: string } | null;
      wide: { file?: File; url?: string } | null;
      autoResize?: boolean;
    } | null;
  }) => Promise<void> | void;

  onSaveUrls?: (urls: ImportantUrl[]) => Promise<void> | void;
  onSaveCred?: (cred: AdminCred | null) => Promise<void> | void;
  onSaveImages?: (images: {
    square: { file?: File; url?: string } | null;
    wide: { file?: File; url?: string } | null;
    autoResize?: boolean;
  } | null) => Promise<void> | void;

  onSaved?: (payload: { urls: ImportantUrl[]; cred: AdminCred | null }) => void;

  onRefresh?: () => Promise<{
    urls: ImportantUrl[];
    cred: Partial<AdminCred> | null;
    images?: DrawerImages | null;
  } | void>;

  onAfterSave?: () => Promise<void> | void;

  saving?: boolean;
  appName?: string;
};

type UrlRow = ImportantUrl & { editing?: boolean };

// 👇 tipo simples pros workflows desse app
type WorkflowSummary = {
  id: string;
  titulo: string;
  status?: string | null;
};

function sameImages(a: DrawerImages, b: DrawerImages) {
  return (
    (a?.imageSquareUrl ?? null) === (b?.imageSquareUrl ?? null) &&
    (a?.imageWideUrl ?? null) === (b?.imageWideUrl ?? null) &&
    (a as any)?.logoUrl === (b as any)?.logoUrl
  );
}

export default function AppActionsDrawer({
  open,
  onClose,
  empresaId,
  appId,
  initialUrls = [],
  initialCred,
  initialImages,
  onSaveAll,
  onSaveUrls,
  onSaveCred,
  onSaveImages,
  onSaved,
  onRefresh,
  onAfterSave,
  saving,
  appName,
}: Props) {
  // ---------------- state central ----------------
  const [urls, setUrls] = useState<UrlRow[]>([]);
  const [credKind, setCredKind] = useState<AdminCred["kind"]>(
    initialCred?.kind === "tempPassword" ? "tempPassword" : "setPasswordUrl"
  );
  const [loginEmail, setLoginEmail] = useState(initialCred?.loginEmail ?? "");
  const [passwordUrl, setPasswordUrl] = useState(
  initialCred?.kind === "setPasswordUrl" ? initialCred?.setPasswordUrl ?? "" : ""
);
  const [tempPassword, setTempPassword] = useState(
    initialCred?.kind === "tempPassword" ? initialCred.tempPassword ?? "" : ""
  );

  const [images, setImages] = useState<DrawerImages>({
    imageSquareUrl: initialImages?.imageSquareUrl ?? null,
    imageWideUrl: initialImages?.imageWideUrl ?? null,
    // @ts-expect-error campo opcional em alguns projetos
    logoUrl: (initialImages as any)?.logoUrl ?? null,
  });

  // 🔹 estado de workflow
  const [wfLoading, setWfLoading] = useState(false);
  const [wfList, setWfList] = useState<WorkflowSummary[] | null>(null);
  const [wfListOpen, setWfListOpen] = useState(false);

  // ref para FILEs
  const imageFilesRef = useRef<{
    squareFile: File | null;
    wideFile: File | null;
    autoResize?: boolean;
  }>({ squareFile: null, wideFile: null, autoResize: true });

  const handleImagesChange = useCallback(
    (next: any) => {
      const nextUrls: DrawerImages = {
        imageSquareUrl: next?.imageSquareUrl ?? null,
        imageWideUrl: next?.imageWideUrl ?? null,
        // @ts-expect-error compat
        logoUrl: next?.logoUrl ?? (images as any)?.logoUrl ?? null,
      };
      setImages(prev => (sameImages(prev, nextUrls) ? prev : nextUrls));

      imageFilesRef.current.squareFile = next?.squareFile ?? null;
      imageFilesRef.current.wideFile = next?.wideFile ?? null;
      imageFilesRef.current.autoResize = !!next?.autoResize;
    },
    [images]
  );

  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteApp() {
    try {
      setDeleting(true);
      const id = appId?.trim();
      if (!id) throw new Error("App sem identificador (id).");

      await api.patch(`/apps/${encodeURIComponent(id)}/delete`);
      toast.success(`Aplicativo "${appName ?? "App"}" excluído com sucesso.`);
      setDeleteOpen(false);
      onClose();
      navigate("/apps");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Erro ao excluir aplicativo.");
    } finally {
      setDeleting(false);
    }
  }

  // já existia: abre a página de listagem de fluxos
  function goToFlows() {
    const params = new URLSearchParams();

    if (empresaId) params.set("empresaId", empresaId);
    if (appId) params.set("appId", appId);
    if (appName) params.set("q", appName);

    const qs = params.toString();
    navigate(qs ? `/flows?${qs}` : "/flows");
  }

  // garante/cria 1 workflow e navega pra ele
  async function goToWorkflowEnsure() {
    if (!appId) return toast.error("Sem ID do app.");
    try {
      setWfLoading(true);
      const { data } = await api.post(
        `/apps/${encodeURIComponent(appId)}/workflows/ensure`,
        {}
      );
      const wfId = data?.id;
      if (!wfId) throw new Error("Falha ao garantir workflow.");

      const params = new URLSearchParams();
      if (empresaId) params.set("empresaId", empresaId);

      const qs = params.toString();
      navigate(qs ? `/flows/${wfId}?${qs}` : `/flows/${wfId}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Erro ao abrir workflow.");
    } finally {
      setWfLoading(false);
    }
  }

  // NOVO: click do botão Workflow
  async function handleWorkflowButtonClick() {
    if (!appId) {
      toast.error("App sem ID, não dá pra carregar workflows.");
      return;
    }

    // se já carregou uma vez, só abre/fecha o dropdown
    if (wfList && wfList.length > 0) {
      setWfListOpen(prev => !prev);
      return;
    }

    try {
      setWfLoading(true);

      // 🔹 AGORA CHAMA A ROTA QUE EXISTE NO BACK
      const { data } = await api.get(
        `/apps/${encodeURIComponent(appId)}/flows`
      );

      const flowsRaw = Array.isArray(data?.flows) ? data.flows : [];

      if (flowsRaw.length === 0) {
        // nenhum flow ainda → mantém comportamento de ensure
        await goToWorkflowEnsure();
        return;
      }

      const list: WorkflowSummary[] = flowsRaw.map((f: any) => ({
        id: f.id,
        titulo: f.titulo ?? f.nome ?? "",
        status: f.status ?? null,
      }));

      setWfList(list);
      setWfListOpen(true);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Erro ao buscar workflows deste aplicativo."
      );
    } finally {
      setWfLoading(false);
    }
  }

  function handleSelectWorkflow(wfId: string) {
    setWfListOpen(false);
    onClose(); // opcional, mas costuma fazer sentido fechar o drawer

    const params = new URLSearchParams();
    if (empresaId) params.set("empresaId", empresaId);

    const qs = params.toString();
    navigate(qs ? `/flow/${wfId}?${qs}` : `/flow/${wfId}`);
  }

  useEffect(() => {
    if (!open) return;
    let alive = true;

    (async () => {
      try {
        const fresh = await onRefresh?.();
        if (!alive) return;

        if (fresh) {
          setUrls((fresh.urls ?? []).map(u => ({ ...u, id: u.id || uuid(), editing: false })));

          const c = fresh.cred ?? null;
          if (c) {
            setCredKind(c.kind === "tempPassword" ? "tempPassword" : "setPasswordUrl");
            setLoginEmail(c.loginEmail ?? "");
            setPasswordUrl((c as any).setPasswordUrl ?? "");
            setTempPassword((c as any).tempPassword ?? "");
          } else {
            setLoginEmail("");
            setPasswordUrl("");   // ✅ agora usa o setter certo
            setTempPassword("");
          }

          const im: DrawerImages = {
            imageSquareUrl: fresh.images?.imageSquareUrl ?? null,
            imageWideUrl: fresh.images?.imageWideUrl ?? null,
            // @ts-expect-error compat
            logoUrl: (fresh.images as any)?.logoUrl ?? null,
          };
          setImages(prev => (sameImages(prev, im) ? prev : im));
          return;
        }

        // fallback inicial
        setUrls((initialUrls ?? []).map(u => ({ ...u, id: u.id || uuid(), editing: false })));
        setCredKind(initialCred?.kind === "tempPassword" ? "tempPassword" : "setPasswordUrl");
        setLoginEmail(initialCred?.loginEmail ?? "");
        setPasswordUrl(
          initialCred?.kind === "setPasswordUrl" ? initialCred?.setPasswordUrl ?? "" : ""
        );
        setTempPassword(
          initialCred?.kind === "tempPassword" ? initialCred?.tempPassword ?? "" : ""
        );

        const im2: DrawerImages = {
          imageSquareUrl: initialImages?.imageSquareUrl ?? null,
          imageWideUrl: initialImages?.imageWideUrl ?? null,
          // @ts-expect-error compat
          logoUrl: (initialImages as any)?.logoUrl ?? null,
        };
        setImages(prev => (sameImages(prev, im2) ? prev : im2));
      } catch {
        if (!alive) return;

        setUrls((initialUrls ?? []).map(u => ({ ...u, id: u.id || uuid(), editing: false })));
        setCredKind(initialCred?.kind === "tempPassword" ? "tempPassword" : "setPasswordUrl");
        setLoginEmail(initialCred?.loginEmail ?? "");
        setPasswordUrl(
          initialCred?.kind === "setPasswordUrl" ? initialCred?.setPasswordUrl ?? "" : ""
        );
        setTempPassword(
          initialCred?.kind === "tempPassword" ? initialCred?.tempPassword ?? "" : ""
        );

        const im3: DrawerImages = {
          imageSquareUrl: initialImages?.imageSquareUrl ?? null,
          imageWideUrl: initialImages?.imageWideUrl ?? null,
          // @ts-expect-error compat
          logoUrl: (initialImages as any)?.logoUrl ?? null,
        };
        setImages(prev => (sameImages(prev, im3) ? prev : im3));
      }
    })();

    return () => {
      alive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);


  const cred: AdminCred | null = useMemo(() => {
      if (!loginEmail.trim()) return null;

      if (credKind === "setPasswordUrl" && passwordUrl.trim()) {
        return {
          kind: "setPasswordUrl",
          loginEmail: loginEmail.trim(),
          setPasswordUrl: passwordUrl.trim(),
        };
      }

      if (credKind === "tempPassword" && tempPassword.trim()) {
        return {
          kind: "tempPassword",
          loginEmail: loginEmail.trim(),
          tempPassword: tempPassword.trim(),
        };
      }

      return null;
    }, [credKind, loginEmail, passwordUrl, tempPassword]);



  async function handleSaveAll() {
    const cleaned = urls.map(u => ({
      id: u.id,
      label: u.label.trim(),
      url: normalizeUrl(u.url.trim()),
    }));

    const imagesPayload = {
      square: images.imageSquareUrl
        ? { url: images.imageSquareUrl }
        : imageFilesRef.current.squareFile
        ? { file: imageFilesRef.current.squareFile }
        : null,
      wide: images.imageWideUrl
        ? { url: images.imageWideUrl }
        : imageFilesRef.current.wideFile
        ? { file: imageFilesRef.current.wideFile }
        : null,
      autoResize: imageFilesRef.current.autoResize,
    } as const;

    if (onSaveAll) {
      await onSaveAll({ urls: cleaned, cred, images: imagesPayload });
    } else {
      if (onSaveUrls) await onSaveUrls(cleaned);
      if (onSaveCred) await onSaveCred(cred);
      if (onSaveImages) await onSaveImages(imagesPayload);
    }


    onSaved?.({ urls: cleaned, cred });
    await onAfterSave?.();
    onClose();
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-white text-slate-900 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-600" size={20} />
            <h2 className="text-lg font-semibold">
              Ações do App {appName ? `• ${appName}` : ""}
            </h2>

            {/* Botão + dropdown de Workflows */}
            <div className="relative">
              <button
                type="button"
                onClick={handleWorkflowButtonClick}
                className="ml-2 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                title="Ver workflows deste app"
                disabled={wfLoading}
              >
                <Workflow size={14} />
                {wfLoading ? "Carregando..." : "Workflow"}
              </button>

              {wfListOpen && wfList && wfList.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl z-20">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b">
                    Workflows deste app
                  </div>
                  <ul className="max-h-64 overflow-y-auto">
                    {wfList.map(wf => (
                      <li key={wf.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectWorkflow(wf.id)}
                          className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-xs hover:bg-slate-50"
                        >
                          <span className="font-medium text-slate-800 truncate">
                            {wf.titulo || "Sem título"}
                          </span>
                          {wf.status && (
                            <span className="text-[10px] uppercase tracking-wide text-slate-500">
                              {wf.status}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t px-3 py-2">
                    <button
                      type="button"
                      onClick={goToFlows}
                      className="w-full text-[11px] text-slate-600 hover:text-slate-900 text-left"
                    >
                      Ver todos os fluxos
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            className="rounded-lg p-2 hover:bg-slate-100"
            onClick={onClose}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-5">
          <ImportantUrlsSection urls={urls} setUrls={setUrls} />

          <AdminCredSection
            credKind={credKind}
            setCredKind={setCredKind}
            loginEmail={loginEmail}
            setLoginEmail={setLoginEmail}
            passwordUrl={passwordUrl}
            setPasswordUrl={setPasswordUrl}
            tempPassword={tempPassword}
            setTempPassword={setTempPassword}
          />


          <ImageEditorSection initial={images} onChange={handleImagesChange} />
        </div>

        {/* Seção de exclusão */}
        <div className="mt-8 border-t border-slate-200 pt-6 pb-8 px-5">
          <h3 className="text-sm font-semibold text-red-700 mb-2">Excluir aplicativo</h3>
          <p className="text-sm text-slate-600 mb-3">
            Essa ação remove o app da listagem. Confirme pelo nome do app no modal.
          </p>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-100 active:bg-red-200 transition-colors shadow-sm"
          >
            <Trash size={16} />
            Excluir aplicativo
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
            disabled={!!saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={!!saving}
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>

        <DeleteAppModal
          open={deleteOpen}
          appName={appName}
          loading={deleting}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteApp}
        />
      </aside>
    </div>
  );
}
