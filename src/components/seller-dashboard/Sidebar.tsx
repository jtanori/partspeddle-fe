import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { LayoutDashboard, Package, PlusSquare, ShoppingBag, Settings, LogOut, ArrowLeftRight, ChevronDown, ChevronRight } from 'lucide-react';

export const SellerSidebar: React.FC = () => {
  const { logout } = useAppStore();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/dashboard/inventory']);

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]);
  };

  const navItems = [
    { href: '/dashboard', label: 'OVERVIEW', icon: LayoutDashboard, exact: true },
    { 
      href: '/dashboard/inventory', 
      label: 'INVENTORY', 
      icon: Package,
      children: [
        { href: '/dashboard/inventory/active', label: 'ACTIVE LISTINGS' },
        { href: '/dashboard/inventory/sold', label: 'SOLD' },
        { href: '/dashboard/inventory/archived', label: 'ARCHIVED' }
      ]
    },
    { href: '/dashboard/create', label: 'CREATE LISTING', icon: PlusSquare },
    { href: '/dashboard/orders', label: 'ORDERS', icon: ShoppingBag },
    { href: '/dashboard/settings', label: 'YARD SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full flex flex-col justify-between border-r border-amber-500/10 p-4 shrink-0 bg-neutral-950 font-mono text-xs select-none">
      <div className="space-y-6">
        {/* Brand Anchor: Official Hexagonal 'P' Construction */}
        <Link to="/" className="flex items-center gap-3 px-2 py-1 group border-b border-dashed border-zinc-800 pb-4">
          <div className="w-9 h-9 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 115" className="w-full h-full drop-shadow-[0_0_6px_rgba(245,158,11,0.3)] group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] transition-all" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Perfect Hexagonal Boundary Shield */}
              <polygon points="50,5 95,31.25 95,83.75 50,110 5,83.75 5,31.25" stroke="url(#amberGradient)" strokeWidth="8" strokeLinejoin="miter" />
              {/* Sharp Technical Inner Custom "P" Character Grid */}
              <path d="M35 30 H65 C75 30 75 48 65 48 H35 V85 M35 48 H60 C66 48 66 30 60 30" stroke="url(#amberGradient)" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" />
              <defs>
                <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black tracking-tighter text-sm text-neutral-100 leading-none group-hover:text-amber-400 transition-colors">
              PARTSPEDDLE
            </span>
            <span className="text-[9px] text-amber-500/60 uppercase tracking-widest mt-0.5 font-bold">
              Terminal v1.4
            </span>
          </div>
        </Link>

        {/* Operational Context Tabs - Route Driven */}
        <nav className="space-y-1">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isExpanded = expandedItems.includes(tab.href);
            const hasChildren = !!tab.children;
            const isActive = tab.exact 
              ? location.pathname === tab.href 
              : location.pathname.startsWith(tab.href);

            return (
              <div key={tab.href}>
                <div className="flex items-center">
                  <Link
                    to={tab.href}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 transition-all duration-150 border-l-2 ${
                      isActive
                        ? 'border-amber-500 text-amber-400 bg-amber-500/5 font-bold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </Link>
                  {hasChildren && (
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleExpand(tab.href); }}
                      className="p-2 text-zinc-600 hover:text-amber-500 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                
                {hasChildren && isExpanded && (
                  <div className="pl-10 pr-2 space-y-1 mt-1 border-l border-zinc-800 ml-5">
                    {tab.children.map(child => {
                      const isChildActive = location.pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`block py-1.5 px-2 text-[10px] transition-colors ${
                            isChildActive 
                              ? 'text-amber-500 font-bold' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* High-Visibility Exit / Portal Controls */}
      <div className="border-t border-dashed border-zinc-800 pt-4 space-y-1">
        <Link
          to="/listing"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-amber-500/20 bg-amber-500/5 text-amber-400 font-bold hover:bg-amber-500/10 transition-all shadow-[0_0_8px_rgba(245,158,11,0.05)]"
        >
          <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          <span className="tracking-wide uppercase">PUBLIC MARKETPLACE</span>
        </Link>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-red-950/20 transition-all text-left"
        >
          <LogOut className="w-4 h-4 text-red-500/60" />
          <span className="uppercase">SIGN OUT TERMINAL</span>
        </button>
      </div>
    </aside>
  );
};
