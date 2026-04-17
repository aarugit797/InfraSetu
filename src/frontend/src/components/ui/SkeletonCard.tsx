import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  rows?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  variant?: "card" | "list";
  className?: string;
}

export function SkeletonCard({
  rows = 3,
  showAvatar = false,
  showImage = false,
  variant = "card",
  className,
}: SkeletonCardProps) {
  if (variant === "list") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: rows }, (_, i) => `list-row-${i}`).map((key) => (
          <SkeletonRow key={key} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("glass rounded-2xl p-4 space-y-3 animate-pulse", className)}
    >
      {showImage && <div className="skeleton h-32 rounded-xl w-full" />}
      <div className="flex items-center gap-3">
        {showAvatar && <div className="skeleton-avatar flex-shrink-0" />}
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      {Array.from({ length: rows }, (_, i) => `skeleton-row-${i}`).map(
        (key, i) => (
          <div
            key={key}
            className={cn(
              "skeleton h-3 rounded",
              i === rows - 1 ? "w-2/3" : "w-full",
            )}
          />
        ),
      )}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass rounded-2xl p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="skeleton w-14 h-5 rounded-full" />
      </div>
      <div className="skeleton h-7 w-20 rounded mb-1" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3.5 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
  );
}
