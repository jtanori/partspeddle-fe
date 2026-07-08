import { Share2, Lock, Mail, ShieldAlert, FileText, Info } from 'lucide-react';
import logoImg from '../assets/images/logo_solid.png';
import { Content } from '@/components/layout/design-system';

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
    <footer className="border-t border-stroke-default bg-foreground-primary font-sans text-foreground-muted">
      {/* Upper Footer section */}
      <Content className="grid grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-12">
        {/* Company statement and Social channels */}
        <div className="space-y-4 sm:col-span-4 lg:col-span-5">
          <div
            onClick={() => onChangeView('home')}
            className="group flex cursor-pointer select-none items-center bg-transparent transition-transform duration-300 hover:scale-[1.03]"
            id="footer-logo"
          >
            <img
              src={logoImg.src}
              alt="PartsPeddle Logo"
              className="h-auto w-[200px] object-contain bg-transparent drop-shadow"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-foreground-muted">
            The professional marketplace for quality used OEM auto parts. Sourced directly from
            trusted salvage yards. Real parts, real people, real savings.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a
              href="#facebook"
              className="rounded-md bg-surface-secondary p-2 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-brand-primary"
            >
              <Share2 className="h-4 w-4" />
            </a>
            <a
              href="#instagram"
              className="rounded-md bg-surface-secondary p-2 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-brand-primary"
            >
              <Share2 className="h-4 w-4" />
            </a>
            <a
              href="#youtube"
              className="rounded-md bg-surface-secondary p-2 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-brand-primary"
            >
              <Share2 className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Shop category links */}
        <div className="sm:col-span-2 lg:col-span-2">
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-foreground-inverse">
            Shop Parts
          </h4>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>
              <button
                onClick={() => onChangeView('listing')}
                className="cursor-pointer text-left transition-colors hover:text-foreground-inverse"
              >
                Browse Parts
              </button>
            </li>
            <li>
              <button
                onClick={() => onChangeView('home')}
                className="cursor-pointer text-left transition-colors hover:text-foreground-inverse"
              >
                All Categories
              </button>
            </li>
            <li>
              <button
                onClick={() => onChangeView('listing')}
                className="cursor-pointer text-left transition-colors hover:text-foreground-inverse"
              >
                Search Parts Index
              </button>
            </li>
            <li>
              <button
                onClick={() => onChangeView('listing')}
                className="cursor-pointer text-left transition-colors hover:text-foreground-inverse"
              >
                New Listings
              </button>
            </li>
          </ul>
        </div>

        {/* About Pages links */}
        <div className="sm:col-span-3 lg:col-span-2">
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-foreground-inverse">
            About Company
          </h4>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>
              <button
                onClick={() => handleModalClick('about')}
                className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-foreground-inverse"
              >
                <Info className="h-3.5 w-3.5 text-brand-primary" />
                <span>About PartsPeddle</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleModalClick('about')}
                className="cursor-pointer text-left transition-colors hover:text-foreground-inverse"
              >
                Salvage Network
              </button>
            </li>
            <li>
              <button
                onClick={() => handleModalClick('about')}
                className="cursor-pointer text-left transition-colors hover:text-foreground-inverse"
              >
                Trust & Verification
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Support column with larger button */}
        <div className="flex flex-col justify-start space-y-3.5 sm:col-span-3 lg:col-span-3">
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground-inverse">
            Support Desk
          </h4>
          <p className="max-w-[240px] text-xs leading-relaxed text-foreground-muted">
            Have bulk questions, custom order requests, or shipping inquiries? Speak directly with
            yard managers.
          </p>
          <button
            onClick={() => handleModalClick('contact')}
            className="group flex w-full max-w-[240px] cursor-pointer items-center justify-center gap-2.5 rounded-md bg-brand-primary px-5 py-3 text-sm font-bold text-foreground-inverse shadow-card transition-all hover:bg-brand-primary/90 active:scale-[0.98]"
          >
            <Mail className="h-4.5 w-4.5 text-foreground-inverse transition-transform group-hover:translate-x-0.5" />
            <span>Contact Support</span>
          </button>
        </div>
      </Content>

      {/* Dynamic Trust bar */}
      <div className="border-t border-stroke-default bg-foreground-primary">
        <Content className="flex flex-col items-center justify-between gap-4 px-4 py-4 text-xs font-sans text-foreground-muted md:flex-row">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-brand-primary" />
            <span>Secured with Supabase Identity Management</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <span>© 2026 PartsPeddle. All rights reserved.</span>
            <button
              onClick={() => handleModalClick('terms')}
              className="cursor-pointer hover:text-foreground-inverse"
            >
              Terms of Service
            </button>
            <button
              onClick={() => handleModalClick('privacy')}
              className="cursor-pointer hover:text-foreground-inverse"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleModalClick('contact')}
              className="cursor-pointer font-semibold text-foreground-muted transition-colors hover:text-foreground-inverse"
            >
              Contact Us
            </button>
          </div>
        </Content>
      </div>
    </footer>
  );
}
