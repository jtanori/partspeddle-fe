import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WizardContextType {
  isTerminalLocked: boolean;
  setIsTerminalLocked: (locked: boolean) => void;
  abortCallback: (() => void) | null;
  triggerAbortWarning: (onConfirmCallback: () => void) => void;
  confirmAbort: () => void;
  cancelAbort: () => void;
  isAbortModalOpen: boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const InventoryWizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [abortCallback, setAbortCallback] = useState<(() => void) | null>(null);
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);

  const triggerAbortWarning = (onConfirmCallback: () => void) => {
    setAbortCallback(() => onConfirmCallback);
    setIsAbortModalOpen(true);
  };

  const confirmAbort = () => {
    if (abortCallback) abortCallback();
    setIsTerminalLocked(false);
    setIsAbortModalOpen(false);
    setAbortCallback(null);
  };

  const cancelAbort = () => {
    setIsAbortModalOpen(false);
    setAbortCallback(null);
  };

  return (
    <WizardContext.Provider value={{ isTerminalLocked, setIsTerminalLocked, abortCallback, triggerAbortWarning, confirmAbort, cancelAbort, isAbortModalOpen }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useInventoryWizard = () => {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useInventoryWizard must be used within an InventoryWizardProvider');
  return context;
};
