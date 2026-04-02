export default function ResultsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 animate-in fade-in duration-300">
      {/* Verdict card skeleton */}
      <div className="rounded-lg border border-border p-8 mb-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 bg-muted rounded w-32 mb-3" />
            <div className="h-10 bg-muted rounded w-40 mb-2" />
            <div className="h-4 bg-muted/70 rounded w-48" />
          </div>
          <div className="h-28 w-28 bg-muted rounded-full" />
        </div>
      </div>

      {/* Score breakdown skeleton */}
      <div className="rounded-lg border border-border p-6 mb-6 animate-pulse">
        <div className="h-5 bg-muted rounded w-36 mb-4" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <div className="h-4 bg-muted/70 rounded w-32" />
                <div className="h-4 bg-muted/70 rounded w-12" />
              </div>
              <div className="h-3 bg-muted rounded-full w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-lg border border-border p-6 animate-pulse">
          <div className="h-5 bg-muted rounded w-40 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-muted/70 rounded w-full" />
            <div className="h-4 bg-muted/70 rounded w-3/4" />
            <div className="h-4 bg-muted/70 rounded w-5/6" />
          </div>
        </div>
        <div className="rounded-lg border border-border p-6 animate-pulse">
          <div className="h-5 bg-muted rounded w-36 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-muted/70 rounded w-full" />
            <div className="h-4 bg-muted/70 rounded w-2/3" />
          </div>
        </div>
      </div>

      {/* Explainability skeleton */}
      <div className="rounded-lg border border-border p-6 animate-pulse">
        <div className="h-5 bg-muted rounded w-44 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-muted/70 rounded w-full" />
          <div className="h-4 bg-muted/70 rounded w-full" />
          <div className="h-4 bg-muted/70 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}
