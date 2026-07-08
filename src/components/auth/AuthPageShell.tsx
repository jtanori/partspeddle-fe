'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { BrandStoryColumn } from './BrandStoryColumn';
import { AuthFooter } from './AuthFooter';
import logoImg from '../../assets/images/logo_solid.png';

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignUp = pathname === '/register';
  const [bottomNotice, setBottomNotice] = useState<string | null>(null);

  return (
    <div
      className="flex w-full flex-col bg-surface-secondary md:h-screen md:flex-row md:overflow-hidden"
      id="id-auth-page-root"
    >
      <BrandStoryColumn isSignUp={isSignUp} role="buyer" />

      <div className="flex min-h-screen w-full flex-col items-center justify-between bg-surface-primary md:h-full md:w-[65%] md:overflow-y-auto lg:w-[60%] xl:w-1/2">
        {/* Mobile Header */}
        <div className="flex h-14 min-h-14 w-full shrink-0 items-center justify-center border-b border-stroke-default bg-foreground-primary md:hidden">
          <Link href="/" className="cursor-pointer">
            <img src={logoImg.src} alt="PartsPeddle Logo" className="h-6" />
          </Link>
        </div>

        <div className="flex w-full flex-grow flex-col items-center justify-center px-4 py-10">
          <div className="w-full max-w-[485px] rounded-xl border border-stroke-subtle bg-surface-primary p-8 shadow-floating">
            <Link
              href="/"
              className="mb-6 flex items-center gap-1 font-display text-xs font-black uppercase tracking-wider text-brand-primary transition-colors hover:text-brand-primary-hover"
            >
              <ChevronLeft className="h-4 w-4" />
              RETURN TO HOME
            </Link>
            {children}
          </div>
        </div>

        <AuthFooter />

        {bottomNotice && (
          <div className="animate-fade-in fixed bottom-24 left-1/2 z-50 flex max-w-sm -translate-x-1/2 items-center gap-3 rounded-lg border border-brand-primary/20 bg-surface-secondary px-4 py-3 shadow-floating">
            <span className="text-[10px] font-medium leading-relaxed text-foreground-secondary">
              {bottomNotice}
            </span>
            <button
              onClick={() => setBottomNotice(null)}
              className="rounded p-1 hover:bg-surface-muted"
            >
              <span className="text-xs text-foreground-muted">✕</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
