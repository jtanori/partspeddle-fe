import React from 'react';
import { useAuthStore } from '@/store/hooks';
import { Search, Menu } from 'lucide-react';

interface DashboardHeaderProps {
  onToggleYardControl: () => void;
  onToggleMobileMenu?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleYardControl,
  onToggleMobileMenu,
}) => {
  const { profile } = useAuthStore();

  return (
    <header className="h-16 w-full bg-shell-elevated border-b border-border-default px-4 md:px-6 flex justify-between items-center gap-3 z-40 shrink-0">
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-1 text-text-muted hover:text-accent-amber md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full max-w-[420px] hidden sm:block min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search parts, vehicles, or VIN..."
            className="w-full h-10 bg-shell-surface border border-border-default rounded-sm pl-9 pr-4 text-text-secondary placeholder-text-muted focus:outline-none focus:border-accent-amber/50 text-xs font-mono transition-all"
          />
        </div>
      </div>

      <button 
        onClick={onToggleYardControl}
        className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 pr-2 py-1.5 border border-border-muted bg-shell-hex/50 hover:border-accent-amber/40 transition-all text-left focus:outline-none group shrink-0 min-h-[44px]"
      >
        <div className="flex-col min-w-0 hidden sm:flex">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Active Registry</span>
          <span className="text-xs font-bold text-text-primary group-hover:text-accent-amber transition-colors truncate max-w-[120px] sm:max-w-[200px]">
            {profile?.name || "UNASSIGNED RECOVERY DISPATCH"}
          </span>
        </div>
        <div className="h-8 w-8 rounded-sm bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center text-accent-amber text-xs font-bold font-mono shrink-0">
          {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'OP'}
        </div>
      </button>
    </header>
  );
};