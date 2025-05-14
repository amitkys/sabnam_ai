"use client";

import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";

export default function Page() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/home" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center ">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[350px] p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Button
            className="w-full h-12 flex items-center justify-center space-x-2"
            disabled={loading}
            variant="outline"
            onClick={handleLogin}
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
        </Card>
      </motion.div>
    </div>
  );
}
