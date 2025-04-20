"use client";

import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

export default function Page() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/home" });
    // no .then — since it redirects away
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button
        className="flex items-center"
        disabled={loading}
        variant="secondary"
        onClick={handleLogin}
      >
        {loading ? (
          <span className="flex items-center">
            <Loader className="mr-2" size="small" variant="spin" />
            Logging in...
          </span>
        ) : (
          <>
            <FaGoogle />
            <span className="ml-2">Login with Google</span>
          </>
        )}
      </Button>
    </div>
  );
}
