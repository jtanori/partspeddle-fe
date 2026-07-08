import React from 'react';

interface AuthFooterProps {
  onCancel: () => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({ onCancel }) => {
  const links = [
    { label: 'Back to Store', onClick: onCancel },
    { label: 'Terms of Use', onClick: () => (window.location.href = '/terms') },
    {
      label: 'Privacy Policy',
      onClick: () => (window.location.href = '/privacy'),
    },
    {
      label: 'Support Desk',
      onClick: () => (window.location.href = '/support'),
    },
  ];

  return (
    <div className="w-full shrink-0 border-t border-stroke-subtle bg-surface-secondary/20 p-6 flex flex-col items-center gap-3">
      {/* Desktop/Tablet Horizontal layout */}
      <div className="hidden md:flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-sans text-xs font-medium text-foreground-muted">
        {links.map((link, i) => (
          <React.Fragment key={link.label}>
            <button
              type="button"
              onClick={link.onClick}
              className="flex cursor-pointer items-center px-2 py-1 text-foreground-secondary transition-colors hover:text-brand-primary hover:underline"
            >
              {link.label}
            </button>
            {i < links.length - 1 && <span className="select-none text-foreground-muted">•</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Vertical stack */}
      <div className="md:hidden w-full flex flex-col divide-y divide-stroke-subtle overflow-hidden rounded-sm border border-stroke-subtle bg-surface-secondary/50 text-xs font-bold uppercase tracking-wide text-foreground-secondary select-none">
        {links.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={link.onClick}
            className="flex h-11 w-full cursor-pointer items-center justify-center text-center text-brand-primary transition-colors hover:bg-brand-primary/5"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
};
