import React from 'react';
import { Backdrop } from './Backdrop';

interface BottomSheetProps {
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ children, onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-end justify-center animate-fade-in font-sans" id="mobile-bottom-sheet-overlay">
      <Backdrop onClick={onClose} />
      
      <div className="w-full max-w-[640px] bg-steel-black border-t border-oil-dark rounded-t-2xl z-10 p-6 font-sans text-base-cream select-none shadow-2xl relative max-h-[85vh] flex flex-col overflow-y-auto">
        {/* Drag Handle */}
        <div 
          className="w-12 h-1 bg-oil-dark hover:bg-charcoal rounded-full mx-auto mb-4 cursor-pointer flex-shrink-0" 
          onClick={onClose}
        />
        {children}
      </div>
    </div>
  );
};
