"use client";

import type { SentimentResult } from "@/lib/api";

interface SentimentDisplayProps {
  sentiment: SentimentResult;
}

export function SentimentDisplay({ sentiment }: SentimentDisplayProps) {
  const compound = sentiment.vader_compound;
  const sensationalism = sentiment.sensationalism_score;

  // Map compound from [-1, 1] to a label
  let sentimentLabel: string;
  let sentimentColor: string;
  if (compound >= 0.3) {
    sentimentLabel = "Positive";
    sentimentColor = "text-green-600 dark:text-green-400";
  } else if (compound <= -0.3) {
    sentimentLabel = "Negative";
    sentimentColor = "text-red-600 dark:text-red-400";
  } else {
    sentimentLabel = "Neutral";
    sentimentColor = "text-muted-foreground";
  }

  let sensationalismLabel: string;
  let sensationalismColor: string;
  if (sensationalism >= 0.6) {
    sensationalismLabel = "High";
    sensationalismColor = "text-red-600 dark:text-red-400";
  } else if (sensationalism >= 0.3) {
    sensationalismLabel = "Moderate";
    sensationalismColor = "text-amber-600 dark:text-amber-400";
  } else {
    sensationalismLabel = "Low";
    sensationalismColor = "text-green-600 dark:text-green-400";
  }

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="font-semibold mb-4">Sentiment Analysis</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Overall Tone</span>
          <span className={`text-sm font-medium ${sentimentColor}`}>
            {sentimentLabel} ({compound > 0 ? "+" : ""}
            {compound.toFixed(2)})
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Sensationalism</span>
          <span className={`text-sm font-medium ${sensationalismColor}`}>
            {sensationalismLabel} ({Math.round(sensationalism * 100)}%)
          </span>
        </div>

        {/* Sentiment Bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Negative</span>
            <span>Neutral</span>
            <span>Positive</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-gray-300 to-green-500 relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background shadow"
              style={{ left: `${((compound + 1) / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
