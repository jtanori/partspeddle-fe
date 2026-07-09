import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden w-64 border-r border-border-default bg-shell-sidebar md:block" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Skeleton className="mb-6 h-8 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}
