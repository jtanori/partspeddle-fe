import React from 'react';
import Link from 'next/link';
import { Section } from '../layout/design-system/Section';
import { Content } from '../layout/design-system/Content';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const FinalCTA: React.FC = () => {
  return (
    <Section className="relative overflow-hidden bg-foreground-primary">
      <div className="absolute right-0 top-0 h-full w-1/3 -skew-x-12 translate-x-1/2 bg-brand-primary/10" />
      <Content className="relative z-10 text-center">
        <div className="space-y-8">
          <h2 className="font-display text-4xl font-black uppercase leading-tight text-foreground-inverse md:text-5xl">
            Ready to get your <span className="text-brand-primary">Project Back on the Road?</span>
          </h2>
          <p className="mx-auto max-w-2xl font-sans text-lg text-foreground-muted">
            Join thousands of mechanics and restorers sourcing authentic OEM parts directly from the
            source.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className={cn(
                buttonVariants({ variant: 'default' }),
                'w-full px-10 py-4 font-display text-sm font-black uppercase tracking-wide shadow-lg shadow-brand-primary/20 sm:w-auto',
              )}
            >
              Start Searching
            </Link>
            <Link
              href="/register?role=seller"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full border-foreground-inverse bg-transparent px-10 py-4 font-display text-sm font-black uppercase tracking-wide text-foreground-inverse hover:bg-foreground-inverse hover:text-foreground-primary sm:w-auto',
              )}
            >
              Yard Registry Signup
            </Link>
          </div>
        </div>
      </Content>
    </Section>
  );
};
