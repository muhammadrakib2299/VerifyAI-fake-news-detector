"use client";

import type {
  ClassificationResult,
  SentimentResult,
  CredibilityResult,
  FactCheckResult,
} from "@/lib/api";

interface ScoreBreakdownProps {
  classification: ClassificationResult;
  sentiment: SentimentResult;
  credibility: CredibilityResult;
  factCheck: FactCheckResult;
}

interface BarProps {
  label: string;
  value: number;
  weight: string;
  color: string;
}

function ScoreBar({ label, value, weight, color }: BarProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {percentage}% <span className="text-xs">({weight})</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreBreakdown({
  classification,
  sentiment,
  credibility,
  factCheck,
}: ScoreBreakdownProps) {
  return (
    <div className="rounded-lg border border-border p-5 space-y-4">
      <ScoreBar
        label="AI Classification"
        value={classification.fake_probability}
        weight="45%"
        color={
          classification.fake_probability > 0.65
            ? "bg-red-500"
            : classification.fake_probability > 0.35
              ? "bg-amber-500"
              : "bg-green-500"
        }
      />
      <ScoreBar
        label="Sensationalism"
        value={sentiment.sentiment_score}
        weight="20%"
        color={
          sentiment.sentiment_score > 0.6
            ? "bg-red-500"
            : sentiment.sentiment_score > 0.3
              ? "bg-amber-500"
              : "bg-green-500"
        }
      />
      <ScoreBar
        label="Source Credibility"
        value={credibility.credibility_score}
        weight="20%"
        color={
          credibility.credibility_score > 0.6
            ? "bg-red-500"
            : credibility.credibility_score > 0.3
              ? "bg-amber-500"
              : "bg-green-500"
        }
      />
      <ScoreBar
        label="Fact Check"
        value={factCheck.fact_check_score}
        weight="15%"
        color={
          factCheck.fact_check_score > 0.6
            ? "bg-red-500"
            : factCheck.fact_check_score > 0.3
              ? "bg-amber-500"
              : "bg-green-500"
        }
      />
    </div>
  );
}
