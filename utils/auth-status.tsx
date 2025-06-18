"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth-store";

export default function AuthStatus() {
  const { status } = useSession();
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run this effect after the first render
    if (!initialized) {
      setInitialized(true);
      return;
    }

    if (status === "authenticated") {
      // Only show toast if this is a new login (status changed from unauthenticated to authenticated)
      if (!isAuthenticated) {
        toast.success("Login successful");
      }
      setIsAuthenticated(true);
    } else if (status === "unauthenticated") {
      if (isAuthenticated) {
        // Only show toast if this is a new logout
        toast.info("Logged out successfully");
      }
      setIsAuthenticated(false);
    }
  }, [status, isAuthenticated, setIsAuthenticated, initialized]);

  return null;
}
