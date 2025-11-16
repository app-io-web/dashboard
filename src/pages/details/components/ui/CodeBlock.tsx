// src/pages/details/components/ui/CodeBlock.tsx
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import CopyButton from "./CopyButton";
import clsx from "clsx";

type Props = {
  /** Texto já unido. Alternativa a `lines`. */
  text?: string;
  /** Linhas para montar o bloco (será `join("\n")`). */
  lines?: string[];
  /** Linguagem para destaque (ex: typescript, sql, csharp, bash) */
  language?: string;
  /** Mostrar botão copiar */
  showCopy?: boolean;
  /** Classes extras */
  className?: string;
  /** Quebrar linhas longas */
  wrap?: boolean;
};

// Mapeamento para nomes que o Prism entende
const LANGUAGE_MAP: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  csharp: "csharp",
  cs: "csharp",
  py: "python",
  github: "yaml",
  docker: "dockerfile",
  dockerfile: "dockerfile",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  sql: "sql",
  json: "json",
  html: "xml",
  xml: "xml",
  md: "markdown",
  markdown: "markdown",
  plaintext: "text",
  txt: "text",
};

export default function CodeBlock({
  text,
  lines,
  language = "bash",
  showCopy = true,
  className,
  wrap = false,
}: Props) {
  const content = Array.isArray(lines)
    ? lines.filter(Boolean).join("\n")
    : (text ?? "");

  const safeContent = typeof content === "string" ? content : "";
  const normalizedLang = LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();

  return (
    <div className={clsx("relative group", className)}>
      {showCopy && (
        <CopyButton
          text={safeContent}
          className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-2 text-xs hover:bg-slate-50"
          label="Copiar"
        />
      )}

      <SyntaxHighlighter
        language={normalizedLang}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          borderRadius: "0.375rem",
          fontSize: "13px",
          lineHeight: "1.5",
          padding: "12px",
          background: "#0f172a", // slate-900
        }}
        wrapLines={wrap}
        wrapLongLines={wrap}
        showLineNumbers={false}
        codeTagProps={{
          className: "text-slate-100",
        }}
      >
        {safeContent || "—"}
      </SyntaxHighlighter>
    </div>
  );
}