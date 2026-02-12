import { Skeleton } from '@/components/ui/skeleton';

export const CardSkeleton = () => (
  <div className="rounded-lg bg-card p-4 shadow-card space-y-3">
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-8 w-full" />
  </div>
);

export const ListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-card">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const BalanceSkeleton = () => (
  <div className="rounded-lg bg-card p-6 shadow-card space-y-2 text-center">
    <Skeleton className="h-3 w-24 mx-auto" />
    <Skeleton className="h-8 w-32 mx-auto" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="rounded-lg bg-card p-4 shadow-card">
    <Skeleton className="h-4 w-1/3 mb-4" />
    <Skeleton className="h-48 w-full rounded-md" />
  </div>
);

// Default export - renders CardSkeleton multiple times
export default function LoadingSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
