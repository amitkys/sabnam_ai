"use client";

import { useRouter } from "@bprogress/next/app";

import { Button } from "@/components/ui/button";

export default function AppTest() {
  const router = useRouter();

  return (
    <div>
      <h1>App Test</h1>
      <Button onClick={async () => await router.push("/home")}>
        go to home
      </Button>
    </div>
  );
}
