import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  className = ''
}) => {
  return (
    <div className={`bg-white border-2 border-dashed border-zinc-300 rounded-sm p-12 text-center space-y-6 ${className}`}>
      {icon && <div className="flex justify-center">{icon}</div>}
      <div className="space-y-2">
        <h3 className="font-display font-black text-2xl uppercase text-zinc-800 leading-tight">
          {title}
        </h3>
        <p className="text-zinc-500 font-sans max-w-lg mx-auto text-sm">
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-8 py-3 bg-[#B87333] hover:bg-[#9c5f2b] text-white font-display font-bold uppercase transition-all shadow-md active:translate-y-0.5"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
