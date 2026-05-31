import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Search } from 'lucide-react';
// @ts-ignore
import hero2 from '../../assets/images/hero_2.png';
// @ts-ignore
import hero3 from '../../assets/images/hero_3.png';
// @ts-ignore
import hero4 from '../../assets/images/hero_4.png';
// @ts-ignore
import hero5 from '../../assets/images/hero_5.png';

const HERO_BACKGROUNDS = [
  { id: 'hero2', url: hero2, title: 'Salvage Sunset', desc: 'Active salvage yard stacks' },
  { id: 'hero3', url: hero3, title: 'Tractor Repair Yard', desc: 'Iron Horse agricultural repair' },
  { id: 'hero4', url: hero4, title: 'Muscle Car Shop', desc: 'Vintage dodge restoration workshop' },
  { id: 'hero5', url: hero5, title: 'Repair Garage', desc: 'Pre-vetted mechanical diagnostic deck' }
];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { searchQueryText, setSearchQueryText, setSearchCategory, setSearchModalOpen } = useAppStore();
  const [activeBgIndex, setActiveBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 16000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchCategory('All Parts');
    navigate('/listing');
  };

  return (
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-900">
      {/* Background Images */}
      {HERO_BACKGROUNDS.map((bg, idx) => (
        <div
          key={bg.id}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${idx === activeBgIndex ? 'opacity-40' : 'opacity-0'}`}
        >
          <img src={bg.url} alt={bg.title} className="w-full h-full object-cover scale-105" />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 text-center space-y-8 px-4 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tight leading-tight">
            Real Parts. <span className="text-[#B87333]">Real Savings.</span>
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl font-sans max-w-2xl mx-auto">
            Direct access to vetted salvage yard inventory. Sourced from North America's most trusted dismantlers.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto group">
          <input
            type="text"
            value={searchQueryText}
            onChange={(e) => setSearchQueryText(e.target.value)}
            onFocus={() => setSearchModalOpen(true)}
            placeholder="Search by Part Name, OEM #, or Year/Make/Model..."
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white p-6 pl-14 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B87333] transition-all text-lg"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#B87333] w-6 h-6" />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#B87333] hover:bg-[#A35D1F] text-white px-8 py-3 rounded-sm font-display font-bold uppercase transition-colors">
            Find Part
          </button>
        </form>
      </div>
    </section>
  );
};
