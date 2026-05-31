import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowLeft, 
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  Settings,
  Sparkles,
  Package,
  ChevronDown,
  ChevronRight,
  Search
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { InventoryTable } from './seller-dashboard/InventoryTable';
import { ListingWizard } from './seller-dashboard/ListingWizard';
import { SettingsForm } from './seller-dashboard/SettingsForm';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { 
    activeSellerTab, 
    setActiveSellerTab, 
    logout, 
    profile 
  } = useAppStore();
  
  const [expandedItems, setExpandedItems] = useState<string[]>(['listings']);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'Inventory', icon: Package, children: [
        { id: 'inventory-active', label: 'Active Listings' },
        { id: 'inventory-sold', label: 'Sold' },
        { id: 'inventory-archived', label: 'Archived' }
    ]},
    { id: 'create', label: 'Create Listing', icon: Plus },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'settings', label: 'Yard Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-steel-black select-none text-base-cream isolated-dashboard-context font-sans">
      {/* Sidebar - Viewport Locked */}
      <aside className="w-64 h-full flex flex-col justify-between border-r border-oil-dark shrink-0 bg-charcoal">
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-oil-dark flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rust-copper rounded-lg flex items-center justify-center font-display font-black text-steel-black text-lg shadow-lg shadow-rust-copper/20">
                  P
                </div>
                <div className="space-y-0">
                  <span className="block font-display font-bold uppercase tracking-widest text-xs">PartsPeddle</span>
                  <span className="block text-warm-gray text-[9px] uppercase font-bold tracking-[0.15em]">Terminal V1.4</span>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1 mt-4 custom-scrollbar">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedItems.includes(item.id);
                const hasChildren = !!item.children;
                const isActive = activeSellerTab === item.id;

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => hasChildren ? toggleExpand(item.id) : setActiveSellerTab(item.id as any)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all font-display font-bold uppercase text-[10px] tracking-wider ${
                        isActive 
                          ? 'bg-rust-copper text-steel-black shadow-lg shadow-rust-copper/20' 
                          : 'text-warm-gray hover:bg-oil-dark hover:text-base-cream'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          {item.label}
                      </div>
                      {hasChildren && (
                        isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                    
                    {hasChildren && isExpanded && (
                        <div className="pl-9 pr-1 space-y-0.5 mt-1">
                            {item.children.map(child => (
                                 <button
                                    key={child.id}
                                    onClick={() => setActiveSellerTab(child.id as any)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                                        activeSellerTab === child.id 
                                        ? 'text-rust-copper bg-steel-black/50' 
                                        : 'text-warm-gray hover:text-base-cream'
                                    }`}
                                 >
                                     {child.label}
                                 </button>
                            ))}
                        </div>
                    )}
                  </div>
                );
              })}
            </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-oil-dark space-y-1 flex-shrink-0 bg-charcoal/50">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-warm-gray hover:bg-oil-dark hover:text-base-cream transition-all font-display font-bold uppercase text-[10px] tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Marketplace
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-display font-bold uppercase text-[10px] tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-steel-black">
        {/* Top Header Navigation Panel - Compact */}
        <header className="h-14 border-b border-oil-dark px-8 flex items-center justify-between shrink-0 bg-charcoal/30">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                    <input 
                        type="text" 
                        placeholder="Search yard resources, inventory or VIN..." 
                        className="w-full bg-steel-black border border-oil-dark rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-rust-copper/50 transition-colors text-base-cream"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <span className="block font-display font-bold uppercase text-[10px] text-base-cream tracking-wider">{profile?.name || 'Operator'}</span>
                    <span className="block text-[9px] text-warm-gray font-mono uppercase">{profile?.location || 'Terminal Active'}</span>
                </div>
                <div className="relative">
                    <div className="w-9 h-9 bg-charcoal rounded-lg border border-oil-dark overflow-hidden shadow-sm">
                        {profile?.logoUrl ? <img src={profile.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-rust-copper font-bold">OP</div>}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-sage-green rounded-full border-2 border-steel-black"></div>
                </div>
            </div>
        </header>

        {/* Dynamic Content Body Area - Scroll Contained */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {/* Header Area - Compressed */}
            <div className="mb-6 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-rust-copper/80 block">
                Yard Management Engine
              </span>
              <h1 className="text-2xl font-display font-black uppercase text-base-cream tracking-tight">
                {activeSellerTab === 'listings' && "Active Yard Inventory"}
                {activeSellerTab === 'inventory-active' && "Active Listings"}
                {activeSellerTab === 'inventory-sold' && "Sold Parts History"}
                {activeSellerTab === 'inventory-archived' && "Archived Registry"}
                {activeSellerTab === 'create' && "Manual Intake Terminal"}
                {activeSellerTab === 'snap' && "AI Vision Intake"}
                {activeSellerTab === 'settings' && "Registry Parameters"}
                {activeSellerTab === 'dashboard' && "Yard Overview"}
                {activeSellerTab === 'orders' && "Active Orders"}
              </h1>
            </div>

            {/* Dynamic Views */}
            <div className="animate-fade-in">
              {(activeSellerTab === 'listings' || activeSellerTab.startsWith('inventory')) && <InventoryTable />}
              {activeSellerTab === 'create' && <ListingWizard onClose={() => setActiveSellerTab('listings')} />}
              {activeSellerTab === 'snap' && <ListingWizard onClose={() => setActiveSellerTab('listings')} />}
              {activeSellerTab === 'settings' && <SettingsForm />}
              {activeSellerTab === 'dashboard' && <div className="p-12 text-center text-warm-gray font-mono text-xs uppercase tracking-widest bg-charcoal/20 border border-dashed border-oil-dark rounded-xl">Yard Analytics Terminal Under Construction</div>}
              {activeSellerTab === 'orders' && <div className="p-12 text-center text-warm-gray font-mono text-xs uppercase tracking-widest bg-charcoal/20 border border-dashed border-oil-dark rounded-xl">Orders Pipeline Integration Pending</div>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
