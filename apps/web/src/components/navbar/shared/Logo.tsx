import React from 'react';
import Link from 'next/link';
import logoImg from '../../../assets/images/logo_solid.png';

interface LogoProps {
  href?: string;
  src?: string;
  className?: string;
  id?: string;
}

export const Logo: React.FC<LogoProps> = ({
  href = '/',
  src = logoImg.src,
  className = '',
  id,
}) => (
  <Link
    href={href}
    className={`flex items-center cursor-pointer flex-shrink-0 ${className}`}
    id={id}
  >
    <img
      src={src}
      alt="PartsPeddle Logo"
      className="w-full h-auto object-contain"
      referrerPolicy="no-referrer"
    />
  </Link>
);
