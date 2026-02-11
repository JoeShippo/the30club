interface SkeletonLoaderProps {
  count?: number;
  type?: 'list' | 'card' | 'stat';
}

export function SkeletonLoader({ count = 3, type = 'list' }: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card bg-base-200 animate-pulse">
            <div className="card-body">
              <div className="h-4 bg-base-300 rounded w-3/4" />
              <div className="h-3 bg-base-300 rounded w-1/2 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card bg-base-200 animate-pulse">
            <div className="card-body p-4 gap-2">
              <div className="h-3 bg-base-300 rounded w-2/3" />
              <div className="h-8 bg-base-300 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card bg-base-200 animate-pulse">
          <div className="card-body p-4">
            <div className="h-4 bg-base-300 rounded w-full" />
            <div className="h-3 bg-base-300 rounded w-2/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}