import React from 'react';

interface NextLinkMockProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export default function Link({ href = '#', children, className, ...rest }: NextLinkMockProps) {
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}
