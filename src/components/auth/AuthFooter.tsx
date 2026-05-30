import React from 'react';

interface AuthFooterProps {
  onCancel: () => void;
  onNotice: (msg: string) => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({ onCancel, onNotice }) => {
  const links = [
    { label: 'Back to Store', onClick: onCancel },
    { label: 'Terms of Use', onClick: () => onNotice('Terms of Service: All listed OEM parts are secured through escrow and authorized salvage desks.') },
    { label: 'Privacy Policy', onClick: () => onNotice('Privacy: PartsPeddle secures and encrypts buyer records. Details are kept offline.') },
    { label: 'Support Desk', onClick: () => onNotice('Support: Need helper assistance? Contact registry-desk@partspeddle.com') }
  ];

  return (
    <div className="w-full border-t border-zinc-200/50 p-6 flex flex-col items-center gap-3 bg-zinc-50/20 flex-shrink-0">
      {/* Desktop/Tablet Horizontal layout */}
      <div className="hidden md:flex flex-wrap items-center justify-center gap-x-12 gap-y-1 text-xs font-sans text-zinc-500 font-medium">
        {links.map((link, i) => (
          <React.Fragment key={link.label}>
            <button 
              type="button" 
              onClick={link.onClick}
              className="hover:text-[#B87333] transition-colors cursor-pointer text-zinc-600 hover:underline min-h-[44px] px-4 flex items-center justify-center"
            >
              {link.label}
            </button>
            {i < links.length - 1 && <span className="text-zinc-300 select-none">•</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Vertical stack */}
      <div className="md:hidden w-full flex flex-col divide-y divide-zinc-200/40 border border-zinc-200/60 rounded-xl overflow-hidden bg-zinc-50/50 text-xs font-bold tracking-wide uppercase text-zinc-600 select-none">
        {links.map((link) => (
          <button 
            key={link.label}
            type="button" 
            onClick={link.onClick}
            className="w-full min-h-[44px] flex items-center justify-center hover:bg-[#B87333]/5 text-[#B87333] transition-colors cursor-pointer text-center"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
};
