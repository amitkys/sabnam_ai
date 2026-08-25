"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeaderBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/home" || pathname === "/") {
    return null;
  }

  const handleBack = () => {
    const historyIdx = window.history.state?.idx;
    const canGoBackInApp =
      typeof historyIdx === "number" ? historyIdx > 0 : window.history.length > 1;

    if (canGoBackInApp) {
      router.back();
      return;
    }

    router.push("/home");
  };

  return (
    <Button onClick={handleBack} size="sm" variant="outline">
      <ArrowLeftIcon className="mr-1 h-4 w-4" />
      Back
    </Button>
  );
}
