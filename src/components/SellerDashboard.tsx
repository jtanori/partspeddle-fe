import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowLeft, 
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  Settings,
  Sparkles,
  Package
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

  const sidebarItems = [
    { id: 'listings', label: 'Inventory', icon: Package },
    { id: 'create', label: 'Add Listing', icon: Plus },
    { id: 'snap', label: 'AI Snap', icon: Sparkles },
    { id: 'settings', label: 'Yard Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-steel-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal text-base-cream flex flex-col fixed inset-y-0 border-r border-oil-dark">
        <div className="p-8 border-b border-oil-dark">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rust-copper rounded-xl flex items-center justify-center font-display font-black text-steel-black text-xl shadow-lg shadow-rust-copper/20">
              P
            </div>
            <div className="space-y-0.5">
              <span className="block font-display font-bold uppercase tracking-widest text-sm">PartsPeddle</span>
              <span className="block text-warm-gray text-[10px] uppercase font-bold tracking-[0.2em]">Seller Console</span>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2 mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSellerTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-display font-bold uppercase text-xs tracking-wider ${
                  activeSellerTab === item.id 
                    ? 'bg-rust-copper text-steel-black shadow-lg shadow-rust-copper/20' 
                    : 'text-warm-gray hover:bg-oil-dark hover:text-base-cream'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-oil-dark space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-warm-gray hover:bg-oil-dark hover:text-base-cream transition-all font-display font-bold uppercase text-xs tracking-wider"
          >
            <ArrowLeft className="w-5 h-5" />
            Marketplace
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-display font-bold uppercase text-xs tracking-wider"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-12 bg-base-cream">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex items-end justify-between border-b-2 border-oil-dark pb-8">
            <div className="space-y-2">
              <span className="text-rust-copper font-display font-bold uppercase tracking-widest text-sm">
                {sidebarItems.find(i => i.id === activeSellerTab)?.label || 'Dashboard'}
              </span>
              <h1 className="text-4xl font-display font-black uppercase text-steel-black tracking-tight">
                {activeSellerTab === 'listings' && "Yard Inventory"}
                {activeSellerTab === 'create' && "Manual Listing Entry"}
                {activeSellerTab === 'snap' && "Gemini AI Snap"}
                {activeSellerTab === 'settings' && "Registry Settings"}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block font-display font-bold uppercase text-steel-black">{profile.name}</span>
                <span className="block text-[10px] text-warm-gray font-bold uppercase tracking-widest">{profile.location}</span>
              </div>
              <div className="w-12 h-12 bg-oil-dark rounded-full overflow-hidden border-2 border-rust-copper shadow-sm">
                {profile.logoUrl ? <img src={profile.logoUrl} className="w-full h-full object-cover" /> : <LayoutDashboard className="w-full h-full p-3 text-warm-gray" />}
              </div>
            </div>
          </div>

          {/* Dynamic Views */}
          <div className="animate-fade-in">
            {activeSellerTab === 'listings' && <InventoryTable />}
            {activeSellerTab === 'snap' && <ListingWizard />}
            {activeSellerTab === 'settings' && <SettingsForm />}
            {activeSellerTab === 'create' && (
              <div className="bg-white p-20 rounded-2xl border border-zinc-200 border-dashed text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-zinc-300" />
                </div>
                <h3 className="font-display font-bold uppercase text-zinc-500">Manual Entry Form Implementation</h3>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">Manual listing entry is currently being migrated to the standardized Supabase schema.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
