export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 animate-in fade-in duration-300">
      <div className="h-8 bg-muted rounded w-48 mb-8" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-5">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-9 bg-muted rounded w-16" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg border border-border p-5">
          <div className="h-5 bg-muted rounded w-40 mb-4" />
          <div className="h-[280px] bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="rounded-lg border border-border p-5">
          <div className="h-5 bg-muted rounded w-48 mb-4" />
          <div className="h-[280px] bg-muted/50 rounded animate-pulse" />
        </div>
      </div>

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border p-5">
          <div className="h-5 bg-muted rounded w-36 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border p-5">
          <div className="h-5 bg-muted rounded w-40 mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
