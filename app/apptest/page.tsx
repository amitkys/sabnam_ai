"use client";
import { useRouter } from "@bprogress/next/app";

import { Button } from "@/components/ui/button";
export default function AppTest() {
  const router = useRouter();

  return (
    <div>
      <Button onClick={() => router.push("/home")}>go to home</Button>
      <h1 className="text-foreground/20">App Test</h1>
    </div>
  );
}
