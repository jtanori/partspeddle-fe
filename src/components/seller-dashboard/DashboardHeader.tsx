import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Search, Building2, MapPin } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const { profile } = useAppStore();

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between shrink-0 font-mono text-xs">
      {/* Central Input Search Context */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search yard resources, inventory database or VIN indexes..."
          className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-sm pl-9 pr-4 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 text-[11px] font-mono transition-colors"
        />
      </div>

      {/* Business Identity Node Workspace */}
      <div className="flex items-center gap-4 border-l border-zinc-800 pl-4 h-full">
        <div className="text-right flex flex-col justify-center">
          <div className="flex items-center gap-1.5 justify-end">
            <Building2 className="w-3 h-3 text-amber-500/70" />
            <span className="text-zinc-100 font-bold tracking-tight text-[11px] uppercase">
              {profile?.name || 'Unnamed Recovery Yard'}
            </span>
          </div>
          <div className="flex items-center gap-1 justify-end text-[10px] text-zinc-500 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-zinc-600" />
            <span>{profile?.location || 'Operational Base Unset'}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 animate-pulse" />
          </div>
        </div>

        {/* Dynamic Corporate Logo Profile Node */}
        <div className="w-8 h-8 rounded-sm border border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_4px_rgba(0,0,0,0.5)]">
          {profile?.logoUrl ? (
            <img src={profile.logoUrl} alt="Active Corporate Anchor" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 w-full h-full flex items-center justify-center">
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'OP'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
