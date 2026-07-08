'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Search, Plus, History, User } from 'lucide-react';
import { SellActionSheet } from './shared/SellActionSheet';

interface BottomTabBarProps {
  currentView: string;
  user: any;
  showToast: (msg: string) => void;
  onSetSellerTab?: (
    tab: 'listings' | 'create' | 'settings' | 'snap' | 'orders' | 'inventory',
  ) => void;
}

export default function BottomTabBar({
  currentView,
  user,
  showToast,
  onSetSellerTab,
}: BottomTabBarProps) {
  const router = useRouter();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-charcoal border-t border-oil-dark px-4 py-2 flex items-center justify-around select-none">
        <button
          onClick={() => router.push('/')}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors ${currentView === '/' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Home</span>
        </button>

        <button
          onClick={() => router.push('/search')}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors ${currentView === '/search' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Search</span>
        </button>

        {/* 3. THE CATALYST: SELL PARTS ACTION BUTTON */}
        <div className="flex-1 flex justify-center -mt-5 relative z-50">
          <button
            onClick={() => {
              if (!user) {
                showToast('Please log in or register to create a parts listing.');
                router.push('/login');
                return;
              }
              setIsActionSheetOpen(true);
            }}
            className="w-14 h-14 rounded-full bg-rust-copper hover:bg-bronze text-steel-black shadow-lg shadow-rust-copper/40 flex items-center justify-center border-4 border-steel-black cursor-pointer transform active:scale-90 transition-transform"
          >
            <Plus className="w-8 h-8 stroke-[3]" />
          </button>
        </div>

        <button
          onClick={() => router.push('/seller/orders')}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors ${currentView === '/seller/orders' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Orders</span>
        </button>

        <button
          onClick={() => router.push('/profile')}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors ${currentView === '/profile' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Profile</span>
        </button>
      </div>

      <SellActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onSelectManualCreate={() => {
          setIsActionSheetOpen(false);
          if (onSetSellerTab) onSetSellerTab('create');
          router.push('/dashboard');
        }}
        onTriggerSnapCamera={() => {
          setIsActionSheetOpen(false);
          if (onSetSellerTab) onSetSellerTab('snap');
          router.push('/dashboard');
          showToast('Initializing AI vision modules...');
        }}
      />
    </>
  );
}
