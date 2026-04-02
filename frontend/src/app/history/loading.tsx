export default function HistoryLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 animate-in fade-in duration-300">
      <div className="h-8 bg-muted rounded w-48 mb-6" />

      {/* Filter buttons skeleton */}
      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 bg-muted rounded-md w-20" />
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted/70 rounded w-32" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 bg-muted rounded w-12" />
                <div className="h-6 bg-muted rounded-full w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
