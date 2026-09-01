"use client";

import React, { useState } from "react";
import {
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldAlertIcon,
  ArrowRightIcon,
  Loader2Icon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";
import { adminLoginAction } from "@/lib/action/admin/admin-auth-actions";

interface AdminLoginFormProps {
  onLoginSuccess: () => void;
}

export function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please provide both username and password.");

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await adminLoginAction({ username, password });

      if (res.success) {
        toast.add({
          type: "success",
          title: "Admin Authenticated",
          description: "Welcome back! Entering admin management dashboard.",
        });
        onLoginSuccess();
      } else {
        setError(res.error || "Invalid username or password");
        toast.add({
          type: "error",
          title: "Authentication Failed",
          description: res.error || "Invalid username or password.",
        });
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred during login.";

      setError(msg);
      toast.add({
        type: "error",
        title: "Login Error",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20 bg-card">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
            <LockIcon className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Admin Authentication
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in with credentials configured in your environment to manage
            exam categories and test series.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <Alert className="py-2.5" variant="destructive">
                <ShieldAlertIcon className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">
                  Authentication Failed
                </AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold" htmlFor="admin-username">
                Admin Username
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  autoComplete="username"
                  className="pl-9 text-sm"
                  disabled={loading}
                  id="admin-username"
                  placeholder="e.g. admin"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold" htmlFor="admin-password">
                Admin Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  autoComplete="current-password"
                  className="pl-9 pr-10 text-sm"
                  disabled={loading}
                  id="admin-password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              className="w-full gap-2 font-medium"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Enter Admin Panel
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
