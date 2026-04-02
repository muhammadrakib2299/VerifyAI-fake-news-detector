import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Model Comparison",
  description:
    "Compare RoBERTa vs TF-IDF baseline classification results side-by-side with inference time benchmarks.",
  openGraph: {
    title: "Model Comparison | VerifyAI",
    description:
      "See how different AI models rate the same article for fake news detection.",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
