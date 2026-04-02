import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VerifyAI - AI-Powered Fake News Detector",
    template: "%s | VerifyAI",
  },
  description:
    "Analyze news articles, claims, and URLs for misinformation using AI-powered multi-signal analysis including NLP classification, sentiment analysis, source credibility, and fact-checking.",
  keywords: [
    "fake news detector",
    "misinformation",
    "fact checker",
    "AI news analysis",
    "RoBERTa",
    "NLP",
    "source credibility",
    "sentiment analysis",
  ],
  authors: [{ name: "VerifyAI" }],
  openGraph: {
    title: "VerifyAI - AI-Powered Fake News Detector",
    description:
      "Detect fake news with multi-signal AI analysis: NLP classification, sentiment analysis, source credibility scoring, and real-time fact-checking.",
    type: "website",
    siteName: "VerifyAI",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VerifyAI - AI-Powered Fake News Detector",
    description:
      "Detect fake news with multi-signal AI analysis: NLP classification, sentiment analysis, source credibility scoring, and real-time fact-checking.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}

      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
            <div className="mx-auto max-w-5xl px-6">
              VerifyAI &mdash; AI-Powered Fake News Detection
            </div>
          </footer>
        </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
