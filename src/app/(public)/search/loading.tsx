import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex gap-8">
        <aside
          className="hidden w-[280px] shrink-0 space-y-6 md:block"
          aria-hidden="true"
        >
          <Skeleton className="h-8 w-3/4" />
          <Skeleton.Text lines={6} />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton.Text lines={4} />
        </aside>
        <section className="min-w-0 flex-1" aria-label="Loading search results">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.SearchResult key={`search-loading-${i}`} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
