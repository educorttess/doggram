interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-doggram-border rounded-xl ${className}`} />
  );
}

export function SkeletonCircle({ size = 48 }: { size?: number }) {
  return (
    <div
      className="animate-pulse bg-doggram-border rounded-full shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonPostCard() {
  return (
    <div className="bg-doggram-warm-white border border-doggram-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <SkeletonCircle size={40} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      {/* Image */}
      <Skeleton className="aspect-square w-full rounded-none" />
      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </div>
  );
}
