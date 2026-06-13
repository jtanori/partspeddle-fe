import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  actions,
  className = '',
  as: Tag = 'h2'
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-zinc-200 pb-8 ${className}`}>
      <div className="space-y-1.5">
        <Tag className={`${Tag === 'h1' ? 'text-3xl' : 'text-2xl sm:text-3xl'} font-display font-extrabold text-zinc-900 uppercase tracking-tight`}>
          {title}
        </Tag>
        {subtitle && (
          <p className="text-xs text-zinc-500 font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};
