import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton.PartCard key={`marketplace-loading-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
