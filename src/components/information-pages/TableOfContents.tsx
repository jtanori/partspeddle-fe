'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { EditorialSection } from './EditorialSection';
import { slugify } from './lib/slugify';

interface HeadingItem {
  id: string;
  label: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

function getTextContent(node: React.ReactNode): string {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (React.isValidElement(node)) return getTextContent(node.props.children);
  return '';
}

function extractHeadings(children: React.ReactNode): HeadingItem[] {
  const headings: HeadingItem[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const type = child.type;

    if (type === EditorialSection) {
      const props = child.props as { title?: string; id?: string; headingLevel?: 'h2' | 'h3' };
      const title = props.title;
      if (title) {
        headings.push({
          id: props.id ?? slugify(title),
          label: title,
          level: props.headingLevel === 'h3' ? 3 : 2,
        });
      }
      return;
    }

    if (typeof type === 'string' && (type === 'h2' || type === 'h3')) {
      const props = child.props as { children?: React.ReactNode; id?: string };
      const label = getTextContent(props.children);
      if (label) {
        headings.push({
          id: props.id ?? slugify(label),
          label,
          level: type === 'h2' ? 2 : 3,
        });
      }
      return;
    }

    const props = child.props as { children?: React.ReactNode } | undefined;
    if (props?.children) {
      headings.push(...extractHeadings(props.children));
    }
  });

  return headings;
}

/**
 * Auto-generated table of contents from H2/H3 and EditorialSection children.
 * Highlights the active section while scrolling.
 */
export function TableOfContents({ children, className, title = 'On this page' }: TableOfContentsProps) {
  const headings = React.useMemo(() => extractHeadings(children), [children]);
  const [activeId, setActiveId] = React.useState<string>(headings[0]?.id ?? '');

  React.useEffect(() => {
    if (headings.length === 0) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length > 0) {
        const best = visible.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev,
        );
        setActiveId(best.target.id);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '-120px 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 1],
    });

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  return (
    <Card className={cn('p-5', className)}>
      <h2 className="font-display text-caption font-bold uppercase tracking-widest text-foreground-primary">
        {title}
      </h2>
      <nav aria-label="Table of contents" className="mt-4">
        <ol className="flex flex-col gap-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                'border-l-2 pl-3 transition-colors',
                heading.level === 3 ? 'ml-4' : '',
                activeId === heading.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-foreground-secondary hover:text-brand-primary',
              )}
            >
              <a
                href={`#${heading.id}`}
                onClick={handleClick(heading.id)}
                className={cn(
                  'block text-sm leading-snug focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                  activeId === heading.id && 'font-medium',
                )}
              >
                {heading.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </Card>
  );
}
