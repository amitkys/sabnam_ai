"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/auth-store";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { FaGoogle } from "react-icons/fa";
import { toast } from "sonner";
import { geist } from "@/config/fonts";
import { useSearchParams } from "next/navigation";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({
  open,
  onOpenChange,
}: LoginDialogProps) {
  const [loading, setLoading] = useState(false);
  const { setRedirectUrl } = useAuthStore();
  const searchParams = useSearchParams();

  // Get callback URL from query parameters (set by middleware)
  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl) {
      setRedirectUrl(callbackUrl);
    }
  }, [searchParams, setRedirectUrl]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // Store the current URL before redirecting to login
      if (typeof window !== 'undefined') {
        const callbackUrl = searchParams.get("callbackUrl");
        const redirectTo = callbackUrl || window.location.pathname + window.location.search;
        setRedirectUrl(redirectTo);
      }
      await signIn("google");
      toast.success("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader className={`${geist.className}`}>
          <DialogTitle className="text-center sm:text-left">Login to Continue</DialogTitle>
          <DialogDescription className="text-center sm:text-left">
            You will be redirected back here after login.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 pt-4">
          <Button
            className="w-full flex items-center justify-center space-x-2"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Loader size="small" variant="spin" />
                <span>Logging in...</span>
              </span>
            ) : (
              <>
                <FaGoogle className="text-lg" />
                <span>Continue with Google</span>
              </>
            )}
          </Button>
          <DialogClose />
        </div>
      </DialogContent>
    </Dialog>
  );
}