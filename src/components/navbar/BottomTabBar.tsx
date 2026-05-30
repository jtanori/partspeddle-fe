import React, { useState } from 'react';
import { Home, Search, Plus, History, User } from 'lucide-react';
import { SellActionSheet } from './shared/SellActionSheet';

interface BottomTabBarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  user: any;
  showToast: (msg: string) => void;
  onSetSellerTab?: (tab: 'listings' | 'create' | 'settings' | 'snap') => void;
}

export default function BottomTabBar({
  currentView,
  onChangeView,
  user,
  showToast,
  onSetSellerTab
}: BottomTabBarProps) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-charcoal border-t border-oil-dark px-4 py-2 flex items-center justify-around select-none">
        
        <button 
          onClick={() => onChangeView('home')}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors ${currentView === 'home' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Feed</span>
        </button>

        <button 
          onClick={() => onChangeView('listing')}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors ${currentView === 'listing' ? 'text-rust-copper' : 'text-warm-gray'}`}
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
                    onChangeView('auth');
                    return;
                }
                setIsActionSheetOpen(true);
            }}
            className="w-12 h-12 rounded-xl bg-rust-copper hover:bg-bronze text-steel-black shadow-lg shadow-rust-copper/20 flex items-center justify-center border-4 border-steel-black cursor-pointer transform active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <button 
          onClick={() => onChangeView('orders')}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors ${currentView === 'orders' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Orders</span>
        </button>

        <button 
          onClick={() => onChangeView('profile')}
          className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors ${currentView === 'profile' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Garage</span>
        </button>
      </div>

      <SellActionSheet 
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onSelectManualCreate={() => {
            setIsActionSheetOpen(false);
            if (onSetSellerTab) onSetSellerTab('create');
            window.location.href = '/dashboard';
        }}
        onTriggerSnapCamera={() => {
            setIsActionSheetOpen(false);
            if (onSetSellerTab) onSetSellerTab('snap');
            window.location.href = '/dashboard';
            showToast("Initializing AI vision modules...");
        }}
      />
    </>
  );
}
