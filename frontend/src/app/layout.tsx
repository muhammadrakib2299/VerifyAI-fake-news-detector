import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "VerifyAI - AI-Powered Fake News Detector",
  description:
    "Analyze news articles, claims, and URLs for misinformation using AI-powered multi-signal analysis including NLP classification, sentiment analysis, source credibility, and fact-checking.",
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
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                V
              </div>
              <span className="text-lg font-semibold tracking-tight">
                VerifyAI
              </span>
            </a>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">
                Analyze
              </a>
              <a
                href="/history"
                className="hover:text-foreground transition-colors"
              >
                History
              </a>
              <a
                href="/dashboard"
                className="hover:text-foreground transition-colors"
              >
                Dashboard
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          <div className="mx-auto max-w-5xl px-6">
            VerifyAI &mdash; AI-Powered Fake News Detection
          </div>
        </footer>
      </body>
    </html>
  );
}
