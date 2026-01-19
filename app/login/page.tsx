"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";


export default function Page() {
  const handleSignin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/home",
      errorCallbackURL: "/api/auth/error",
    })
  }
  return (
    <Button onClick={handleSignin}>Signin with google</Button>
  )
}