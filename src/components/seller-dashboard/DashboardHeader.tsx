import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Search, Building2 } from 'lucide-react';

interface DashboardHeaderProps {
  onToggleYardControl: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleYardControl }) => {
  const { profile } = useAppStore();

  return (
    <header className="h-16 w-full bg-shell-elevated border-b border-border-default px-6 flex justify-between items-center z-40">
      {/* Global Search */}
      <div className="relative w-full max-w-[420px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search parts, vehicles, or VIN..."
          className="w-full h-10 bg-shell-surface border border-border-default rounded-sm pl-9 pr-4 text-text-secondary placeholder-text-muted focus:outline-none focus:border-accent-amber/50 text-xs font-mono transition-all"
        />
      </div>

      {/* Operator Command Gate Trigger */}
      <button 
        onClick={onToggleYardControl}
        className="flex items-center gap-3 pl-4 pr-2 py-1.5 border border-border-muted bg-shell-hex/50 hover:border-accent-amber/40 transition-all text-left focus:outline-none group"
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Active Registry</span>
          <span className="text-xs font-bold text-text-primary group-hover:text-accent-amber transition-colors">
            {profile?.name || "UNASSIGNED RECOVERY DISPATCH"}
          </span>
        </div>
        <div className="h-8 w-8 rounded-sm bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center text-accent-amber text-xs font-bold font-mono">
          {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'OP'}
        </div>
      </button>
    </header>
  );
};
