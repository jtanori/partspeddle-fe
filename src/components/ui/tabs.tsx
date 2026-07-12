'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Tab[];
  defaultTab?: string;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Accessible tabs using Base UI tabs primitive.
 */
export function Tabs({ tabs, defaultTab, value, onChange, className, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      className={cn('w-full', className)}
      defaultValue={defaultTab ?? tabs[0]?.id}
      value={value}
      onValueChange={onChange}
      {...props}
    >
      <TabsPrimitive.List className="flex items-center gap-1 border-b border-stroke-subtle">
        {tabs.map((tab) => (
          <TabsPrimitive.Tab
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn(
              'relative px-4 py-3 text-caption font-bold uppercase tracking-widest text-foreground-muted outline-none transition-colors',
              'hover:text-foreground-primary',
              'data-[selected]:text-foreground-primary',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
              'focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand-primary',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 bg-brand-primary transition-transform duration-200',
                'data-[selected]:scale-x-100',
              )}
            />
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Panel
          key={tab.id}
          value={tab.id}
          className="pt-6 outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {tab.content}
        </TabsPrimitive.Panel>
      ))}
    </TabsPrimitive.Root>
  );
}
