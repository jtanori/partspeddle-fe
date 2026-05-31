import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Award, Wrench, Car, Compass, Disc, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
// @ts-ignore
import hero1 from '../../assets/images/hero_1.png';

export const HighFidelityHero: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUserRole, setActiveSellerTab, setTourActive } = useAppStore();

  return (
    <section className="relative bg-[#0E0E0E] text-white py-12 px-4 md:py-20 overflow-hidden" id="hero-banner">
      {/* Static Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url("${hero1}")`, opacity: 0.85 }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fade-in z-10">
        <div className="md:col-span-8 lg:col-span-7 xl:col-span-6 space-y-6">
          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-tight leading-none text-left">
              KEEP EQUIPMENT WORKING.<br />
              <span className="text-[#C4A882]">BUY. SELL. TRADE PARTS LOCALLY.</span>
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-350 max-w-lg leading-relaxed text-left">
              The marketplace for auto and farm parts — built for mechanics, enthusiasts, farmers, salvage yards, and independent sellers.
            </p>
          </div>

          <div className="bg-zinc-950/75 backdrop-blur-md rounded-sm border border-zinc-900 p-5 shadow-2xl space-y-4 max-w-xl text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/80">
              {/* BUYERS */}
              <div className="space-y-2.5 pr-0 sm:pr-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B87333]"></span>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">FOR BUYERS</h4>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">Locate hard-to-find components, verify fitment, and order safely from vetted yards.</p>
                <button onClick={() => navigate('/listing')} className="w-full bg-[#1A1A1A] hover:bg-[#252525] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded px-3 py-2 text-xs font-bold font-sans tracking-wide transition-all flex items-center justify-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Search Inventory</span>
                </button>
              </div>

              {/* SELLERS */}
              <div className="space-y-2.5 pt-4 sm:pt-0 pl-0 sm:pl-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B87333]"></span>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">FOR SELLERS</h4>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">Clean out mechanical storage backlogs, list active dismantlers, and secure payouts.</p>
                <button
                  onClick={() => {
                    if (user) {
                      setUserRole('seller');
                      setActiveSellerTab('listings');
                      navigate('/dashboard');
                    } else {
                      navigate('/auth?role=seller&mode=signup');
                    }
                  }}
                  className="w-full flex items-center justify-center border border-[#4d3119] border-t-[#8e6e4f] border-b-[#24170d] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_3px_rgba(0,0,0,0.65),0_1px_2px_rgba(0,0,0,0.35)] text-stone-100 hover:text-white rounded px-3 py-2 text-xs font-bold font-sans tracking-wide active:translate-y-[0.5px] transition-all relative overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(139, 98, 57, 0.95), rgba(92, 62, 33, 0.98)), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='brushed'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.12 0.03' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0 0 0 0'/%3E%3C/filter%3E%3Cfilter id='rust'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23brushed)' opacity='0.45'/%3E%3Crect width='100%25' height='100%25' filter='url(%23rust)' opacity='0.35' mix-blend-mode='color-burn'/%3E%3C/svg%3E")`,
                    backgroundBlendMode: 'overlay',
                  }}
                >
                  <span className="relative z-10">SELL PARTS</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-center border-t border-zinc-900/60">
              <button onClick={() => setTourActive(true)} className="text-[11px] text-zinc-400 hover:text-[#B87333] transition-colors font-sans inline-flex items-center gap-1">
                <span>How Peer-to-Peer Trading Works</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-w-xl text-left">
            {[
              { icon: Award, label: 'Verified Sellers' },
              { icon: Wrench, label: 'Farm Equipment' },
              { icon: Car, label: 'Auto Parts' },
              { icon: Compass, label: 'Local Pickup' },
              { icon: Disc, label: 'Nationwide Shipping' },
              { icon: ShieldCheck, label: 'Buyer Protection' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-900/40 p-2 rounded-xs">
                <item.icon className="w-4 h-4 text-[#B87333] shrink-0" />
                <span className="text-[10.5px] text-zinc-300 font-sans tracking-wide font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
