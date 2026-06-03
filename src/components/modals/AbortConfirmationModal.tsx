import React from 'react';

interface AbortModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AbortConfirmationModal: React.FC<AbortModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 font-mono">
      <div className="w-full max-w-md border-2 border-accent-red bg-shell-elevated p-6 rounded-none shadow-hard">
        
        <div className="flex items-center gap-2 text-accent-red text-xs uppercase font-bold tracking-widest mb-4">
          <span>[☠️ CRITICAL TERMINAL ALERT]</span>
        </div>

        <p className="text-xs text-text-muted leading-relaxed mb-6">
          You are attempting to exit an active ingestion sequence. All staged images, extracted component metrics, and uncommitted data rows will be purged from memory.
        </p>

        <div className="flex justify-end gap-4 text-xs">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-border-default text-text-primary hover:bg-shell-hover uppercase transition-colors"
          >
            Stay in Wizard
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-accent-red text-white font-bold hover:bg-accent-red-hover uppercase transition-colors"
          >
            Purge & Exit Terminal
          </button>
        </div>

      </div>
    </div>
  );
};
