import { cn } from '@/lib/utils';

interface SpecificationItem {
  label: string;
  value: React.ReactNode;
  unit?: string;
}

interface SpecificationTableProps extends React.HTMLAttributes<HTMLDListElement> {
  specs: SpecificationItem[];
  columns?: 1 | 2;
}

/**
 * Two-column responsive specification table.
 */
export function SpecificationTable({
  specs,
  columns = 2,
  className,
  ...props
}: SpecificationTableProps) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4 text-sm',
        columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
      {...props}
    >
      {specs.map((spec, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-1 border-b border-stroke-subtle pb-3 last:border-b-0"
        >
          <dt className="text-meta font-bold uppercase tracking-widest text-foreground-muted">
            {spec.label}
          </dt>
          <dd className="text-caption font-semibold text-foreground-primary">
            {spec.value}
            {spec.unit && <span className="ml-1 text-foreground-muted">{spec.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
