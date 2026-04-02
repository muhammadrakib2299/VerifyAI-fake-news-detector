import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to VerifyAI with Google or GitHub to access your analysis history and dashboard.",
  openGraph: {
    title: "Sign In | VerifyAI",
    description:
      "Sign in to VerifyAI with Google or GitHub to access your analysis history and dashboard.",
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
