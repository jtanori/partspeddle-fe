import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ViewAllButtonProps {
  onClick: () => void;
  className?: string;
  text?: string;
}

export const ViewAllButton: React.FC<ViewAllButtonProps> = ({ 
  onClick, 
  className = '', 
  text = 'View All' 
}) => {
  return (
    <button 
      onClick={onClick} 
      className={`text-sm uppercase tracking-wider font-display font-bold text-[#B87333] hover:text-[#C4A882] transition-colors flex items-center gap-1 ${className}`}
    >
      {text}
      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
    </button>
  );
};
