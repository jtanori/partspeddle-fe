'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, User } from 'lucide-react';

interface AuthActionsProps {
  onClose?: () => void;
  variant?: 'button' | 'list';
  showToast?: (msg: string) => void;
}

export const AuthActions: React.FC<AuthActionsProps> = ({
  onClose,
  variant = 'button',
  showToast,
}) => {
  const router = useRouter();

  const handleAuth = (mode: 'login' | 'signup') => {
    if (onClose) onClose();
    if (mode === 'signup') {
      router.push('/register?role=seller');
    } else {
      router.push('/login');
    }
  };

  if (variant === 'list') {
    return (
      <div className="flex flex-col gap-1.5 font-sans">
        <button
          onClick={() => handleAuth('login')}
          className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
        >
          <LogIn className="w-4 h-4 text-warm-gray" />
          <span>Log In</span>
        </button>
        <button
          onClick={() => handleAuth('signup')}
          className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
        >
          <User className="w-4 h-4 text-warm-gray" />
          <span>Sign Up</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => handleAuth('login')}
      className="bg-zinc-900 border border-white/10 text-base-cream rounded-sm px-5 h-[40px] text-[11px] font-black font-heading tracking-[0.15em] transition-all flex items-center justify-center whitespace-nowrap uppercase hover:bg-zinc-800 hover:text-rust-copper cursor-pointer"
    >
      LOG IN
    </button>
  );
};
