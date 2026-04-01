import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
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
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
            <div className="mx-auto max-w-5xl px-6">
              VerifyAI &mdash; AI-Powered Fake News Detection
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
