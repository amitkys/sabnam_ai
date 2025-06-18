"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

export default function SessionSync() {
  const { data: session, status } = useSession();
  const { setIsAuthenticated } = useAuthStore();

  useEffect(() => {
    // Update auth store when session changes
    if (status === "loading") {
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
  }, [session, status, setIsAuthenticated]);

  return null; // This component doesn't render anything
} 