interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
}

export function SkeletonCircle({ size = 48 }: { size?: number }) {
  return (
    <div
      className="skeleton-shimmer rounded-full shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonPostCard() {
  return (
    <div className="bg-doggram-warm-white border-b border-doggram-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <SkeletonCircle size={44} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      {/* Image */}
      <Skeleton className="aspect-square w-full rounded-none" />
      {/* Actions + caption */}
      <div className="px-3 pt-2 pb-4 space-y-2.5">
        <div className="flex gap-3">
          <Skeleton className="h-7 w-7 rounded-xl" />
          <Skeleton className="h-7 w-7 rounded-xl" />
          <Skeleton className="h-7 w-7 rounded-xl" />
        </div>
        <Skeleton className="h-3.5 w-20 rounded-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </div>
  );
}
