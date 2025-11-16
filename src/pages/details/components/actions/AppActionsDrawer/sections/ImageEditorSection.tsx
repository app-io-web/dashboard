// src/pages/details/components/actions/AppActionsDrawer/sections/ImageEditorSection.tsx
import { Image as ImageIcon, Upload, Link as LinkIcon, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type DrawerImages = {
  imageSquareUrl: string | null;
  imageWideUrl: string | null;
  autoResize?: boolean;
};

type ImgSource = { mode: "upload" | "url"; file: File | null; url: string };

export function ImageEditorSection({
  initial,
  onChange,
  onClear, // 👈 novo
}: {
  initial: DrawerImages;
  onChange: (next: DrawerImages & { squareFile?: File | null; wideFile?: File | null }) => void;
  onClear?: (kind: "square" | "wide") => Promise<void> | void; // 👈 novo
}) {
  // --- estado
  const [autoResize, setAutoResize] = useState<boolean>(initial.autoResize ?? true);
  const [imageSquareUrl, setImageSquareUrl] = useState<string | null>(initial.imageSquareUrl ?? null);
  const [imageWideUrl, setImageWideUrl] = useState<string | null>(initial.imageWideUrl ?? null);

  const [square, setSquare] = useState<ImgSource>({ mode: "upload", file: null, url: "" });
  const [wide, setWide] = useState<ImgSource>({ mode: "upload", file: null, url: "" });

  const [showSquareUrl, setShowSquareUrl] = useState(false);
  const [showWideUrl, setShowWideUrl] = useState(false);

  // 👇 novo: estado de limpeza (loading do botão Limpar)
  const [clearing, setClearing] = useState<{ square: boolean; wide: boolean }>({
    square: false,
    wide: false,
  });

  const squareInputRef = useRef<HTMLInputElement | null>(null);
  const wideInputRef = useRef<HTMLInputElement | null>(null);

  // --- manter onChange estável p/ evitar warning do react-hooks/exhaustive-deps
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // --- SYNC: reflete 'initial' no estado APENAS quando muda de verdade
  useEffect(() => {
    const nextAuto = initial.autoResize ?? true;
    const nextSquare = initial.imageSquareUrl ?? null;
    const nextWide = initial.imageWideUrl ?? null;

    setAutoResize((prev) => (prev !== nextAuto ? nextAuto : prev));
    setImageSquareUrl((prev) => (prev !== nextSquare ? nextSquare : prev));
    setImageWideUrl((prev) => (prev !== nextWide ? nextWide : prev));

    // reset os seletores só quando sincronizar (sem tirar arquivo já escolhido)
    setSquare((s: ImgSource) =>
      s.file && s.mode === "upload" ? s : { mode: "upload", file: null, url: "" },
    );
    setWide((s: ImgSource) =>
      s.file && s.mode === "upload" ? s : { mode: "upload", file: null, url: "" },
    );

    setShowSquareUrl(false);
    setShowWideUrl(false);
  }, [initial.imageSquareUrl, initial.imageWideUrl, initial.autoResize]);

  // --- previews (arquivo selecionado tem prioridade sobre a URL do back)
  const squarePreview = useMemo(
    () => (square.file ? URL.createObjectURL(square.file) : imageSquareUrl || null),
    [square.file, imageSquareUrl],
  );
  const widePreview = useMemo(
    () => (wide.file ? URL.createObjectURL(wide.file) : imageWideUrl || null),
    [wide.file, imageWideUrl],
  );

  // cleanup dos ObjectURLs (ao desmontar)
  useEffect(() => {
    return () => {
      if (square.file && squarePreview) URL.revokeObjectURL(squarePreview);
      if (wide.file && widePreview) URL.revokeObjectURL(widePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- EMIT ÚNICO: envia para o pai apenas quando o "conteúdo" muda de fato
  const lastSnapshotRef = useRef<string>("");
  useEffect(() => {
    const snapshot = JSON.stringify({
      imageSquareUrl,
      imageWideUrl,
      autoResize,
      hasSquareFile: !!square.file,
      hasWideFile: !!wide.file,
    });

    if (snapshot !== lastSnapshotRef.current) {
      lastSnapshotRef.current = snapshot;
      onChangeRef.current({
        imageSquareUrl,
        imageWideUrl,
        autoResize,
        squareFile: square.file ?? null,
        wideFile: wide.file ?? null,
      });
    }
  }, [imageSquareUrl, imageWideUrl, autoResize, square.file, wide.file]);

  async function clear(kind: "square" | "wide") {
    const prevSquare = imageSquareUrl;
    const prevWide = imageWideUrl;

    // otimista: some da UI
    if (kind === "square") {
      setClearing((s) => ({ ...s, square: true }));
      setImageSquareUrl(null);
      setSquare({ mode: "upload", file: null, url: "" });
      setShowSquareUrl(false);
    } else {
      setClearing((s) => ({ ...s, wide: true }));
      setImageWideUrl(null);
      setWide({ mode: "upload", file: null, url: "" });
      setShowWideUrl(false);
    }

    try {
      await onClear?.(kind); // grava NULL no banco
    } catch (err) {
      // rollback se falhar
      if (kind === "square") setImageSquareUrl(prevSquare ?? null);
      else setImageWideUrl(prevWide ?? null);
      console.error("Falha ao limpar imagem:", err);
    } finally {
      setClearing({ square: false, wide: false });
    }
  }

  function selectFile(kind: "square" | "wide") {
    (kind === "square" ? squareInputRef.current : wideInputRef.current)?.click();
  }

  async function handleFile(kind: "square" | "wide", f?: File | null) {
  if (!f) return;

  const prevUrl = kind === "square" ? imageSquareUrl : imageWideUrl;

  // Limpeza otimista: remove a URL antiga imediatamente
  if (kind === "square") {
    setImageSquareUrl(null);
    setSquare({ mode: "upload", file: f, url: "" });
    setShowSquareUrl(false);
  } else {
    setImageWideUrl(null);
    setWide({ mode: "upload", file: f, url: "" });
    setShowWideUrl(false);
  }

  // Tenta limpar no backend (se onClear existir)
  if (prevUrl && onClear) {
    try {
      await onClear(kind);
    } catch (err) {
      // Rollback: se falhar, restaura a URL antiga
      if (kind === "square") {
        setImageSquareUrl(prevUrl);
        setSquare({ mode: "upload", file: null, url: "" }); // remove o file também
      } else {
        setImageWideUrl(prevUrl);
        setWide({ mode: "upload", file: null, url: "" });
      }
      console.error("Falha ao limpar imagem antiga:", err);
      alert("Erro ao substituir imagem. Tente novamente.");
    }
  }
}

  function applyUrl(kind: "square" | "wide") {
    if (kind === "square") {
      const url = square.url.trim();
      if (!url) return;
      setImageSquareUrl(url);
      setSquare((s: ImgSource) => ({ ...s, file: null }));
      setShowSquareUrl(false);
    } else {
      const url = wide.url.trim();
      if (!url) return;
      setImageWideUrl(url);
      setWide((s: ImgSource) => ({ ...s, file: null }));
      setShowWideUrl(false);
    }
  }

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <ImageIcon size={18} className="text-rose-600" />
        Edição de imagens
      </h3>

      <div className="space-y-6 rounded-xl border border-slate-200 p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            id="autoResize"
            type="checkbox"
            className="size-4 accent-rose-600"
            checked={autoResize}
            onChange={(e) => setAutoResize(e.target.checked)}
          />
          <span>Redimensionar automaticamente (1000×1000 e 1920×1080)</span>
        </label>

        {/* QUADRADA */}
        <div>
          <h4 className="mb-2 text-sm font-medium">Imagem quadrada (1000×1000)</h4>
          <div className="grid gap-3 sm:grid-cols-[160px,1fr]">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
              {squarePreview ? (
                <img src={squarePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <ImageIcon />
                  <span className="text-xs">Sem imagem</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => selectFile("square")}
                >
                  <Upload size={16} />
                  Enviar arquivo
                </button>

                <button
                  type="button"
                  title="Colar URL"
                  aria-label="Colar URL"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50"
                  onClick={() => setShowSquareUrl((v) => !v)}
                >
                  <LinkIcon size={16} />
                </button>

              </div>

              <div
                className={`overflow-hidden transition-all ${
                  showSquareUrl ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-2 flex w-full gap-2">
                  <input
                    type="url"
                    inputMode="url"
                    placeholder="Colar URL"
                    value={square.url}
                    onChange={(e) => setSquare((s: ImgSource) => ({ ...s, url: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                    onClick={() => applyUrl("square")}
                  >
                    Usar URL
                  </button>
                </div>
              </div>

              {square.file && (
                <p className="truncate text-xs text-slate-500">
                  Selecionado: <span title={square.file.name}>{square.file.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* WIDE */}
        <div>
          <h4 className="mb-2 text-sm font-medium">Imagem widescreen (1920×1080)</h4>
          <div className="grid gap-3 sm:grid-cols-[160px,1fr]">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
              {widePreview ? (
                <img src={widePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <ImageIcon />
                  <span className="text-xs">Sem imagem</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => selectFile("wide")}
                >
                  <Upload size={16} />
                  Enviar arquivo
                </button>

                <button
                  type="button"
                  title="Colar URL"
                  aria-label="Colar URL"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50"
                  onClick={() => setShowWideUrl((v) => !v)}
                >
                  <LinkIcon size={16} />
                </button>

              </div>

              <div
                className={`overflow-hidden transition-all ${
                  showWideUrl ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-2 flex w-full gap-2">
                  <input
                    type="url"
                    inputMode="url"
                    placeholder="Colar URL"
                    value={wide.url}
                    onChange={(e) => setWide((s: ImgSource) => ({ ...s, url: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                    onClick={() => applyUrl("wide")}
                  >
                    Usar URL
                  </button>
                </div>
              </div>

              {wide.file && (
                <p className="truncate text-xs text-slate-500">
                  Selecionado: <span title={wide.file.name}>{wide.file.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* inputs hidden */}
        <input
          ref={squareInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile("square", e.target.files?.[0] ?? null)}
        />
        <input
          ref={wideInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile("wide", e.target.files?.[0] ?? null)}
        />

        <p className="text-[11px] text-slate-500">
          Na confirmação do Drawer, o container pai pode fazer upload/resize conforme <code>autoResize</code>.
        </p>
      </div>
    </section>
  );
}
