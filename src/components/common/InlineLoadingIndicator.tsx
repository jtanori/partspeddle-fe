import { Loader2 } from "lucide-react";

interface InlineLoadingIndicatorProps {
  label?: string;
  className?: string;
}

export function InlineLoadingIndicator({
  label = "Loading results...",
  className = "",
}: InlineLoadingIndicatorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className="w-8 h-8 text-brand-primary animate-spin"
        aria-hidden="true"
      />
      {label ? (
        <p className="text-sm font-medium text-foreground-muted">{label}</p>
      ) : null}
    </div>
  );
}
