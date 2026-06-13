'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our logging service
    console.error('Homepage Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <h2 className="font-display text-2xl font-black uppercase text-rust-copper mb-4">Something went wrong!</h2>
      <p className="text-zinc-500 mb-8 max-w-md">We encountered an issue loading the marketplace data. Please try again.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-zinc-900 text-white rounded-sm font-display font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
      >
        Try again
      </button>
    </div>
  );
}
