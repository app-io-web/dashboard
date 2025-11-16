// src/pages/create/components/TextField.tsx
import { HTMLInputTypeAttribute } from "react";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
  inputMode,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  type?: HTMLInputTypeAttribute;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
