"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export default function AuthRedirect() {
  const router = useRouter();
  const { redirectUrl, setRedirectUrl } = useAuthStore();

  useEffect(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
      setRedirectUrl(null); // Clear the redirect URL after use
    }
  }, [redirectUrl, router, setRedirectUrl]);

  return null;
} 