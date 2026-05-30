import React from 'react';
import { LayoutDashboard, Sparkles, Plus, Settings } from 'lucide-react';

interface SellerSecondaryNavProps {
  activeTab: 'listings' | 'ai_drafts' | 'create' | 'settings' | 'snap';
  onSetSellerTab: (tab: 'listings' | 'ai_drafts' | 'create' | 'settings' | 'snap') => void;
  listingsCount?: number;
  draftsCount?: number;
}

export default function SellerSecondaryNav({ 
  activeTab, 
  onSetSellerTab,
  listingsCount = 0,
  draftsCount = 0
}: SellerSecondaryNavProps) {
  const tabs = [
    { id: 'listings', name: 'Manage Listings', icon: LayoutDashboard, count: listingsCount },
    { id: 'ai_drafts', name: 'AI Drafts', icon: Sparkles, count: draftsCount },
    { id: 'create', name: 'Create Listing', icon: Plus },
    { id: 'settings', name: 'Yard Profile', icon: Settings },
  ];

  return (
    <nav className="bg-charcoal border-b border-oil-dark text-base-cream h-12 flex items-center shadow-md select-none w-full" id="id-seller-secondary-nav">
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex items-center justify-between h-full">
        <div className="flex items-center gap-6 h-full overflow-x-auto scrollbar-none">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`${tab.id}-${idx}`}
                onClick={() => onSetSellerTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-sans text-xs md:text-sm uppercase tracking-wide transition-all duration-150 cursor-pointer h-full ${
                  isActive
                    ? 'border-rust-copper text-rust-copper font-bold'
                    : 'border-transparent text-warm-gray hover:text-base-cream'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-rust-copper' : 'text-warm-gray'}`} />
                <span>{tab.name}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-rust-copper/25 text-rust-copper border border-rust-copper/20' : 'bg-zinc-800 text-warm-gray'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Lighter accent indicator on the right side of secondary navbar */}
        <div className="hidden sm:flex items-center gap-2 text-[10.5px] uppercase font-mono tracking-wider text-warm-gray select-none">
          <span className="w-1.5 h-1.5 bg-rust-copper rounded-full animate-pulse" />
          <span>Salvage Yard Desk</span>
        </div>
      </div>
    </nav>
  );
}

