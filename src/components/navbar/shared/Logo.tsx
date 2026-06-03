import React from 'react';
// @ts-expect-error
import logoImg from '../../../assets/images/logo_rusty.png';

interface LogoProps {
  onClick: () => void;
  src?: string;
  className?: string;
  id?: string;
}

export const Logo: React.FC<LogoProps> = ({ onClick, src = logoImg, className = "", id }) => (
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
