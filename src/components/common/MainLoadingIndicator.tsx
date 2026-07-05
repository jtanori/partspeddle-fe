import { Loader2 } from 'lucide-react';

interface MainLoadingIndicatorProps {
  label?: string;
  className?: string;
}

export function MainLoadingIndicator({
  label = 'Initializing...',
  className = '',
}: MainLoadingIndicatorProps) {
  return (
    <div
      className={`min-h-screen bg-[#0E0E0E] flex flex-col items-center justify-center space-y-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="w-12 h-12 text-[#B87333] animate-spin" aria-hidden="true" />
      <p className="font-display text-lg font-bold uppercase tracking-widest text-white/70">
        {label}
      </p>
    </div>
  );
}
