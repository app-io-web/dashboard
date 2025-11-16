// src/pages/details/components/ui/Badge.tsx
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ children, className }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        "transition-colors",
        className // <- MESCLA as classes vindas de fora
      )}
    >
      {children}
    </span>
  );
}
