"use client";

import type { ClickbaitResult } from "@/lib/api";

interface ClickbaitDisplayProps {
  clickbait: ClickbaitResult;
}

export function ClickbaitDisplay({ clickbait }: ClickbaitDisplayProps) {
  if (!clickbait.available) return null;

  const score = clickbait.clickbait_score;
  let level: string;
  let levelColor: string;
  let bgColor: string;
  let borderColor: string;

  if (score >= 0.6) {
    level = "High";
    levelColor = "text-red-600 dark:text-red-400";
    bgColor = "bg-red-50 dark:bg-red-950/30";
    borderColor = "border-red-200 dark:border-red-800";
  } else if (score >= 0.3) {
    level = "Moderate";
    levelColor = "text-amber-600 dark:text-amber-400";
    bgColor = "bg-amber-50 dark:bg-amber-950/30";
    borderColor = "border-amber-200 dark:border-amber-800";
  } else {
    level = "Low";
    levelColor = "text-green-600 dark:text-green-400";
    bgColor = "bg-green-50 dark:bg-green-950/30";
    borderColor = "border-green-200 dark:border-green-800";
  }

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Clickbait Analysis</h3>
        <span
          className={`text-sm font-semibold px-2 py-0.5 rounded-full ${levelColor}`}
        >
          {level} Risk
        </span>
      </div>

      {clickbait.headline && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Headline</p>
          <p className="text-sm font-medium">&ldquo;{clickbait.headline}&rdquo;</p>
        </div>
      )}

      <div className="space-y-2">
        {/* Mismatch Score Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Headline-Body Mismatch</span>
            <span className="font-medium">
              {clickbait.mismatch_score.toFixed(0)}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                clickbait.mismatch_score > 65
                  ? "bg-red-500"
                  : clickbait.mismatch_score > 30
                    ? "bg-amber-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${clickbait.mismatch_score}%` }}
            />
          </div>
        </div>

        {/* Overall Clickbait Score */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Clickbait Score</span>
          <span className={`font-medium ${levelColor}`}>
            {Math.round(score * 100)}%
          </span>
        </div>

        {clickbait.similarity !== null && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Semantic Similarity</span>
            <span className="font-medium">
              {(clickbait.similarity * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Pattern Matches */}
      {clickbait.pattern_matches.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1.5">
            Clickbait Patterns Detected
          </p>
          <div className="flex flex-wrap gap-1.5">
            {clickbait.pattern_matches.map((match, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-950/50 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300"
              >
                &ldquo;{match}&rdquo;
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
