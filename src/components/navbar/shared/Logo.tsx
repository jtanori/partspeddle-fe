import React from 'react';
import logoImg from '../../../assets/images/logo_solid.png';

interface LogoProps {
  onClick: () => void;
  src?: string;
  className?: string;
  id?: string;
}

export const Logo: React.FC<LogoProps> = ({ onClick, src = logoImg.src, className = "", id }) => (
  <div 
    onClick={onClick} 
    className={`flex items-center cursor-pointer flex-shrink-0 ${className}`}
    id={id}
  >
    <img 
      src={src} 
      alt="PartsPeddle Logo" 
      className="w-full h-auto object-contain" 
      referrerPolicy="no-referrer"
    />
  </div>
);
