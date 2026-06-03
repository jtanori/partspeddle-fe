import React from 'react';
import { useInventoryWizard } from '../../context/InventoryWizardContext';
import { useNavigate } from 'react-router-dom';

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: React.ElementType;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ to, label, icon: Icon }) => {
  const { isTerminalLocked, triggerAbortWarning } = useInventoryWizard();
  const navigate = useNavigate();

  const handleNavigation = (e: React.MouseEvent) => {
    if (isTerminalLocked) {
      e.preventDefault();
      triggerAbortWarning(() => {
        navigate(to);
      });
    }
  };

  return (
    <a 
      href={to} 
      onClick={handleNavigation}
      className="flex items-center gap-3 px-3 py-2.5 transition-all text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-sm"
    >
      <Icon className="w-4 h-4" />
      <span className="font-heading tracking-wider uppercase text-xs">{label}</span>
    </a>
  );
};
