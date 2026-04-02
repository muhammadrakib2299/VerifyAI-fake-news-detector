"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { analyzeContent, type InputType } from "@/lib/api";

const INPUT_TABS: { label: string; value: InputType; placeholder: string }[] = [
  {
    label: "Text",
    value: "text",
    placeholder:
      "Paste a news article, social media post, or any text you want to verify...",
  },
  {
    label: "URL",
    value: "url",
    placeholder: "https://example.com/article-to-analyze",
  },
  {
    label: "Claim",
    value: "claim",
    placeholder: 'Enter a claim to fact-check, e.g. "The earth is flat"',
  },
];

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [inputType, setInputType] = useState<InputType>("text");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTab = INPUT_TABS.find((t) => t.value === inputType)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 10) {
      setError("Please enter at least 10 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeContent({
        content: content.trim(),
        input_type: inputType,
        user_id: session?.user?.id,
        user_email: session?.user?.email ?? undefined,
      });
      router.push(`/results/${result.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 page-enter">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Detect Fake News with AI
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Multi-signal analysis combining NLP classification, sentiment
          detection, source credibility, and fact-checking to verify news
          content.
        </p>
      </div>

      {/* Analysis Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Type Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mx-auto">
          {INPUT_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setInputType(tab.value);
                setError(null);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputType === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div>
          {inputType === "url" ? (
            <input
              type="url"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              placeholder={currentTab.placeholder}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              placeholder={currentTab.placeholder}
              rows={inputType === "claim" ? 3 : 8}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !content.trim()}
            className="px-8 py-3 text-base"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </Button>
        </div>
      </form>

      {/* Features */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-6 card-stagger">
        {[
          {
            title: "AI Classification",
            desc: "Fine-tuned RoBERTa model trained on 80K+ articles for accurate fake news detection.",
          },
          {
            title: "Sentiment Analysis",
            desc: "Detects sensationalism, emotional language, and clickbait patterns.",
          },
          {
            title: "Source Credibility",
            desc: "Checks 500+ known news sources against our credibility database.",
          },
          {
            title: "Fact Checking",
            desc: "Cross-references claims against Google Fact Check database.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-border p-5"
          >
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
