"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  return (
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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">
              Analyze
            </a>
            {session && (
              <>
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
              </>
            )}
            <a
              href="/compare"
              className="hover:text-foreground transition-colors"
            >
              Compare
            </a>
          </nav>
          <ThemeToggle />
          <UserMenu />
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border px-6 py-4 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
          <nav className="flex flex-col gap-3 text-sm">
            <a
              href="/"
              className="py-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Analyze
            </a>
            {session && (
              <>
                <a
                  href="/history"
                  className="py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  History
                </a>
                <a
                  href="/dashboard"
                  className="py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </a>
              </>
            )}
            <a
              href="/compare"
              className="py-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Compare
            </a>
          </nav>
          <div className="border-t border-border pt-3">
            <UserMenu />
          </div>
        </div>
      )}
    </header>
  );
}
