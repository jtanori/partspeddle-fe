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
    <div className="min-h-screen bg-[#F5F0EB] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col fixed inset-y-0">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#B87333] rounded-xl flex items-center justify-center font-display font-black text-white text-xl shadow-lg shadow-[#B87333]/20">
              P
            </div>
            <div className="space-y-0.5">
              <span className="block font-display font-bold uppercase tracking-widest text-sm">PartsPeddle</span>
              <span className="block text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em]">Seller Console</span>
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
                    ? 'bg-[#B87333] text-white shadow-lg shadow-[#B87333]/20' 
                    : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all font-display font-bold uppercase text-xs tracking-wider"
          >
            <ArrowLeft className="w-5 h-5" />
            Marketplace
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/70 hover:bg-red-500/5 hover:text-red-500 transition-all font-display font-bold uppercase text-xs tracking-wider"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex items-end justify-between border-b-2 border-zinc-200 pb-8">
            <div className="space-y-2">
              <span className="text-[#B87333] font-display font-bold uppercase tracking-widest text-sm">
                {sidebarItems.find(i => i.id === activeSellerTab)?.label || 'Dashboard'}
              </span>
              <h1 className="text-4xl font-display font-black uppercase text-zinc-900 tracking-tight">
                {activeSellerTab === 'listings' && "Yard Inventory"}
                {activeSellerTab === 'create' && "Manual Listing Entry"}
                {activeSellerTab === 'snap' && "Gemini AI Snap"}
                {activeSellerTab === 'settings' && "Registry Settings"}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block font-display font-bold uppercase text-zinc-900">{profile.name}</span>
                <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{profile.location}</span>
              </div>
              <div className="w-12 h-12 bg-zinc-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                {profile.logoUrl ? <img src={profile.logoUrl} className="w-full h-full object-cover" /> : <LayoutDashboard className="w-full h-full p-3 text-zinc-400" />}
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
