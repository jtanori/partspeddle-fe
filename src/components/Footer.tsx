import { Share2, Lock, Mail, ShieldAlert, FileText, Info } from 'lucide-react';
import logoImg from '../assets/images/logo_solid.png';

interface FooterProps {
  onChangeView: (view: string) => void;
  onOpenModal?: (type: 'about' | 'privacy' | 'terms' | 'contact') => void;
}

export default function Footer({ onChangeView, onOpenModal }: FooterProps) {
  const handleModalClick = (type: 'about' | 'privacy' | 'terms' | 'contact') => {
    if (onOpenModal) {
      onOpenModal(type);
    }
  };

  return (
    <footer className="bg-steel-black text-warm-gray font-sans border-t border-oil-dark">
      {/* Upper Footer section */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-12 gap-8">
        
        {/* Company statement and Social channels */}
        <div className="sm:col-span-4 lg:col-span-5 space-y-4">
          <div 
            onClick={() => onChangeView('home')} 
            className="flex items-center cursor-pointer group select-none flex-shrink-0 transition-transform duration-300 hover:scale-[1.03] bg-transparent"
            id="footer-logo"
          >
            <img 
              src={logoImg.src} 
              alt="PartsPeddle Logo" 
              className="w-[200px] h-auto object-contain filter drop-shadow bg-transparent" 
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-sm text-warm-gray max-w-sm leading-relaxed">
            The professional marketplace for quality used OEM auto parts. Sourced directly from trusted salvage yards. Real parts, real people, real savings.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a href="#facebook" className="p-2 bg-charcoal hover:bg-oil-dark rounded-md text-warm-gray hover:text-rust-copper transition-colors">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#instagram" className="p-2 bg-charcoal hover:bg-oil-dark rounded-md text-warm-gray hover:text-rust-copper transition-colors">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#youtube" className="p-2 bg-charcoal hover:bg-oil-dark rounded-md text-warm-gray hover:text-rust-copper transition-colors">
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Shop category links */}
        <div className="sm:col-span-2 lg:col-span-2">
          <h4 className="font-display text-sm font-semibold text-white tracking-widest uppercase mb-4">
            Shop Parts
          </h4>
          <ul className="space-y-2 text-sm text-warm-gray">
            <li>
              <button onClick={() => onChangeView('listing')} className="hover:text-white transition-colors text-left cursor-pointer">
                Browse Parts
              </button>
            </li>
            <li>
              <button onClick={() => onChangeView('home')} className="hover:text-white transition-colors text-left cursor-pointer">
                All Categories
              </button>
            </li>
            <li>
              <button onClick={() => onChangeView('listing')} className="hover:text-white transition-colors text-left cursor-pointer">
                Search Parts Index
              </button>
            </li>
            <li>
              <button onClick={() => onChangeView('listing')} className="hover:text-white transition-colors text-left cursor-pointer">
                New Listings
              </button>
            </li>
          </ul>
        </div>

        {/* About Pages links */}
        <div className="sm:col-span-3 lg:col-span-2">
          <h4 className="font-display text-sm font-semibold text-white tracking-widest uppercase mb-4">
            About Company
          </h4>
          <ul className="space-y-2 text-sm text-warm-gray">
            <li>
              <button onClick={() => handleModalClick('about')} className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                <Info className="w-3.5 h-3.5 text-rust-copper" />
                <span>About PartsPeddle</span>
              </button>
            </li>
            <li>
              <button onClick={() => onChangeView('component-library')} className="hover:text-white transition-colors text-left cursor-pointer">
                Showroom components
              </button>
            </li>
            <li>
              <button onClick={() => handleModalClick('about')} className="hover:text-white transition-colors text-left cursor-pointer">
                Salvage Network
              </button>
            </li>
            <li>
              <button onClick={() => handleModalClick('about')} className="hover:text-white transition-colors text-left cursor-pointer">
                Trust & Verification
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Support column with larger button */}
        <div className="sm:col-span-3 lg:col-span-3 flex flex-col justify-start space-y-3.5">
          <h4 className="font-display text-sm font-semibold text-white tracking-widest uppercase">
            Support Desk
          </h4>
          <p className="text-xs text-warm-gray leading-relaxed max-w-[240px]">
            Have bulk questions, custom order requests, or shipping inquiries? Speak directly with yard managers.
          </p>
          <button 
            onClick={() => handleModalClick('contact')} 
            className="w-full bg-rust-copper hover:bg-rust-copper/90 active:scale-[0.98] text-white font-sans font-bold py-3 px-5 rounded-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer max-w-[240px] text-sm group"
          >
            <Mail className="w-4.5 h-4.5 text-white group-hover:translate-x-0.5 transition-transform" />
            <span>Contact Support</span>
          </button>
        </div>

      </div>

      {/* Dynamic Trust bar */}
      <div className="border-t border-oil-dark bg-steel-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-warm-gray">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-rust-copper" />
            <span>Secured with Supabase Identity Management</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <span>© 2026 PartsPeddle. All rights reserved.</span>
            <button onClick={() => handleModalClick('terms')} className="hover:text-white cursor-pointer">Terms of Service</button>
            <button onClick={() => handleModalClick('privacy')} className="hover:text-white cursor-pointer">Privacy Policy</button>
            <button onClick={() => handleModalClick('contact')} className="hover:text-white font-semibold text-warm-gray hover:text-white transition-colors cursor-pointer">Contact Us</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
