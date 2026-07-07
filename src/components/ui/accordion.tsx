'use client';

import * as React from 'react';
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

/**
 * Accessible accordion using Base UI accordion primitive.
 */
export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className,
  ...props
}: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      className={cn('w-full space-y-2', className)}
      multiple={allowMultiple}
      defaultValue={defaultOpen as string[]}
      {...props}
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.id}
          value={item.id}
          disabled={item.disabled}
          className="rounded-xl border border-stroke-subtle bg-surface-primary overflow-hidden"
        >
          <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
            <span className="text-caption font-bold uppercase tracking-widest text-foreground-primary">
              {item.title}
            </span>
            <ChevronDown className="h-4 w-4 text-foreground-muted transition-transform duration-200 group-data-[panel-open]:rotate-180" />
          </AccordionPrimitive.Trigger>
          <AccordionPrimitive.Panel className="overflow-hidden px-4 pb-4 text-body text-foreground-secondary">
            {item.content}
          </AccordionPrimitive.Panel>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
