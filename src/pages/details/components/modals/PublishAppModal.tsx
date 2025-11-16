import { useState, useRef, useEffect } from "react";
import { X, Upload, Link as LinkIcon, Image as ImageIcon, KeyRound, StickyNote } from "lucide-react";

type Cred =
  | { loginEmail: string; setPasswordUrl: string; tempPassword?: never }
  | { loginEmail: string; tempPassword: string; setPasswordUrl?: never };

type ImgSource = { mode: "upload" | "url"; file: File | null; url: string };

export default function PublishAppModal({
  open,
  onClose,
  saving,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  saving?: boolean;
  onConfirm: (payload: {
    square: { file?: File; url?: string } | null;
    wide: { file?: File; url?: string } | null;
    cred: Cred | null;
    notes?: string;
    autoResize?: boolean;
  }) => Promise<void> | void;
}) {
  const [tab, setTab] = useState<"images" | "access">("images");

  // imagens
  const [square, setSquare] = useState<ImgSource>({ mode: "upload", file: null, url: "" });
  const [wide, setWide] = useState<ImgSource>({ mode: "upload", file: null, url: "" });
  const squareRef = useRef<HTMLInputElement | null>(null);
  const wideRef = useRef<HTMLInputElement | null>(null);
  const [autoResize, setAutoResize] = useState(true);

  // previews controlados (evita vazamento de URL)
  const [previewSquare, setPreviewSquare] = useState("");
  const [previewWide, setPreviewWide] = useState("");

  // 1) helper no topo do componente (perto dos outros hooks)
  function hasImg(src: ImgSource) {
    return (src.mode === "upload" && !!src.file) || (src.mode === "url" && !!src.url.trim());
  }


  useEffect(() => {
    if (square.mode === "upload" && square.file) {
      const url = URL.createObjectURL(square.file);
      setPreviewSquare(url);
      return () => URL.revokeObjectURL(url);
    }
    if (square.mode === "url" && square.url.trim()) {
      setPreviewSquare(square.url.trim());
      return;
    }
    setPreviewSquare("");
  }, [square.mode, square.file, square.url]);

  useEffect(() => {
    if (wide.mode === "upload" && wide.file) {
      const url = URL.createObjectURL(wide.file);
      setPreviewWide(url);
      return () => URL.revokeObjectURL(url);
    }
    if (wide.mode === "url" && wide.url.trim()) {
      setPreviewWide(wide.url.trim());
      return;
    }
    setPreviewWide("");
  }, [wide.mode, wide.file, wide.url]);

  // credenciais
  const [loginEmail, setLoginEmail] = useState("");
  const [credMode, setCredMode] = useState<"link" | "temp">("link");
  const [setPasswordUrl, setSetPasswordUrl] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  // notas
  const [notes, setNotes] = useState("Boas-vindas! Qualquer dúvida, acesse a central de aplicativos!");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setTab("images");
      setSquare({ mode: "upload", file: null, url: "" });
      setWide({ mode: "upload", file: null, url: "" });
      setAutoResize(true);
      setLoginEmail("");
      setCredMode("link");
      setSetPasswordUrl("");
      setTempPassword("");
      setNotes("Boas-vindas! Qualquer dúvida, acesse a central de aplicativos!");
      setError("");
      setPreviewSquare("");
      setPreviewWide("");
    }
  }, [open]);

      // 3) handleConfirm: exigir WIDE e manter a quadrada como opcional
    async function handleConfirm() {
      // exige wide (upload ou URL)
      if (!hasImg(wide)) {
        return setError("Envie a imagem widescreen (1920×1080).");
      }

      // credenciais (igual estava)
      let cred: Cred | null = null;
      if (loginEmail.trim()) {
        if (credMode === "link") {
          if (!setPasswordUrl.trim()) return setError("Informe o link de definição de senha ou mude para senha temporária.");
          cred = { loginEmail: loginEmail.trim(), setPasswordUrl: setPasswordUrl.trim() };
        } else {
          if (!tempPassword.trim()) return setError("Informe a senha temporária ou mude para link de definição de senha.");
          cred = { loginEmail: loginEmail.trim(), tempPassword: tempPassword.trim() };
        }
      }

      await onConfirm({
        // quadrada: opcional
        square:
          square.mode === "upload"
            ? square.file
              ? { file: square.file }
              : null
            : square.url.trim()
            ? { url: square.url.trim() }
            : null,

        // WIDE: obrigatória (já validada acima)
        wide:
          wide.mode === "upload"
            ? { file: wide.file as File }
            : { url: wide.url.trim() },

        cred,
        notes: notes.trim() || undefined,
        autoResize,
      });
    }


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      {/* Painel com altura limitada e layout em coluna */}
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-lg">
        {/* Header fixo */}
        <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} />
            <h2 className="font-semibold text-slate-900">Publicar aplicativo</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4 shrink-0">
          <div className="inline-flex rounded-xl border bg-slate-50 p-1">
            <button
              onClick={() => setTab("images")}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab === "images" ? "bg-white border shadow-sm" : "text-slate-600"}`}
            >
              Imagens
            </button>
            <button
              onClick={() => setTab("access")}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab === "access" ? "bg-white border shadow-sm" : "text-slate-600"}`}
            >
              Credenciais & Notas
            </button>
          </div>
        </div>

        {/* Conteúdo rolável */}
        <div className="px-5 py-4 space-y-5 overflow-y-auto flex-1 min-h-0">
          {tab === "images" ? (
            <>
              <p className="text-sm text-slate-600">
                A imagem <b>widescreen (1920×1080)</b> é <b>obrigatória</b>. 
                A quadrada (1000×1000) é opcional. Ative <b>Auto-redimensionar</b> para ajustar.
              </p>

              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" checked={autoResize} onChange={(e) => setAutoResize(e.target.checked)} />
                <span className="text-sm text-slate-700">Auto-redimensionar (recomendada)</span>
              </label>

              {/* Quadrada */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Imagem quadrada (1000×1000)</span>
                  <div className="flex gap-1">
                    <button
                      className={`px-2 py-1 rounded-lg border text-xs ${square.mode === "upload" ? "bg-emerald-600 text-white" : "bg-white"}`}
                      onClick={() => setSquare((s) => ({ ...s, mode: "upload" }))}
                    >
                      Upload
                    </button>
                    <button
                      className={`px-2 py-1 rounded-lg border text-xs ${square.mode === "url" ? "bg-emerald-600 text-white" : "bg-white"}`}
                      onClick={() => setSquare((s) => ({ ...s, mode: "url" }))}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {square.mode === "upload" ? (
                  <div
                    className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer h-40 grid place-content-center"
                    onClick={() => squareRef.current?.click()}
                  >
                    <Upload className="mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600">Clique ou solte a imagem</p>
                    <input
                      ref={squareRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setSquare((s) => ({ ...s, file: e.target.files?.[0] ?? null }))}
                    />
                    {square.file && <p className="mt-2 text-sm text-emerald-600 truncate">{square.file.name}</p>}
                  </div>
                ) : (
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      className="w-full rounded-xl border px-9 py-2"
                      placeholder="https://cdn.exemplo.com/logo-1000.png"
                      value={square.url}
                      onChange={(e) => setSquare((s) => ({ ...s, url: e.target.value }))}
                    />
                  </div>
                )}

                {previewSquare && (
                  <div className="border rounded-xl p-3">
                    <div className="w-full max-w-full aspect-square">
                      <img src={previewSquare} alt="Preview quadrada" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              {/* Widescreen */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Imagem widescreen (1920×1080)</span>
                  <div className="flex gap-1">
                    <button
                      className={`px-2 py-1 rounded-lg border text-xs ${wide.mode === "upload" ? "bg-emerald-600 text-white" : "bg-white"}`}
                      onClick={() => setWide((s) => ({ ...s, mode: "upload" }))}
                    >
                      Upload
                    </button>
                    <button
                      className={`px-2 py-1 rounded-lg border text-xs ${wide.mode === "url" ? "bg-emerald-600 text-white" : "bg-white"}`}
                      onClick={() => setWide((s) => ({ ...s, mode: "url" }))}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {wide.mode === "upload" ? (
                  <div
                    className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer h-40 grid place-content-center"
                    onClick={() => wideRef.current?.click()}
                  >
                    <Upload className="mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600">Clique ou solte a imagem</p>
                    <input
                      ref={wideRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setWide((s) => ({ ...s, file: e.target.files?.[0] ?? null }))}
                    />
                    {wide.file && <p className="mt-2 text-sm text-emerald-600 truncate">{wide.file.name}</p>}
                  </div>
                ) : (
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      className="w-full rounded-xl border px-9 py-2"
                      placeholder="https://cdn.exemplo.com/banner-1920x1080.jpg"
                      value={wide.url}
                      onChange={(e) => setWide((s) => ({ ...s, url: e.target.value }))}
                    />
                  </div>
                )}

                {previewWide && (
                  <div className="border rounded-xl p-3">
                    <div className="w-full max-w-full aspect-video">
                      <img src={previewWide} alt="Preview widescreen" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-slate-500" />
                <span className="text-sm font-medium">Credenciais de acesso (opcional, escolher 1 modo)</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-700">E-mail de login</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border px-3 py-2"
                    placeholder="cliente@empresa.com.br"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 md:col-span-2">
                  <button
                    className={`flex-1 rounded-lg border py-2 ${credMode === "link" ? "bg-emerald-600 text-white" : "bg-white"}`}
                    onClick={() => setCredMode("link")}
                  >
                    Link “Definir senha”
                  </button>
                  <button
                    className={`flex-1 rounded-lg border py-2 ${credMode === "temp" ? "bg-emerald-600 text-white" : "bg-white"}`}
                    onClick={() => setCredMode("temp")}
                  >
                    Senha temporária
                  </button>
                </div>

                {credMode === "link" ? (
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-700">URL para definir senha</label>
                    <input
                      type="url"
                      className="w-full rounded-xl border px-3 py-2"
                      placeholder="https://viacorp.maxfibraltda.com.br/definir-senha?token=XYZ"
                      value={setPasswordUrl}
                      onChange={(e) => setSetPasswordUrl(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-700">Senha temporária</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border px-3 py-2"
                      placeholder="Abc123!xyz"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <StickyNote size={18} className="text-slate-500" />
                <span className="text-sm font-medium">Notas (opcional)</span>
              </div>
              <textarea
                className="w-full rounded-xl border px-3 py-2"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        {/* Footer fixo */}
        <div className="flex justify-between items-center border-t px-5 py-4 shrink-0">
          <div className="text-xs text-slate-500">Dica: PNG transparente para a quadrada; JPG para a widescreen.</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-slate-100">
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Publicando…" : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
