import { useState } from 'react';
import { Play, Volume2, Maximize, Star, Heart, CheckCircle2, ShieldCheck, Mail, SlidersHorizontal, ArrowRight, DollarSign, Lock, AlertTriangle, RefreshCw, Trash2, HelpCircle, Eye, FileText, Check, TrendingUp, Truck, Package, ShoppingCart, X, Database, Wrench, Hammer } from 'lucide-react';
// Removed deprecated import


export default function ComponentLibrary() {
  const [toggleActive, setToggleActive] = useState(true);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSeed = async () => {
    setSeedStatus('loading');
    setSeedStatus('error');
    console.warn('Database seeding functionality is currently unavailable.');
  };

  // Design foundation color list
  const COLORS = [
    { token: 'Steel Black', hex: '#1E1E1E', desc: 'Primary Backgrounds, Navigation panels, dark borders.' },
    { token: 'Charcoal', hex: '#2D2D2D', desc: 'Secondary dark surfaces, core visual container backdrops.' },
    { token: 'Warm Gray', hex: '#8A8A8A', desc: 'Subtle borders, disabled button states, placeholder tags.' },
    { token: 'Base Cream', hex: '#F5F0EB', desc: 'Light Page backgrounds, contrast text backdrops.' },
    { token: 'Rust Copper', hex: '#B87333', desc: 'Primary CTA backgrounds, focus borders, active selections.' },
    { token: 'Bronze', hex: '#8B6239', desc: 'Secondary CTA outlines, hover background states, anchors.' },
    { token: 'Oil Dark', hex: '#3D3632', desc: 'Footer backgrounds, high contrast panel borders.' },
    { token: 'Sage Green', hex: '#7A8B6F', desc: 'Success indicators, "Excellent" condition badges, verified ticks.' },
    { token: 'Warm Sand', hex: '#C4A882', desc: 'Seller specialties background, reviews stars, ratings ticker.' }
  ];

  const BADGES = [
    { text: 'OEM Authentic', bg: 'bg-[#B87333] text-white' },
    { text: 'OEM Original', bg: 'bg-zinc-805 text-amber-500 border border-amber-500/20' },
    { text: 'Excellent', bg: 'bg-[#7A8B6F] text-white' },
    { text: 'Like New', bg: 'bg-[#7A8B6F]/20 text-[#7A8B6F]' },
    { text: 'Good Condition', bg: 'bg-[#C4A882] text-zinc-950 font-semibold' },
    { text: 'Used OEM', bg: 'bg-[#8B6239] text-white' },
    { text: 'For Parts', bg: 'bg-red-800 text-white' },
    { text: 'Untested', bg: 'bg-zinc-500 text-white' },
    { text: 'Trusted Seller', bg: 'bg-emerald-50 text-emerald-800 border border-emerald-250' },
    { text: 'Top Rated', bg: 'bg-amber-100 text-amber-900 border border-amber-250' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans space-y-12 bg-[#F5F0EB]" id="id-blueprint-library-root">
      
      {/* 1. Blueprint Header */}
      <div className="border-b-2 border-zinc-250 pb-6 text-center sm:text-left space-y-2 relative">
        <span className="text-xs bg-zinc-900 text-[#C4A882] font-mono py-1 px-3 rounded uppercase tracking-widest font-bold">
          PartsPeddle Specification Sheet — Ver 1.0
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-[#1E1E1E] tracking-tight pt-2">
          Component Blueprint Library
        </h1>
        <p className="text-sm text-zinc-500 max-w-2xl font-sans">
          Welcome to the PartsPeddle Design System. Designed to accommodate the gritty industrial heritage of salvage yards with modern web standard components.
        </p>

        {/* Branding screw marks decoration */}
        <div className="w-2.5 h-2.5 bg-zinc-400 absolute bottom-1 right-1 rounded-full border border-black/10"></div>
        <div className="w-2.5 h-2.5 bg-zinc-400 absolute bottom-1 left-1 rounded-full border border-black/10"></div>
      </div>

      {/* Supabase Migration Tools (Dev Only) */}
      <section className="bg-zinc-900 text-white p-6 rounded border-2 border-[#B87333] shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-[#B87333]" />
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Supabase Migration & Dev Tools</h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-2xl font-sans">
          Use these tools to manage the transition from mock data to the real Supabase PostgreSQL instance. 
          Ensure <code className="text-amber-500 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-amber-500 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set in your <code className="text-zinc-300">.env</code> file.
        </p>
        <div className="flex items-center gap-4 pt-2">
          <button 
            onClick={handleSeed}
            disabled={seedStatus === 'loading'}
            className="bg-[#B87333] hover:bg-[#8B6239] disabled:opacity-50 text-white font-display font-bold uppercase py-2 px-6 rounded text-xs transition-all flex items-center gap-2"
          >
            {seedStatus === 'loading' ? 'Seeding...' : 'Seed Database from Mocks'}
          </button>
          {seedStatus === 'success' && (
            <span className="text-[#7A8B6F] text-xs font-bold flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Seeding Successful!
            </span>
          )}
          {seedStatus === 'error' && (
            <span className="text-red-500 text-xs font-bold flex items-center gap-1 animate-fade-in">
              <AlertTriangle className="w-4 h-4" /> Seeding Failed. Check Console.
            </span>
          )}
        </div>
      </section>

      {/* 2. Visual Foundation Tokens grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-zinc-250 p-6 rounded shadow-sm">
        
        {/* Colors Token */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold uppercase border-b border-zinc-100 pb-2 text-[#1E1E1E]">
            1. Core Color Palette
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COLORS.map((col) => (
              <div key={col.token} className="border border-zinc-200 rounded overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-10 w-full" style={{ backgroundColor: col.hex }}></div>
                <div className="p-2 bg-[#F5F0EB]/30 space-y-0.5 text-[10px] font-sans">
                  <span className="block font-bold text-zinc-800">{col.token}</span>
                  <span className="block font-mono text-zinc-400">{col.hex}</span>
                  <span className="block text-zinc-500 text-[9px] leading-tight line-clamp-2 pt-1">
                    {col.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Token */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold uppercase border-b border-zinc-100 pb-2 text-[#1E1E1E]">
            2. Typography Scale
          </h2>
          <div className="space-y-4 text-zinc-800 font-sans">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">H1 — Hero headings</span>
              <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none text-[#1E1E1E]">
                REAL PARTS.
              </h1>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">H2 — Section titles</span>
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-[#1E1E1E]">
                Featured Parts Index
              </h2>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">H3 — Subsection tags & card headers</span>
              <h3 className="font-display text-base font-bold uppercase text-[#1E1E1E] tracking-wider">
                1987 Chevy C10 Alternator
              </h3>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">P — Body copy / Informational tags</span>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Salvage yard inventory sourced directly from vetted dismantlers. Authentic OEM components for Chevy C10 restoration and mechanical repair.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Reusable UI Components */}
      <section className="space-y-8">
        <div className="border-b-2 border-zinc-200 pb-2">
          <h2 className="font-display text-2xl font-black uppercase text-[#1E1E1E] tracking-tight">
            3. Master UI Component Elements
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Button Styles */}
          <div className="space-y-6">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#B87333]">Action Buttons</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <button className="bg-[#B87333] hover:bg-[#8B6239] text-white font-display font-bold uppercase py-3 px-8 rounded text-sm transition-all shadow-md">
                Primary CTA
              </button>
              <button className="border-2 border-zinc-900 text-zinc-900 font-display font-bold uppercase py-2.5 px-8 rounded text-sm hover:bg-zinc-900 hover:text-white transition-all">
                Secondary Action
              </button>
              <button className="text-zinc-500 hover:text-[#B87333] font-display font-bold uppercase text-xs tracking-widest transition-colors flex items-center gap-2">
                Ghost Link <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Condition Badges */}
          <div className="space-y-6">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#B87333]">Condition Tags</h3>
            <div className="flex flex-wrap gap-3">
              {BADGES.map((badge) => (
                <span key={badge.text} className={`${badge.bg} text-[10px] font-bold uppercase py-1.5 px-3 rounded tracking-wider shadow-xs`}>
                  {badge.text}
                </span>
              ))}
            </div>
          </div>

          {/* Icon System */}
          <div className="space-y-6">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#B87333]">Mechanical Icon Set</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
              {[Package, ShoppingCart, Truck, Wrench, ShieldCheck, Database, FileText, TrendingUp].map((Icon, idx) => (
                <div key={idx} className="bg-white border border-zinc-100 p-3 rounded flex items-center justify-center hover:border-[#B87333] transition-colors group">
                  <Icon className="w-6 h-6 text-zinc-400 group-hover:text-[#B87333] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Toggle */}
          <div className="space-y-6">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#B87333]">System Controls</h3>
            <div className="flex items-center gap-4 bg-white p-4 rounded border border-zinc-100 shadow-sm w-fit">
              <span className="text-[11px] font-bold uppercase text-zinc-500">Inventory Status</span>
              <button 
                onClick={() => setToggleActive(!toggleActive)}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${toggleActive ? 'bg-[#7A8B6F]' : 'bg-zinc-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${toggleActive ? 'left-7' : 'left-1'}`}></div>
              </button>
              <span className={`text-[11px] font-bold uppercase ${toggleActive ? 'text-[#7A8B6F]' : 'text-zinc-400'}`}>
                {toggleActive ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Mock Viewport Previews */}
      <section className="space-y-8">
        <div className="border-b-2 border-zinc-200 pb-2">
          <h2 className="font-display text-2xl font-black uppercase text-[#1E1E1E] tracking-tight">
            4. Layout Container Structures
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card Mockup */}
          <div className="bg-white border border-zinc-200 rounded overflow-hidden shadow-lg group">
            <div className="h-48 bg-zinc-100 relative">
              <div className="absolute inset-0 flex items-center justify-center text-zinc-300 uppercase font-display font-black text-4xl">Image Frame</div>
              <span className="absolute top-3 left-3 bg-[#B87333] text-white text-[10px] font-bold py-1 px-2 rounded">FEATURED</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-display font-bold uppercase text-[#1E1E1E] group-hover:text-[#B87333] transition-colors">1987 Chevy C10 Alternator</h4>
                  <p className="text-xs text-zinc-500">Powertrain • Charging System</p>
                </div>
                <div className="text-right">
                  <span className="block font-mono font-bold text-lg">$145.00</span>
                  <span className="text-[9px] text-[#7A8B6F] font-bold uppercase tracking-widest">Escrow Ready</span>
                </div>
              </div>
              <button className="w-full py-2.5 border-2 border-zinc-900 text-zinc-900 font-display font-bold uppercase text-xs hover:bg-zinc-900 hover:text-white transition-all">
                Quick View Details
              </button>
            </div>
          </div>

          {/* Information Panel Mockup */}
          <div className="bg-zinc-900 text-white rounded p-8 space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#B87333]/10 -skew-x-12 translate-x-8 -translate-y-8"></div>
             <div className="space-y-2 relative z-10">
               <h4 className="font-display font-black text-xl uppercase tracking-tight">Registry Verified Salvage</h4>
               <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                 All parts listed under the PartsPeddle network are verified by regional yard registrars. Buyers are protected by a 30-day mechanical escrow guarantee.
               </p>
             </div>
             <div className="flex items-center gap-6 relative z-10">
               <div className="flex flex-col gap-1">
                 <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Trust Rating</span>
                 <div className="flex text-amber-500"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Escrow Code</span>
                 <span className="font-mono text-xs text-[#B87333] font-bold">PP-7739-192</span>
               </div>
             </div>
          </div>

        </div>
      </section>

      {/* Blueprint Footer Decals */}
      <div className="pt-12 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-40 grayscale pointer-events-none">
        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
          Ref: PP-SPEC-2024-V1 // DOCUMENT END
        </div>
        <div className="flex items-center gap-6">
          <ShieldCheck className="w-8 h-8 text-zinc-400" />
          <Hammer className="w-8 h-8 text-zinc-400" />
        </div>
      </div>

    </div>
  );
}
