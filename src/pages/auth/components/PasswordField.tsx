import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; };

export function PasswordField({ label, error, className = "", ...rest }: Props) {
  const id = useId();
  const [show, setShow] = useState(false);

  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-sm font-medium text-slate-800">{label}</span>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 text-slate-900 placeholder-slate-400 outline-none 
          focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-150 ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-blue-600"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
