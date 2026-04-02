import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analysis History",
  description:
    "Browse your past fake news analyses with filtering by verdict and pagination.",
  openGraph: {
    title: "Analysis History | VerifyAI",
    description:
      "Browse your past fake news analyses with filtering by verdict and pagination.",
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
