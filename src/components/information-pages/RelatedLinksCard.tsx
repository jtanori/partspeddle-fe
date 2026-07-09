import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface RelatedLink {
  label: string;
  href: string;
  description?: string;
}

interface RelatedLinksCardProps {
  title?: string;
  links: RelatedLink[];
  className?: string;
}

/**
 * Card listing related information pages.
 */
export function RelatedLinksCard({ title = 'Related pages', links, className }: RelatedLinksCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <h3 className="font-display text-card-title font-bold uppercase tracking-tight text-foreground-primary">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-start justify-between gap-3 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <div>
                <span className="block font-sans text-body font-medium text-foreground-primary group-hover:text-brand-primary">
                  {link.label}
                </span>
                {link.description && (
                  <span className="block text-caption text-foreground-muted">{link.description}</span>
                )}
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted group-hover:text-brand-primary" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
