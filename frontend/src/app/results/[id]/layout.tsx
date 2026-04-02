import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analysis Results",
  description:
    "View detailed fake news analysis results including verdict, confidence score, sentiment analysis, source credibility, and AI-generated explanations.",
  openGraph: {
    title: "Analysis Results | VerifyAI",
    description:
      "View detailed fake news analysis results with multi-signal AI verdicts and explainability reports.",
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
