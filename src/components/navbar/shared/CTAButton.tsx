'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '../../../types';

interface CTAButtonProps {
  user: UserSession | null;
  userRole: 'buyer' | 'seller';
  profile: Record<string, any> | null;
  onSetSellerTab?: (
    tab: 'listings' | 'settings' | 'snap' | 'orders' | 'inventory' | 'create',
  ) => void;
  showToast: (msg: string) => void;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  user,
  userRole,
  onSetSellerTab,
  showToast,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      showToast('Sign up with your yard specs to list mechanical units instantly.');
      router.push('/register?role=seller');
      return;
    }
    if (userRole === 'buyer') {
      if (onSetSellerTab) onSetSellerTab('snap');
      showToast('Salvage Yard Onboarding: Initializing Snap-to-List.');
      router.push('/seller/create');
      return;
    }
    if (onSetSellerTab) onSetSellerTab('snap');
    router.push('/seller/create');
  };

  return (
    <button
      onClick={handleClick}
      className="h-[40px] flex items-center justify-center bg-rust-copper text-white border border-white/10 rounded-sm px-5 text-[11px] font-black font-heading tracking-[0.15em] active:translate-y-[0.5px] cursor-pointer select-none whitespace-nowrap shadow-sm transition-all duration-150 relative overflow-hidden hover:bg-rust-copper/90 uppercase"
    >
      <span className="relative z-10">SELL PARTS</span>
    </button>
  );
};
