import { useId } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, className = "", ...rest }: Props) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-sm font-medium text-slate-800">{label}</span>
      <input
        id={id}
        className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none 
        focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-150 ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
