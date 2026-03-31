"use client";

interface VerdictCardProps {
  verdict: "Real" | "Misleading" | "Fake" | string;
  confidence: number;
  finalScore: number;
  modelUsed: string;
}

const VERDICT_CONFIG = {
  Real: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    ring: "bg-green-500",
  },
  Misleading: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    ring: "bg-amber-500",
  },
  Fake: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    ring: "bg-red-500",
  },
};

export function VerdictCard({
  verdict,
  confidence,
  finalScore,
  modelUsed,
}: VerdictCardProps) {
  const config =
    VERDICT_CONFIG[verdict as keyof typeof VERDICT_CONFIG] ||
    VERDICT_CONFIG.Misleading;

  return (
    <div className={`rounded-xl border-2 ${config.border} ${config.bg} p-8`}>
      <div className="flex flex-col items-center text-center">
        {/* Verdict */}
        <span className={`text-5xl font-bold ${config.color}`}>{verdict}</span>

        {/* Confidence Ring */}
        <div className="mt-6 relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="8"
              className="stroke-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${confidence * 263.89} 263.89`}
              className={config.ring.replace("bg-", "stroke-")}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">
              {Math.round(confidence * 100)}%
            </span>
            <span className="text-xs text-muted-foreground">confidence</span>
          </div>
        </div>

        {/* Score + Model */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Score: <strong className="text-foreground">{finalScore.toFixed(1)}</strong>/100
          </span>
          <span className="text-border">|</span>
          <span>
            Model:{" "}
            <strong className="text-foreground capitalize">{modelUsed}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
