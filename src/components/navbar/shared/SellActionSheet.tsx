import React from 'react';
import { X, Camera, Pencil, Sparkles } from 'lucide-react';

interface SellActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManualCreate: () => void;
  onTriggerSnapCamera: () => void;
  cameraError?: string | null;
}

export const SellActionSheet: React.FC<SellActionSheetProps> = ({
  isOpen,
  onClose,
  onSelectManualCreate,
  onTriggerSnapCamera,
  cameraError
}) => {
  if (!isOpen) return null;

  const onSelectManualCreateWithEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectManualCreate();
  };

  const onTriggerSnapCameraWithEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTriggerSnapCamera();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-steel-black/80 backdrop-blur-xs">
      {/* Tap Backdrop Closer */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-md bg-charcoal border-t sm:border border-oil-dark rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl space-y-4 text-base-cream z-10">
        <div className="flex justify-between items-center border-b border-oil-dark pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rust-copper animate-pulse" />
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-base-cream">
              PartsPeddle Engine Listing Launch
            </h3>
          </div>
          <button onClick={onClose} className="text-warm-gray hover:text-base-cream transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Path 1: Immersive AI Snap To List Engine */}
          <button
            onClick={onTriggerSnapCameraWithEvent}
            className="w-full bg-rust-copper hover:bg-bronze text-steel-black p-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.99] transition-all cursor-pointer group"
          >
            <Camera className="w-5 h-5" />
            <span className="font-display font-black text-sm uppercase tracking-wider">
              Snap-to-List (AI Salvage Scan)
            </span>
          </button>
          
          {cameraError && (
            <p className="text-[10px] font-mono text-rose-400 text-center bg-rose-500/10 p-2 rounded border border-rose-500/20">
              {cameraError}
            </p>
          )}

          {/* Path 2: Classic Manual Assembly */}
          <button
            onClick={onSelectManualCreateWithEvent}
            className="w-full bg-transparent border border-oil-dark text-base-cream p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-steel-black active:scale-[0.99] transition-all cursor-pointer group"
          >
            <Pencil className="w-5 h-5 text-warm-gray group-hover:text-rust-copper transition-colors" />
            <span className="font-display font-bold text-sm uppercase tracking-wider">
              Create Manually
            </span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full border border-oil-dark bg-transparent text-warm-gray py-2.5 rounded-lg text-center font-display font-bold text-xs uppercase tracking-widest hover:text-base-cream transition-colors cursor-pointer"
        >
          Dismiss Matrix
        </button>
      </div>
    </div>
  );
};
