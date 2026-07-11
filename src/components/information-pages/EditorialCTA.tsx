import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Section } from '@/components/layout/design-system/Section';
import { Content } from '@/components/layout/design-system/Content';
import { buttonVariants } from '@/components/ui/button';

interface EditorialCTAProps {
  heading?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}

/**
 * Shared dark editorial CTA placed before the footer on IPS pages.
 */
export function EditorialCTA({
  heading = 'Need help finding the right part?',
  body = 'Our marketplace connects buyers with trusted sellers across North America.',
  primaryHref = '/search',
  primaryLabel = 'Search Parts',
  secondaryHref = '/contact',
  secondaryLabel = 'Contact Support',
  className,
}: EditorialCTAProps) {
  return (
    <Section className={cn('relative overflow-hidden bg-foreground-primary', className)}>
      <div className="absolute right-0 top-0 h-full w-1/3 -skew-x-12 translate-x-1/2 bg-brand-primary/10" />
      <Content className="relative z-10 text-center">
        <div className="space-y-6">
          <h2 className="font-display text-section font-black uppercase leading-tight text-foreground-inverse md:text-display-m">
            {heading}
          </h2>
          <p className="mx-auto max-w-2xl font-sans text-body leading-relaxed text-foreground-muted">
            {body}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={primaryHref}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'w-full px-8 py-4 font-display text-sm font-black uppercase tracking-wide shadow-lg shadow-brand-primary/20 sm:w-auto',
              )}
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full border-foreground-inverse bg-transparent px-8 py-4 font-display text-sm font-black uppercase tracking-wide text-foreground-inverse hover:bg-foreground-inverse hover:text-foreground-primary sm:w-auto',
              )}
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </Content>
    </Section>
  );
}
