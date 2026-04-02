"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAnalysis, submitFeedback, type AnalyzeResponse } from "@/lib/api";
import { VerdictCard } from "@/components/verdict-card";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { SentimentDisplay } from "@/components/sentiment-display";
import { CredibilityBadge } from "@/components/credibility-badge";
import { FactCheckSection } from "@/components/fact-check-section";
import { ExplainabilityReport } from "@/components/explainability-report";
import { ClickbaitDisplay } from "@/components/clickbait-display";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;

  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAnalysis(id)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleFeedback(isCorrect: boolean) {
    if (!result) return;
    try {
      await submitFeedback(result.id, isCorrect);
      setFeedbackSent(true);
    } catch {
      // Silently fail for feedback
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48 mx-auto" />
          <div className="h-64 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Analysis Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "The analysis you're looking for doesn't exist."}
        </p>
        <a href="/">
          <Button>Back to Home</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 page-enter">
      {/* Verdict */}
      <VerdictCard
        verdict={result.verdict}
        confidence={result.confidence}
        finalScore={result.final_score}
        modelUsed={result.model_used}
      />

      {/* Language Badge */}
      {result.language && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span>
            Detected language: <strong className="text-foreground">{result.language.name}</strong>
          </span>
          {result.language.code !== "en" && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              Multilingual
            </span>
          )}
        </div>
      )}

      {/* Score Breakdown */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Analysis Breakdown</h2>
        <ScoreBreakdown
          classification={result.classification}
          sentiment={result.sentiment}
          credibility={result.credibility}
          factCheck={result.fact_check}
        />
      </div>

      {/* Details Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment */}
        <SentimentDisplay sentiment={result.sentiment} />

        {/* Source Credibility */}
        <CredibilityBadge credibility={result.credibility} />
      </div>

      {/* Fact Checks */}
      {result.fact_check.has_matches && (
        <div className="mt-8">
          <FactCheckSection factCheck={result.fact_check} />
        </div>
      )}

      {/* Clickbait Analysis */}
      {result.clickbait?.available && (
        <div className="mt-8">
          <ClickbaitDisplay clickbait={result.clickbait} />
        </div>
      )}

      {/* Explainability Report */}
      {result.explainability && (
        <div className="mt-8">
          <ExplainabilityReport
            explainability={result.explainability}
            analyzedText={result.analyzed_text}
          />
        </div>
      )}

      {/* Article Info */}
      {result.article_info && result.article_info.title && (
        <div className="mt-8 rounded-lg border border-border p-5">
          <h3 className="font-semibold mb-3">Scraped Article</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Title</dt>
              <dd className="font-medium">{result.article_info.title}</dd>
            </div>
            {result.article_info.source_domain && (
              <div>
                <dt className="text-muted-foreground">Source</dt>
                <dd>{result.article_info.source_domain}</dd>
              </div>
            )}
            {result.article_info.authors.length > 0 && (
              <div>
                <dt className="text-muted-foreground">Authors</dt>
                <dd>{result.article_info.authors.join(", ")}</dd>
              </div>
            )}
            {result.article_info.publish_date && (
              <div>
                <dt className="text-muted-foreground">Published</dt>
                <dd>{result.article_info.publish_date}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Analyzed Text Preview */}
      {result.analyzed_text && (
        <div className="mt-8 rounded-lg border border-border p-5">
          <h3 className="font-semibold mb-3">Analyzed Text</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {result.analyzed_text}
          </p>
        </div>
      )}

      {/* Feedback */}
      <div className="mt-10 rounded-lg border border-border p-5 text-center">
        {feedbackSent ? (
          <p className="text-sm text-muted-foreground">
            Thank you for your feedback!
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              Was this analysis accurate?
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(true)}
              >
                Yes, correct
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(false)}
              >
                No, incorrect
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Back */}
      <div className="mt-8 text-center">
        <a href="/">
          <Button variant="outline">Analyze Another</Button>
        </a>
      </div>
    </div>
  );
}
