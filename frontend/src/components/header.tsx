"use client";

import { UserMenu } from "./user-menu";

export function Header() {
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
        <div className="flex items-center gap-6">
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
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
