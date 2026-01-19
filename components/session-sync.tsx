"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { authClient } from "@/lib/auth-client";

export default function SessionSync() {
  const { data: session, isPending, error } = authClient.useSession();
  const { setIsAuthenticated } = useAuthStore();

  useEffect(() => {
    // Update auth store when session changes
    if (isPending) {
      // Still loading, don't change anything
      return;
    }

    if (session) {
      // User is authenticated
      setIsAuthenticated(true);
    } else {
      // User is not authenticated
      setIsAuthenticated(false);
    }
  }, [session, isPending, setIsAuthenticated]);

  return null; // This component doesn't render anything
}