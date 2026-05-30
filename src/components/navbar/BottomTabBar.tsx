import React, { useState, useCallback } from 'react';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { SellActionSheet } from './shared/SellActionSheet';

interface BottomTabBarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  user: any;
  userRole: 'buyer' | 'seller';
  onChangeUserRole: (role: 'buyer' | 'seller') => void;
  onSetSellerTab?: (tab: 'listings' | 'create' | 'settings' | 'snap') => void;
  showToast: (msg: string) => void;
}

export default function BottomTabBar({
  currentView,
  onChangeView,
  user,
  userRole,
  onChangeUserRole,
  onSetSellerTab,
  showToast
}: BottomTabBarProps) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleManualCreateRoute = useCallback(() => {
    setIsActionSheetOpen(false);
    
    // Clean transition logic
    if (userRole === 'buyer') {
      onChangeUserRole('seller');
    }
    if (onSetSellerTab) {
      onSetSellerTab('create');
    }
    onChangeView('listings');
    showToast("Manual deployment pipeline ready.");
  }, [userRole, onChangeUserRole, onSetSellerTab, onChangeView, showToast]);

  const handleCameraSnapTrigger = useCallback(() => {
    try {
      setCameraError(null);
      // Logic for AI Snap goes here
      showToast("Initializing AI vision modules...");
      setIsActionSheetOpen(false);
      if (userRole === 'buyer') onChangeUserRole('seller');
      if (onSetSellerTab) onSetSellerTab('snap');
      onChangeView('listings');
    } catch (err) {
      setCameraError("Camera hardware integration access denied.");
    }
  }, [userRole, onChangeUserRole, onSetSellerTab, onChangeView, showToast]);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-charcoal border-t border-oil-dark px-4 py-2 flex items-center justify-around select-none">
        
        <button 
          onClick={() => onChangeView('home')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${currentView === 'home' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-display font-bold uppercase tracking-tight">Home</span>
        </button>

        <button 
          onClick={() => onChangeView('search')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${currentView === 'search' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[9px] font-display font-bold uppercase tracking-tight">Explore</span>
        </button>

        {/* Central Action Entry Node */}
        <button
          onClick={() => {
              if (!user) {
                  showToast('Please log in or register to create a parts listing.');
                  onChangeView('auth');
                  return;
              }
              setIsActionSheetOpen(true);
          }}
          className="relative -top-5 w-12 h-12 bg-rust-copper text-steel-black rounded-full shadow-lg flex items-center justify-center transform active:scale-95 transition-transform cursor-pointer border-4 border-steel-black"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button 
          onClick={() => onChangeView('messages')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${currentView === 'messages' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-display font-bold uppercase tracking-tight">Inbox</span>
        </button>

        <button 
          onClick={() => onChangeView('profile')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${currentView === 'profile' ? 'text-rust-copper' : 'text-warm-gray'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-display font-bold uppercase tracking-tight">Garage</span>
        </button>
      </div>

      <SellActionSheet 
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onSelectManualCreate={handleManualCreateRoute}
        onTriggerSnapCamera={handleCameraSnapTrigger}
        cameraError={cameraError}
      />
    </>
  );
}
