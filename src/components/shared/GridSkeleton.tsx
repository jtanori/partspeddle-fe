import { Skeleton } from '@/components/ui/skeleton';

export const GridSkeleton = () => (
  <div className="bg-white border border-stone-800/10 rounded shadow-sm overflow-hidden animate-pulse">
    <div className="aspect-[4/3] w-full bg-zinc-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-24 bg-zinc-200 rounded" />
      <div className="h-6 w-full bg-zinc-200 rounded" />
      <div className="h-4 w-5/6 bg-zinc-200 rounded" />
    </div>
  </div>
);
