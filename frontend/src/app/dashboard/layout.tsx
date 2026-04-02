import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your analysis statistics, verdict distribution, trends, and most flagged sources.",
  openGraph: {
    title: "Dashboard | VerifyAI",
    description:
      "View your analysis statistics, verdict distribution, trends, and most flagged sources.",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
