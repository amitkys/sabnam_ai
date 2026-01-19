"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth-store";
import { authClient } from "@/lib/auth-client";

export default function AuthStatus() {
  const { data: session, isPending } = authClient.useSession();
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run this effect after the first render
    if (!initialized) {
      setInitialized(true);
      return;
    }

    if (!isPending) {
      if (session) {
        // Only show toast if this is a new login (status changed from unauthenticated to authenticated)
        if (!isAuthenticated) {
          toast.success("Login successful");
        }
        setIsAuthenticated(true);
      } else {
        if (isAuthenticated) {
          // Only show toast if this is a new logout
          toast.info("Logged out successfully");
        }
        setIsAuthenticated(false);
      }
    }
  }, [session, isPending, isAuthenticated, setIsAuthenticated, initialized]);

  return null;
}
