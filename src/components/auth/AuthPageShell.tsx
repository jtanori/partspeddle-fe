"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BrandStoryColumn } from "./BrandStoryColumn";
import { AuthFooter } from "./AuthFooter";
import logoImg from "../../assets/images/logo_solid.png";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignUp = pathname === "/register";
  const [bottomNotice, setBottomNotice] = useState<string | null>(null);

  return (
    <div
      className="w-full flex bg-[#F5F0EB] md:h-screen md:flex-row md:overflow-hidden flex-col"
      id="id-auth-page-root"
    >
      <BrandStoryColumn
        isSignUp={isSignUp}
        role="buyer"
        onCancel={() => (window.location.href = "/")}
      />

      <div className="w-full md:w-[65%] lg:w-[60%] xl:w-1/2 flex flex-col justify-between items-center bg-white md:bg-[#F5F0EB] min-h-screen md:h-full md:overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden w-full h-[56px] min-h-[56px] bg-[#1A1A1A] flex items-center justify-center border-b border-zinc-800/80 flex-shrink-0">
          <Link href="/" className="cursor-pointer">
            <img src={logoImg.src} alt="PartsPeddle Logo" className="h-6" />
          </Link>
        </div>

        <div className="flex-grow w-full flex flex-col justify-center items-center py-10 px-4">
          <div className="w-full max-w-[485px] bg-white border border-zinc-200 shadow-xl p-8 rounded-xl">
            <Link
              href="/"
              className="flex items-center gap-1 font-display text-xs font-black text-rust-copper hover:text-bronze transition-colors uppercase tracking-wider mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              RETURN TO HOME
            </Link>
            {children}
          </div>
        </div>

        <AuthFooter onCancel={() => (window.location.href = "/")} />

        {bottomNotice && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-amber-50 px-4 py-3 rounded-lg border border-[#B87333]/20 shadow-xl flex items-center gap-3 animate-fade-in z-50 max-w-sm">
            <span className="text-[10px] text-zinc-600 font-medium leading-relaxed">
              {bottomNotice}
            </span>
            <button
              onClick={() => setBottomNotice(null)}
              className="p-1 hover:bg-amber-100 rounded"
            >
              <span className="text-zinc-400 text-xs">✕</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
