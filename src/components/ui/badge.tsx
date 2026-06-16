import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export default function Badge({ children, className, variant = 'primary' }: BadgeProps) {
  const baseClass = "inline-flex items-center px-2 py-0.5 rounded-pp-card text-xs font-bold";
  const variants = {
    primary: "bg-pp-primary text-white",
    secondary: "bg-zinc-200 text-zinc-800",
  };

  return (
    <span className={cn(baseClass, variants[variant], className)}>
      {children}
    </span>
  );
}
