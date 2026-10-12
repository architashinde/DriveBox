import { cn } from "@/lib/utils";

export function Logo({
  className,
  markClassName,
  wordClassName,
  compact = false,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        className={cn("h-9 w-9 shrink-0", markClassName)}
      >
        <rect width="36" height="36" rx="10" fill="#1C2B27" />
        <path d="M9 12.5h11.2l4.3 4.2v10.8H9V12.5Z" fill="#F6F1E8" />
        <path d="M20.2 12.5v4.2h4.3" fill="#C4622D" />
        <path d="M13 22.5h8.5" stroke="#1C2B27" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M13 25.2h5.5" stroke="#C4622D" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {compact ? null : (
        <span className={cn("font-display text-xl tracking-tight", wordClassName)}>
          DriveBox
        </span>
      )}
    </span>
  );
}