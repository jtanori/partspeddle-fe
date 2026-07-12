import React from 'react';

interface BackdropProps {
  onClick: () => void;
  className?: string;
}

export const Backdrop: React.FC<BackdropProps> = ({ onClick, className = '' }) => (
  <div 
    className={`absolute inset-0 bg-black/70 backdrop-blur-xs cursor-pointer z-10 ${className}`} 
    onClick={onClick} 
  />
);
