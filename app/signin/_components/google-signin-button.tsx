"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

import { Loader2 } from "lucide-react";

export function GoogleSignInButton({ nextPath }: { nextPath: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: nextPath,
        errorCallbackURL: `/signin?next=${encodeURIComponent(nextPath)}`,
      });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Button className="w-full" disabled={isLoading} onClick={handleSignIn}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </span>
      ) : (
        "Continue with Google"
      )}
    </Button>
  );
}
