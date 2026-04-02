"use client";

import { useState } from "react";
import { compareModels, type CompareResponse, type ModelResult } from "@/lib/api";
import { Button } from "@/components/ui/button";

const VERDICT_COLORS: Record<string, string> = {
  Real: "text-green-600 dark:text-green-400",
  Misleading: "text-amber-600 dark:text-amber-400",
  Fake: "text-red-600 dark:text-red-400",
};

const VERDICT_BG: Record<string, string> = {
  Real: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
  Misleading: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  Fake: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
};

export default function ComparePage() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 10) {
      setError("Please enter at least 10 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await compareModels({
        content: content.trim(),
        input_type: "text",
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Comparison failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 page-enter">
      <h1 className="text-2xl font-bold mb-2">Model Comparison</h1>
      <p className="text-muted-foreground mb-8">
        See how different AI models classify the same text. Compare RoBERTa
        (deep learning) vs TF-IDF + Logistic Regression (baseline) side by side.
      </p>

      {/* Input Form */}
      <form onSubmit={handleCompare} className="mb-8">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          placeholder="Paste text to compare across models..."
          rows={5}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y mb-4"
        />

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" disabled={isLoading || !content.trim()}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Comparing...
            </span>
          ) : (
            "Compare Models"
          )}
        </Button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Side-by-side model cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 card-stagger">
            {result.models.map((model) => (
              <ModelCard key={model.model_name} model={model} />
            ))}
          </div>

          {/* Comparison Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Metric</th>
                  {result.models.map((m) => (
                    <th key={m.model_name} className="text-center px-4 py-3 font-medium">
                      {m.model_name.split(" (")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Verdict</td>
                  {result.models.map((m) => (
                    <td
                      key={m.model_name}
                      className={`text-center px-4 py-3 font-semibold ${
                        VERDICT_COLORS[m.verdict] ?? ""
                      }`}
                    >
                      {m.available ? m.verdict : "N/A"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Confidence</td>
                  {result.models.map((m) => (
                    <td key={m.model_name} className="text-center px-4 py-3">
                      {m.available ? `${(m.confidence * 100).toFixed(1)}%` : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Fake Probability</td>
                  {result.models.map((m) => (
                    <td key={m.model_name} className="text-center px-4 py-3">
                      {m.available ? `${(m.fake_probability * 100).toFixed(1)}%` : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Real Probability</td>
                  {result.models.map((m) => (
                    <td key={m.model_name} className="text-center px-4 py-3">
                      {m.available ? `${(m.real_probability * 100).toFixed(1)}%` : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Inference Time</td>
                  {result.models.map((m) => (
                    <td key={m.model_name} className="text-center px-4 py-3 font-mono text-xs">
                      {m.available ? `${m.inference_time_ms.toFixed(1)}ms` : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Speed comparison */}
          {result.models.filter((m) => m.available).length >= 2 && (
            <SpeedComparison models={result.models.filter((m) => m.available)} />
          )}
        </div>
      )}
    </div>
  );
}

function ModelCard({ model }: { model: ModelResult }) {
  if (!model.available) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
        <p className="text-lg font-semibold text-muted-foreground mb-1">
          {model.model_name}
        </p>
        <p className="text-sm text-muted-foreground">Model not available</p>
      </div>
    );
  }

  const bg = VERDICT_BG[model.verdict] ?? "border-border";
  const color = VERDICT_COLORS[model.verdict] ?? "";

  return (
    <div className={`rounded-xl border-2 ${bg} p-6`}>
      <p className="text-sm text-muted-foreground mb-1">{model.model_name}</p>
      <p className={`text-3xl font-bold ${color} mb-3`}>{model.verdict}</p>

      {/* Probability bars */}
      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Fake</span>
            <span>{(model.fake_probability * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-500"
              style={{ width: `${model.fake_probability * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Real</span>
            <span>{(model.real_probability * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${model.real_probability * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Confidence: <strong className="text-foreground">{(model.confidence * 100).toFixed(1)}%</strong>
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {model.inference_time_ms.toFixed(1)}ms
        </span>
      </div>
    </div>
  );
}

function SpeedComparison({ models }: { models: ModelResult[] }) {
  const maxTime = Math.max(...models.map((m) => m.inference_time_ms));
  const fastest = models.reduce((a, b) =>
    a.inference_time_ms < b.inference_time_ms ? a : b
  );

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="font-semibold mb-4">Inference Speed Comparison</h3>
      <div className="space-y-3">
        {models.map((model) => {
          const pct = maxTime > 0 ? (model.inference_time_ms / maxTime) * 100 : 0;
          const isFastest = model.model_name === fastest.model_name;

          return (
            <div key={model.model_name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">
                  {model.model_name.split(" (")[0]}
                  {isFastest && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">
                      Fastest
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs">
                  {model.inference_time_ms.toFixed(1)}ms
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isFastest ? "bg-green-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
