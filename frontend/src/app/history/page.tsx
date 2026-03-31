"use client";

import { useEffect, useState } from "react";
import { getHistory, type AnalysisSummary, type HistoryResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";

const VERDICT_COLORS: Record<string, string> = {
  Real: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Misleading: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Fake: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getHistory(page, 20, filter)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, filter]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Analysis History</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[undefined, "Real", "Misleading", "Fake"].map((v) => (
          <button
            key={v ?? "all"}
            onClick={() => {
              setFilter(v);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === v
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {v ?? "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No analyses found.</p>
          <a href="/" className="text-primary hover:underline text-sm mt-2 inline-block">
            Analyze something
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((item: AnalysisSummary) => (
              <a
                key={item.id}
                href={`/results/${item.id}`}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm truncate">{item.input_text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.input_type} &middot;{" "}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground">
                    {item.final_score.toFixed(0)}/100
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      VERDICT_COLORS[item.verdict] ?? ""
                    }`}
                  >
                    {item.verdict}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
