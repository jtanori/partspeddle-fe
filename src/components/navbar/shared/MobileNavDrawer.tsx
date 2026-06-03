import React from 'react';
import { X, BookOpen, HelpCircle } from 'lucide-react';
import { Backdrop } from '../../common/Backdrop';
import { AuthActions } from './AuthActions';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeView: (view: string) => void;
  onOpenTour: () => void;
  onOpenSupport: () => void;
  showToast: (msg: string) => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen, onClose, onChangeView, onOpenTour, onOpenSupport, showToast
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex justify-end animate-fade-in" id="mobile-nav-drawer-backdrop">
      <Backdrop onClick={onClose} />
      <div className="w-[280px] bg-steel-black border-l border-oil-dark z-20 h-full flex flex-col justify-between relative p-5 text-base-cream animate-slide-in-right font-sans">
        <div className="flex-grow">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-oil-dark pb-3">
            <div className="flex items-center gap-2 font-display">
              <span className="w-2 h-2 rounded-full bg-rust-copper animate-pulse"></span>
              <p className="text-xs font-bold text-base-cream uppercase tracking-wider">PartsPeddle</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-oil-dark rounded text-warm-gray hover:text-base-cream cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center font-sans"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Drawer Navigation List */}
          <nav className="py-4 space-y-4 font-sans">
            <AuthActions 
                onChangeView={onChangeView} 
                onClose={onClose} 
                showToast={showToast}
                variant="list" 
            />

            <div className="h-px bg-oil-dark my-2" />

            <div className="flex flex-col gap-1.5 font-sans">
              <button
                onClick={() => {
                  onOpenTour();
                  onClose();
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
              >
                <BookOpen className="w-4 h-4 text-rust-copper" />
                <span>How It Works</span>
              </button>
              <button
                onClick={() => {
                  onOpenSupport();
                  onClose();
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-oil-dark transition-colors flex items-center gap-2.5 text-base-cream min-h-[44px]"
              >
                <HelpCircle className="w-4 h-4 text-warm-gray" />
                <span>Support</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="border-t border-oil-dark pt-3 text-center">
          <span className="text-[10px] font-mono tracking-widest text-warm-gray uppercase">PartsPeddle Mobile v1.4</span>
        </div>
      </div>
    </div>
  );
};
