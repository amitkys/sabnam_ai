"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

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
    <Button className="w-full" disabled={isLoading} isLoading={isLoading} onClick={handleSignIn}>
      Continue with Google
    </Button>
  );
}
