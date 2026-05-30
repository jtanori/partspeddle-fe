import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Plus, 
  MessageSquare, 
  User, 
  X,
  Camera,
  FileText,
  Sparkles,
  Pencil
} from 'lucide-react';

interface BottomTabBarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  user: any;
  userRole: 'buyer' | 'seller';
  onChangeUserRole: (role: 'buyer' | 'seller') => void;
  onSetSellerTab?: (tab: 'listings' | 'create' | 'settings' | 'snap') => void;
  onOpenCart: () => void;
  onOpenDrawer: () => void;
  onOpenBottomSheet: () => void;
  ctaAction: () => void;
  profile: any;
  showToast: (msg: string) => void;
  onSnapImagesUploaded?: (images: string[]) => void;
}

export default function BottomTabBar({
  currentView,
  onChangeView,
  user,
  userRole,
  onChangeUserRole,
  onSetSellerTab,
  onOpenDrawer,
  onOpenBottomSheet,
  ctaAction,
  profile,
  showToast,
  onSnapImagesUploaded
}: BottomTabBarProps) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isSnapReady, setIsSnapReady] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Simulate AI initialization for Snap-to-List feature
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsSnapReady(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Check if profile is complete (for verified seller listings)
  const isProfileComplete = !user || (profile && profile.name && profile.name.trim() !== 'Unnamed Yard' && profile.location && profile.location.trim() !== '');

  const isSellerMode = user && userRole === 'seller';
  const isGuestMode = !user;

  const [cameraError, setCameraError] = useState<string | null>(null);

  // Center button hander
  const handleCenterAction = () => {
    if (!isSnapReady) return;

    // If guest clicks center CTA
    if (isGuestMode) {
      showToast('Please log in or register to create a parts listing.');
      onChangeView('auth');
      return;
    }

    // Any logged-in user (buyer or seller) should first see the choices bottom sheet
    setCameraError(null);
    setIsActionSheetOpen(true);
  };

  const handleSnapWithAi = async () => {
    setCameraError(null);
    try {
      // This is the prompt! Strictly triggered by the user tapping "Snap with AI"
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } } 
      });
      // Immediately stop it; we just needed the permission grant for this interaction
      stream.getTracks().forEach(track => track.stop());
      
      // Set a temporary flag to let SellerDashboard know it can auto-start its viewfinder
      localStorage.setItem('parts_peddle_camera_vetted', 'true');
      
      setIsActionSheetOpen(false);
      if (userRole === 'buyer' && onChangeUserRole) {
        onChangeUserRole('seller');
      }
      if (onSetSellerTab) onSetSellerTab('snap');
      onChangeView('listings');
    } catch (err) {
      console.warn('Camera blocked or not found, proceeding to modal fallback:', err);
      // If permission denied or hardware missing, we still go to the view
      // The SellerDashboard will handle the cameraError state visually
      setIsActionSheetOpen(false);
      if (userRole === 'buyer' && onChangeUserRole) {
        onChangeUserRole('seller');
      }
      if (onSetSellerTab) onSetSellerTab('snap');
      onChangeView('listings');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageUrls: string[] = [];
    const readPromises = Array.from(files).map(file => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            imageUrls.push(event.target.result as string);
          }
          resolve();
        };
        reader.readAsDataURL(file as Blob);
      });
    });

    Promise.all(readPromises).then(() => {
      if (imageUrls.length > 0) {
        setIsActionSheetOpen(false);
        if (onSnapImagesUploaded) {
          onSnapImagesUploaded(imageUrls);
        }
      }
    });
  };

  return (
    <div 
      className="md:hidden landscape:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[rgba(255,255,255,0.06)] h-16 pb-[env(safe-area-inset-bottom)] z-45 flex items-center justify-around select-none"
      id="id-mobile-bottom-tab-bar"
    >
      {/* SLOT 1: Home */}
      <button
        onClick={() => onChangeView('home')}
        className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
          currentView === 'home' ? 'text-[#B87333]' : 'text-zinc-400 hover:text-white'
        }`}
        id="btn-mobile-tab-home"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-sans font-semibold">Home</span>
      </button>

      {/* SLOT 2: Browse */}
      <button
        onClick={() => onChangeView('listing')}
        className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
          currentView === 'listing' ? 'text-[#B87333]' : 'text-zinc-400 hover:text-white'
        }`}
        id="btn-mobile-tab-browse"
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-sans font-semibold">Browse</span>
      </button>

      {/* SLOT 3: Center Elevated CTA Slot */}
      <div className="flex-1 h-full flex items-center justify-center relative">
        <button
          onClick={handleCenterAction}
          disabled={!isSnapReady}
          className={`absolute -top-3 w-12 h-12 rounded-full bg-[#B87333] hover:bg-[#A35D1F] active:translate-y-0.5 shadow-[0_4px_16px_rgba(184,115,51,0.4)] flex items-center justify-center text-white transition-all cursor-pointer group ${!isSnapReady ? 'opacity-80' : ''}`}
          id="btn-mobile-tab-center-cta"
        >
          <div className="relative">
            {!isSnapReady ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Camera className="w-6 h-6 stroke-[2]" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1.5 text-amber-300 animate-pulse" />
              </>
            )}
          </div>
          
          {/* Animated Ring for Seller Focus */}
          {isSellerMode && isSnapReady && (
            <span className="absolute inset-[-4px] border border-[#B87333]/40 rounded-full animate-ping-slow"></span>
          )}
        </button>
        <span className={`text-[11px] font-display font-black uppercase tracking-tighter text-rust-copper mt-7 ${!isSnapReady ? 'opacity-40 animate-pulse' : ''}`}>
          {isSnapReady ? 'Sell' : 'Readying'}
        </span>
      </div>

      {/* SLOT 4: Inbox */}
      <button
        onClick={() => {
          if (isGuestMode) {
            showToast('Please log in to view your messages.');
            onChangeView('auth');
          } else {
            showToast('Inbox: Direct Messages connected. No new salvage communications.');
          }
        }}
        className="flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer text-zinc-400 hover:text-white relative"
        id="btn-mobile-tab-inbox"
      >
        <MessageSquare className="w-5 h-5" />
        {!isGuestMode && (
          <span className="absolute top-2.5 right-[35%] w-2 h-2 bg-[#B87333] rounded-full"></span>
        )}
        <span className="text-[10px] font-sans font-semibold">Inbox</span>
      </button>

      {/* SLOT 5: Account */}
      <button
        onClick={onOpenBottomSheet}
        className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
          currentView === 'auth' ? 'text-[#B87333]' : 'text-zinc-400 hover:text-white'
        } relative`}
        id="btn-mobile-tab-account-sheet"
      >
        <div className="relative">
          <User className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-sans font-semibold">Account</span>
      </button>

      {/* Mobile Action Sheet overlay */}
      {isActionSheetOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[100] flex items-end justify-center font-sans"
          onClick={() => setIsActionSheetOpen(false)}
          id="mobile-action-sheet"
        >
          <div 
            className="bg-[#1C1C1E] border-t border-zinc-800 rounded-t-2xl w-full p-6 pb-8 space-y-5 animate-slide-up text-left max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drag Handle & Title */}
            <div className="flex flex-col items-center gap-2 pb-1">
              <div className="w-12 h-1 bg-zinc-700 rounded-full"></div>
              <div className="flex items-center justify-between w-full mt-2">
                <span className="text-sm uppercase tracking-wider font-display font-black text-white">
                  Add New Listing
                </span>
                <button 
                  onClick={() => setIsActionSheetOpen(false)}
                  className="bg-zinc-800 p-1.5 rounded-full text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Path 1: Snap Part with AI */}
            <div className="space-y-2">
              <button
                onClick={handleSnapWithAi}
                className="w-full bg-[#B87333] text-white p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#A35D1F] active:scale-[0.99] transition-all text-center group shadow-lg shadow-[#B87333]/20"
                id="btn-mobile-snap-ai"
              >
                <Camera className="w-6 h-6" />
                <span className="font-display font-black text-sm uppercase tracking-wider">
                  Snap with AI
                </span>
              </button>

              <input 
                type="file" 
                accept="image/*" 
                multiple 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
              />

              {cameraError && (
                <button 
                  onClick={triggerFileInput}
                  className="w-full py-3 px-4 rounded-lg border border-rust-copper/30 bg-oil-dark/20 text-rust-copper text-xs font-sans font-medium flex items-center gap-2 animate-fade-in"
                >
                  <span className="w-2 h-2 rounded-full bg-rust-copper animate-pulse" />
                  {cameraError}
                </button>
              )}
            </div>

            {/* Path 2: Create Manually */}
            <button
              onClick={() => {
                setIsActionSheetOpen(false);
                // Clear any leftover camera intent flags
                localStorage.removeItem('parts_peddle_camera_vetted');
                
                if (userRole === 'buyer' && onChangeUserRole) {
                  onChangeUserRole('seller');
                }
                if (onSetSellerTab) onSetSellerTab('create');
                onChangeView('listings');
              }}
              className="w-full bg-transparent border border-zinc-700/50 text-zinc-300 p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-800 active:scale-[0.99] transition-all text-center group"
              id="btn-mobile-manual-create"
            >
              <Pencil className="w-5 h-5 text-zinc-500" />
              <span className="font-display font-black text-sm uppercase tracking-wider">
                Create Manually
              </span>
            </button>

            <button
              onClick={() => setIsActionSheetOpen(false)}
              className="w-full border border-zinc-800 bg-transparent text-zinc-400 py-3 rounded-lg text-center font-display font-bold text-xs uppercase tracking-widest active:bg-zinc-850 mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
