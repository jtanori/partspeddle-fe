import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton.SearchResult key={`search-loading-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
