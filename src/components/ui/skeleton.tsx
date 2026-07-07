import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to animate the skeleton pulse.
   * @default true
   */
  animate?: boolean;
}

/**
 * Base skeleton loading placeholder using the design-system surface colors.
 */
export function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-md bg-surface-muted', animate && 'animate-pulse', className)}
      {...props}
    />
  );
}

/**
 * Composite skeleton variants that mirror real component dimensions.
 */
Skeleton.PartCard = function PartCardSkeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-stroke-subtle bg-surface-primary',
        className,
      )}
      {...rest}
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
};

Skeleton.SellerCard = function SellerCardSkeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-stroke-subtle bg-surface-primary',
        className,
      )}
      {...rest}
    >
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
};

Skeleton.Image = function ImageSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn('aspect-square w-full', className)} {...props} />;
};

Skeleton.Text = function TextSkeleton({
  lines = 1,
  className,
  ...props
}: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full last:w-4/5" />
      ))}
    </div>
  );
};

Skeleton.SearchResult = function SearchResultSkeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        'flex gap-4 rounded-xl border border-stroke-subtle bg-surface-primary p-4',
        className,
      )}
      {...rest}
    >
      <Skeleton className="h-24 w-24 shrink-0" />
      <div className="flex flex-1 flex-col justify-center space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="hidden w-24 shrink-0 flex-col items-end justify-center space-y-2 sm:flex">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};
