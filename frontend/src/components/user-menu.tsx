"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!session) {
    return (
      <a href="/auth/signin">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm hidden sm:inline">
        {session.user?.name || session.user?.email}
      </span>
      {session.user?.image ? (
        <img
          src={session.user.image}
          alt=""
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
          {(session.user?.name || "U")[0].toUpperCase()}
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign Out
      </Button>
    </div>
  );
}
