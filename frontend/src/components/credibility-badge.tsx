"use client";

import type { CredibilityResult } from "@/lib/api";

interface CredibilityBadgeProps {
  credibility: CredibilityResult;
}

const LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  high: {
    label: "Highly Credible",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  medium: {
    label: "Moderately Credible",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  low: {
    label: "Low Credibility",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  very_low: {
    label: "Very Low Credibility",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  unknown: {
    label: "Unknown Source",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  not_applicable: {
    label: "No URL Provided",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export function CredibilityBadge({ credibility }: CredibilityBadgeProps) {
  const config =
    LEVEL_CONFIG[credibility.credibility_level] || LEVEL_CONFIG.unknown;

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="font-semibold mb-4">Source Credibility</h3>

      {credibility.domain ? (
        <div className="space-y-3">
          {/* Domain + Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono">{credibility.domain}</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}
            >
              {config.label}
            </span>
          </div>

          {/* Score Bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Unreliable</span>
              <span>Credible</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  credibility.score >= 70
                    ? "bg-green-500"
                    : credibility.score >= 40
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${credibility.score}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-right mt-0.5">
              {credibility.score}/100
            </div>
          </div>

          {/* Category + Bias */}
          <div className="flex gap-4 text-sm">
            {credibility.category !== "unknown" && (
              <div>
                <span className="text-muted-foreground">Category: </span>
                <span className="capitalize">
                  {credibility.category.replace(/_/g, " ")}
                </span>
              </div>
            )}
            {credibility.bias !== "unknown" && credibility.bias !== "varies" && (
              <div>
                <span className="text-muted-foreground">Bias: </span>
                <span className="capitalize">{credibility.bias}</span>
              </div>
            )}
          </div>

          {/* Flagged Warning */}
          {credibility.is_flagged && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              This source has been flagged as unreliable.
            </div>
          )}

          {!credibility.in_database && (
            <p className="text-xs text-muted-foreground">
              Source not in our database. Default credibility score applied.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No URL was provided. Source credibility analysis requires a URL input.
        </p>
      )}
    </div>
  );
}
