import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 p-8">
      <Skeleton className="h-12 w-48 rounded-xl" />
      <Skeleton className="h-4 w-64" />
      <div className="w-full max-w-sm space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
