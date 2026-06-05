import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-cream flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Link href="/" className="font-display font-black text-3xl tracking-tighter text-steel-black hover:text-rust-copper transition-colors">
          VIN<span className="text-rust-copper">TRACK</span>
        </Link>
      </div>
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl p-8">
        {children}
      </div>
      <div className="mt-8 text-xs text-zinc-400 font-sans uppercase tracking-widest">
        &copy; 2026 PartsPeddle Salvage Network
      </div>
    </div>
  );
}
