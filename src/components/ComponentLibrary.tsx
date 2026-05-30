import { useState } from 'react';
import { Play, Volume2, Maximize, Star, Heart, CheckCircle2, ShieldCheck, Mail, SlidersHorizontal, ArrowRight, DollarSign, Lock, AlertTriangle, RefreshCw, Trash2, HelpCircle, Eye, FileText, Check, TrendingUp, Truck, Package, ShoppingCart, X } from 'lucide-react';

export default function ComponentLibrary() {
  const [toggleActive, setToggleActive] = useState(true);

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
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">Body — Standard paragraphs</span>
              <p className="text-sm text-zinc-650 leading-relaxed font-sans max-w-sm">
                Carefully harvested from running projects. Includes V-belt setups, 12V outputs, and certified testing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Button System showcasing states */}
      <section className="bg-white border border-zinc-250 p-6 rounded shadow-sm space-y-6">
        <h2 className="font-display text-xl font-bold uppercase border-b border-zinc-100 pb-2 text-[#1E1E1E]">
          3. Sourced Button System
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          
          {/* Primary Button options */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Primary (Rust Accent)</span>
            <button className="w-full bg-[#B87333] hover:bg-[#8B6239] text-white font-display text-xs font-bold uppercase tracking-wider py-2.5 rounded shadow-sm cursor-pointer">
              Search Parts
            </button>
            <button className="w-full bg-[#B87333]/60 text-white/50 font-display text-xs font-bold uppercase tracking-wider py-2.5 rounded cursor-not-allowed">
              Search Parts (Disable)
            </button>
          </div>

          {/* Secondary Button options */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Secondary (Bronze Outline)</span>
            <button className="w-full border-2 border-zinc-800 text-zinc-800 hover:bg-zinc-50 font-display text-xs font-bold uppercase tracking-wider py-2 rounded transition-colors cursor-pointer">
              View Details
            </button>
            <button className="w-full border-2 border-zinc-300 text-zinc-400 font-display text-xs font-bold uppercase tracking-wider py-2 rounded cursor-not-allowed">
              View Details (Disable)
            </button>
          </div>

          {/* Tertiary Button options */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Tertiary (Text style)</span>
            <button className="w-full text-[#B87333] hover:text-[#8B6239] transition-colors font-display text-xs font-bold uppercase tracking-widest py-2 hover:underline cursor-pointer">
              Add To List
            </button>
            <button className="w-full text-zinc-300 font-display text-xs font-bold uppercase tracking-widest py-2 cursor-not-allowed">
              Add To List (Disable)
            </button>
          </div>

          {/* Danger Button options */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Danger actions</span>
            <button className="w-full bg-red-850 hover:bg-red-900 text-white font-display text-xs font-bold uppercase tracking-wider py-2.5 rounded cursor-pointer">
              Remove Item
            </button>
            <button className="w-full bg-red-200 text-white/90 font-display text-xs font-bold uppercase tracking-wider py-2.5 rounded cursor-not-allowed">
              Remove (Disable)
            </button>
          </div>

        </div>
      </section>

      {/* 4. Inputs, Badges, and Metal Plates */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-zinc-250 p-6 rounded shadow-sm">
        
        {/* Form elements and slider inputs */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold uppercase border-b border-zinc-100 pb-2 text-[#1E1E1E]">
            4. Inputs & Fields
          </h2>

          <div className="space-y-4 font-sans text-xs text-zinc-650">
            <div>
              <label className="text-[10px] font-display font-bold uppercase tracking-wider block mb-1 text-zinc-700">
                Text input (Normal)
              </label>
              <input 
                type="text" 
                placeholder="Search by part, make, model..."
                className="w-full bg-[#F5F0EB]/40 border border-zinc-300 rounded px-3 py-2 text-sm text-[#1E1E1E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-display font-bold uppercase tracking-wider block mb-1 text-zinc-700">
                Text input (Focused)
              </label>
              <input 
                type="text" 
                value="1987 Chevy C10 Alternator"
                readOnly
                className="w-full bg-[#F5F0EB]/45 border-2 border-[#B87333] rounded px-3 py-1.5 text-sm text-[#1E1E1E] focus:outline-none"
              />
            </div>

            {/* Simulated selector dropdowns */}
            <div>
              <label className="text-[10px] font-display font-bold uppercase tracking-wider block mb-1 text-zinc-700">
                Select Dropdown
              </label>
              <select className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-sm text-[#1E1E1E] focus:outline-none">
                <option>All Vintage Categories</option>
                <option>Electrical</option>
                <option>Engines</option>
              </select>
            </div>

            {/* Simulated Multi-Select chips */}
            <div>
              <label className="text-[10px] font-display font-bold uppercase tracking-wider block mb-1 text-zinc-700">
                Multi-Select Filter Chips
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 bg-[#B87333]/15 text-[#B87333] border border-[#B87333]/25 px-2 py-1 rounded text-xs font-semibold">
                  <span>Engine & Parts</span>
                  <X className="w-3.5 h-3.5 cursor-pointer" />
                </span>
                <span className="inline-flex items-center gap-1 bg-[#B87333]/15 text-[#B87333] border border-[#B87333]/25 px-2 py-1 rounded text-xs font-semibold">
                  <span>Transmission</span>
                  <X className="w-3.5 h-3.5 cursor-pointer" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags, Badges, & Metal plates showcase */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold uppercase border-b border-[#F5F0EB] pb-2 text-[#1E1E1E]">
            5. Spec Decals & Plates
          </h2>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 pt-1">
              {BADGES.map((badge, i) => (
                <span key={i} className={`text-[10px] font-display font-bold uppercase tracking-widest py-1 px-3.5 rounded-sm block ${badge.bg}`}>
                  {badge.text}
                </span>
              ))}
            </div>

            {/* Space scale & Radius helper tokens from specification */}
            <div className="bg-[#F5F0EB]/50 p-4 rounded border border-zinc-200/60 space-y-3">
              <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-[#8A8A8A] block">
                Radius & Spacing Token Scale
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="bg-white border p-2 rounded">
                  <span className="block font-bold">4px Base</span>
                  <span className="text-[9px] text-[#8A8A8A]">Extra Cond</span>
                </div>
                <div className="bg-white border p-2 rounded-sm">
                  <span className="block font-bold">6px Small</span>
                  <span className="text-[9px] text-[#8A8A8A]">Input fields</span>
                </div>
                <div className="bg-white border p-2 rounded-md">
                  <span className="block font-bold">8px Medium</span>
                  <span className="text-[9px] text-[#8A8A8A]">Card elements</span>
                </div>
                <div className="bg-white border p-2 rounded-lg">
                  <span className="block font-bold">12px Large</span>
                  <span className="text-[9px] text-[#8A8A8A]">Feature Blocks</span>
                </div>
              </div>
            </div>

            {/* Vintage Metal serial tag - Gold/Rust Plate */}
            <div className="space-y-2">
              <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-[#8A8A8A] block">
                OEM Heavy Metal Plaque Authenticator
              </span>
              <div className="p-4 rounded bg-gradient-to-br from-[#8B6239] via-[#C4A882] to-[#B87333] border-2 border-amber-900/60 text-[#1E1E1E] relative shadow-lg overflow-hidden block w-full max-w-sm" id="spec-authenticator-tag">
                {/* Vintage metallic plate corner screws */}
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 absolute top-1.5 left-1.5 border border-zinc-650 flex items-center justify-center font-mono text-[6px] text-zinc-600 font-bold">＋</div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 absolute top-1.5 right-1.5 border border-zinc-650 flex items-center justify-center font-mono text-[6px] text-zinc-600 font-bold">＋</div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 absolute bottom-1.5 left-1.5 border border-zinc-650 flex items-center justify-center font-mono text-[6px] text-zinc-600 font-bold">＋</div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 absolute bottom-1.5 right-1.5 border border-zinc-650 flex items-center justify-center font-mono text-[6px] text-zinc-600 font-bold">＋</div>

                <div className="flex items-center justify-between border-b border-black/10 pb-1.5 text-xs">
                  <span className="font-mono text-[8px] text-zinc-900 font-black uppercase tracking-widest leading-none">REGISTRY SPEC</span>
                  <span className="font-mono text-[9px] text-zinc-950 font-black tracking-wider leading-none">★ OEM AUTHENTIC</span>
                </div>
                <div className="text-center py-2.5">
                  <span className="font-display font-black text-2xl tracking-widest text-zinc-950 uppercase block select-all">
                    PP-08311972
                  </span>
                  <p className="text-[8px] text-zinc-900 font-mono tracking-widest uppercase font-black mt-1 leading-none">
                    ★ REBUILT CHASSIS CERTIFIED ★
                  </p>
                </div>
              </div>
            </div>

            {/* Breadcrumbs Spec and Value tickers to fulfill specification */}
            <div className="space-y-2">
              <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-[#8A8A8A] block">
                Breadcrumbs Navigation Component & Rating Modules
              </span>
              <div className="bg-white border p-3.5 rounded space-y-3.5">
                {/* Component breadcrumbs */}
                <div className="text-xs text-zinc-500 font-sans flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-[#B87333]">Home</span>
                  <span>/</span>
                  <span className="font-semibold text-zinc-700">Engines & Parts</span>
                  <span>/</span>
                  <span className="font-semibold text-zinc-700">Alternators</span>
                  <span>/</span>
                  <span className="font-bold text-[#1E1E1E]">1987 Chevy C10 Alternator</span>
                </div>

                {/* Rating display */}
                <div className="flex items-center gap-4 border-t border-zinc-100 pt-3">
                  <div>
                    <span className="text-[9px] font-mono text-[#8A8A8A] uppercase block">Price Display</span>
                    <span className="font-display font-black text-lg text-zinc-900">$42.00</span>
                    <span className="text-[9.5px] text-zinc-400 select-none ml-1 line-through">$65.00</span>
                    <span className="text-[9.5px] text-[#7A8B6F] font-bold ml-1">Save 35%</span>
                  </div>
                  <div className="border-l border-zinc-200 pl-4">
                    <span className="text-[9px] font-mono text-[#8A8A8A] uppercase block">Ratings Metric</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span className="font-mono text-sm font-black text-zinc-900">4.8</span>
                      <span className="text-[10px] text-zinc-400 font-medium">(342 verified sales)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Guided Tooltip tutorial mockup */}
      <section className="bg-white border border-zinc-250 p-6 rounded shadow-sm space-y-4 max-w-xl mx-auto">
        <h2 className="font-display text-xl font-bold uppercase border-b border-zinc-100 pb-2 text-center text-[#1E1E1E]">
          6. Onboarding Tooltip Module
        </h2>

        <div className="bg-[#2D2D2D] border border-[#B87333] p-4 rounded text-white shadow-xl flex flex-col justify-between space-y-4 relative">
          {/* Rivets decoration */}
          <div className="w-1 h-1 rounded-full bg-zinc-500 absolute top-1 left-1"></div>
          <div className="w-1 h-1 rounded-full bg-zinc-500 absolute top-1 right-1"></div>

          <div className="flex items-center justify-between text-[11px] text-[#C4A882]">
            <span className="font-display font-medium tracking-wide uppercase">Welcome to PartsPeddle</span>
            <span className="font-mono bg-zinc-800 py-0.5 px-1.5 rounded text-zinc-300">1 of 5</span>
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
              Search & Discover Autoparts
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Type a part name, OEM number, make, or dynamic VIN code right in our search bar. Autocomplete returns instant matching specs from Algolia.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#3D3632]">
            <span className="text-[10px] text-zinc-400 font-mono">Skip Tour</span>
            <button className="bg-[#B87333] text-white text-[10px] font-display uppercase tracking-widest py-1 px-4 rounded-sm font-bold flex items-center gap-1">
              <span>Next</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Professional Dashboard Widgets (Figure 9 details!) */}
      <section className="bg-white border border-zinc-250 p-6 rounded shadow-sm space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold uppercase text-[#1E1E1E]">
            7. Seller Workspace Dashboard Components
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Heavy-duty control widgets representing active ledger updates, ship pipelines, and tracking registers
          </p>
        </div>

        {/* Dashboard Analytics grid block */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F5F0EB]/50 border border-zinc-200 shadow-inner rounded space-y-1 text-center font-sans">
            <span className="text-[10px] uppercase font-display font-black tracking-widest text-zinc-500">Active Stock</span>
            <span className="block font-display text-3xl font-bold text-zinc-800">1,248</span>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +15.2% views
            </span>
          </div>

          <div className="p-4 bg-[#F5F0EB]/50 border border-zinc-200 shadow-inner rounded space-y-1 text-center font-sans">
            <span className="text-[10px] uppercase font-display font-black tracking-widest text-zinc-500">Sales Value</span>
            <span className="block font-display text-3xl font-bold text-zinc-800">$28,450</span>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +8.4% growth
            </span>
          </div>

          <div className="p-4 bg-[#F5F0EB]/50 border border-zinc-200 shadow-inner rounded space-y-1 text-center font-sans">
            <span className="text-[10px] uppercase font-display font-black tracking-widest text-zinc-500">Unanswered offers</span>
            <span className="block font-display text-3xl font-bold text-zinc-800">12</span>
            <span className="text-[10px] text-zinc-400">Needs immediate review</span>
          </div>

          <div className="p-4 bg-[#F5F0EB]/50 border border-zinc-200 shadow-inner rounded space-y-1 text-center font-sans">
            <span className="text-[10px] uppercase font-display font-black tracking-widest text-zinc-500">Yard messages</span>
            <span className="block font-display text-3xl font-bold text-zinc-800">18</span>
            <span className="text-[10px] text-amber-700 font-semibold uppercase font-display">6 Actions Today</span>
          </div>
        </div>

        {/* Inventory list table */}
        <div className="space-y-3 pt-4 border-t border-zinc-150">
          <span className="text-xs uppercase font-display font-bold tracking-wider text-zinc-700 block">
            Yard Inventory Register (Figure 9 grid)
          </span>

          <div className="overflow-x-auto border border-zinc-150 rounded">
            <table className="w-full text-left text-xs text-zinc-650 divide-y divide-zinc-200 font-sans">
              <thead className="bg-[#F5F0EB]/60 text-zinc-700 font-display font-bold uppercase text-[9px] tracking-widest">
                <tr>
                  <th className="py-2.5 px-3">Part Details</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">List Price</th>
                  <th className="py-2.5 px-3 text-center">Inquiry Views</th>
                  <th className="py-2.5 px-3 text-right">Escrow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-sans">
                <tr>
                  <td className="py-2 px-3">
                    <span className="font-semibold block text-zinc-900">1987 Chevy C10 Alternator</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Stock # RAS-24-0515</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="bg-[#7A8B6F] text-white text-[9px] font-display font-bold px-1.5 py-0.5 rounded uppercase">
                      Good Condition
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-zinc-900">$42.00</td>
                  <td className="py-2 px-3 text-center font-mono text-zinc-500">342</td>
                  <td className="py-2 px-3 text-right">
                    <button className="text-[10px] border border-zinc-300 text-zinc-600 font-semibold py-1 px-3.5 hover:border-zinc-850 rounded">
                      Manage Listing
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">
                    <span className="font-semibold block text-zinc-900">TH400 Automatic Transmission</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Stock # BPC-TH400-083</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="bg-zinc-800 text-amber-500 text-[9px] font-display font-bold px-1.5 py-0.5 rounded uppercase">
                      OEM Original
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-zinc-900">$325.00</td>
                  <td className="py-2 px-3 text-center font-mono text-zinc-500">480</td>
                  <td className="py-2 px-3 text-right">
                    <button className="text-[10px] border border-zinc-300 text-zinc-600 font-semibold py-1 px-3.5 hover:border-zinc-850 rounded">
                      Manage Listing
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipment pipeline flow tracker (Figure 9 details) */}
        <div className="space-y-4 pt-4 border-t border-zinc-150">
          <span className="text-xs uppercase font-display font-bold tracking-wider text-zinc-700 block">
            Active Freight Tracking pipeline
          </span>

          <div className="p-5 bg-[#F5F0EB]/50 border border-zinc-200 rounded grid grid-cols-1 md:grid-cols-4 gap-6 relative" id="id-dashboard-tracker">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#B87333] text-white flex items-center justify-center font-black text-xs font-mono shadow">✓</div>
              <div className="space-y-0.5">
                <span className="block font-bold text-xs text-zinc-800 uppercase tracking-tight">Order Placed</span>
                <span className="block text-[10px] text-zinc-400 font-mono">May 12, 11:32 AM</span>
              </div>
            </div>

            <div className="flex items-center gap-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#B87333] text-white flex items-center justify-center font-black text-xs font-mono shadow">✓</div>
              <div className="space-y-0.5">
                <span className="block font-bold text-xs text-zinc-800 uppercase tracking-tight">Yard Shipped</span>
                <span className="block text-[10px] text-zinc-400 font-mono">May 13, 1:45 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#B87333] text-white flex items-center justify-center font-black text-xs font-mono shadow">✓</div>
              <div className="space-y-0.5">
                <span className="block font-bold text-xs text-zinc-800 uppercase tracking-tight">In-Transit</span>
                <span className="block text-[10px] text-zinc-400 font-mono">Carrier: ESTES Freight</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-300 text-zinc-650 flex items-center justify-center font-bold text-xs font-mono">4</div>
              <div className="space-y-0.5">
                <span className="block font-bold text-xs text-zinc-500 uppercase tracking-tight">Out for Delivery</span>
                <span className="block text-[10px] text-zinc-400">Scheduled May 17</span>
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
