"use client";

import type { ExplainabilityResult } from "@/lib/api";

interface ExplainabilityReportProps {
  explainability: ExplainabilityResult;
  analyzedText?: string | null;
}

export function ExplainabilityReport({
  explainability,
  analyzedText,
}: ExplainabilityReportProps) {
  if (!explainability.available && !explainability.explanation) {
    return null;
  }

  const fakeHighlights = explainability.highlights.filter(
    (h) => h.signal === "fake"
  );
  const realHighlights = explainability.highlights.filter(
    (h) => h.signal === "real"
  );

  // Build a set of highlighted words for text annotation
  const highlightMap = new Map<string, { signal: string; weight: number }>();
  for (const h of explainability.highlights) {
    highlightMap.set(h.text.toLowerCase(), {
      signal: h.signal,
      weight: h.weight,
    });
  }

  // Annotate the analyzed text with highlights
  function renderAnnotatedText(text: string) {
    const words = text.split(/(\s+)/);
    return words.map((word, i) => {
      const cleaned = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const match = highlightMap.get(cleaned);
      if (match) {
        const isFake = match.signal === "fake";
        return (
          <span
            key={i}
            className={`px-0.5 rounded ${
              isFake
                ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                : "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300"
            }`}
            title={`${isFake ? "Fake" : "Real"} signal (weight: ${Math.abs(match.weight).toFixed(3)})`}
          >
            {word}
          </span>
        );
      }
      return <span key={i}>{word}</span>;
    });
  }

  return (
    <div className="rounded-lg border border-border p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
          <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">
            AI
          </span>
        </div>
        <h3 className="font-semibold text-lg">Explainability Report</h3>
      </div>

      {/* Claude Explanation */}
      {explainability.explanation && (
        <div className="rounded-md bg-muted/50 p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            AI Explanation
          </p>
          <p className="text-sm leading-relaxed">{explainability.explanation}</p>
        </div>
      )}

      {/* Word-level highlights */}
      {explainability.highlights.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            Key Words Identified by LIME
          </p>

          {/* Highlighted words grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fake indicators */}
            {fakeHighlights.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                  Fake Indicators
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fakeHighlights.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/50 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300"
                    >
                      {h.text}
                      <span className="text-red-400 dark:text-red-500 text-[10px]">
                        {Math.abs(h.weight).toFixed(3)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Real indicators */}
            {realHighlights.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                  Real Indicators
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {realHighlights.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-950/50 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300"
                    >
                      {h.text}
                      <span className="text-green-400 dark:text-green-500 text-[10px]">
                        {Math.abs(h.weight).toFixed(3)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Annotated text preview */}
          {analyzedText && (
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Highlighted Text
              </p>
              <div className="rounded-md bg-muted/30 p-4 text-sm leading-relaxed max-h-48 overflow-y-auto">
                {renderAnnotatedText(analyzedText)}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded bg-red-200 dark:bg-red-900" />
                  Fake signal
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded bg-green-200 dark:bg-green-900" />
                  Real signal
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
