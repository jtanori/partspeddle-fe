import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-[#B87333] animate-spin" />
      <p className="font-display text-lg font-bold uppercase tracking-widest text-white/70">
        INITIALIZING MARKETPLACE...
      </p>
    </div>
  );
}
