import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Search, Building2, MapPin } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const { profile } = useAppStore();

  return (
    <header className="h-[72px] border-b border-border-default bg-shell-canvas px-8 flex items-center justify-between shrink-0 font-mono text-xs shadow-panel relative z-10">
      {/* Central Input Search Context */}
      <div className="relative w-[420px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search yard resources, inventory database or VIN indexes..."
          className="w-full h-10 bg-shell-surface border border-border-default rounded-sm pl-11 pr-4 text-text-secondary placeholder-text-muted focus:outline-none focus:border-accent-amber/50 focus:ring-1 focus:ring-accent-amber/20 text-xs font-mono transition-all"
        />
      </div>

      {/* Business Identity Node Workspace */}
      <div className="flex items-center gap-6 h-full">
        <div className="text-right flex flex-col justify-center border-r border-border-subtle pr-6 py-2">
          <div className="flex items-center gap-2 justify-end">
            <Building2 className="w-3.5 h-3.5 text-accent-amber/70" />
            <span className="text-text-primary font-heading font-black tracking-tight text-xs uppercase">
              {profile?.name || 'Unnamed Recovery Yard'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 justify-end text-[10px] text-text-muted mt-1 font-mono">
            <MapPin className="w-3 h-3 text-text-muted/60" />
            <span>{profile?.location || 'Operational Base Unset'}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-success ml-1 animate-pulse shadow-[0_0_8px_var(--color-success)]" />
          </div>
        </div>

        {/* Dynamic Corporate Logo Profile Node */}
        <div className="w-10 h-10 rounded-sm border border-border-strong bg-shell-surface flex items-center justify-center overflow-hidden shrink-0 shadow-panel group cursor-pointer hover:border-accent-amber/40 transition-colors">
          {profile?.logoUrl ? (
            <img src={profile.logoUrl} alt="Active Corporate Anchor" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <span className="text-xs font-black text-accent-amber bg-accent-amber/10 w-full h-full flex items-center justify-center">
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'OP'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
