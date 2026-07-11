'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Accessible tooltip using Base UI tooltip primitive.
 */
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger
          type="button"
          className="inline-flex items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner side={side} sideOffset={4}>
            <TooltipPrimitive.Popup
              className={cn(
                'z-50 max-w-xs rounded-md bg-foreground-primary px-3 py-1.5 text-meta font-semibold text-foreground-inverse shadow-floating outline-none',
                'focus-visible:ring-2 focus-visible:ring-brand-primary',
              )}
            >
              {content}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
