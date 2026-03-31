"use client";

import type { FactCheckResult } from "@/lib/api";

interface FactCheckSectionProps {
  factCheck: FactCheckResult;
}

export function FactCheckSection({ factCheck }: FactCheckSectionProps) {
  if (!factCheck.has_matches) return null;

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="font-semibold mb-4">
        Fact Checks Found ({factCheck.match_count})
      </h3>
      <div className="space-y-3">
        {factCheck.matches.map((match, i) => (
          <div key={i} className="rounded-md bg-muted/50 p-4">
            {match.claim_text && (
              <p className="text-sm mb-2">
                <span className="text-muted-foreground">Claim: </span>
                {match.claim_text}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>
                <span className="text-muted-foreground">Rating: </span>
                <strong
                  className={
                    match.rating.toLowerCase().includes("false") ||
                    match.rating.toLowerCase().includes("pants")
                      ? "text-red-600 dark:text-red-400"
                      : match.rating.toLowerCase().includes("true")
                        ? "text-green-600 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                  }
                >
                  {match.rating}
                </strong>
              </span>
              <span>
                <span className="text-muted-foreground">By: </span>
                {match.publisher}
              </span>
              {match.claimant !== "Unknown" && (
                <span>
                  <span className="text-muted-foreground">Claimant: </span>
                  {match.claimant}
                </span>
              )}
            </div>
            {match.url && (
              <a
                href={match.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs text-primary hover:underline"
              >
                View full fact-check
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
