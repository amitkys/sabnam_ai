"use client";
import { Button } from "@/components/ui/button";

export function StartTest({ testId }: { testId: string }) {
  const handleTestStart = () => {
  }
  return (
    <Button onClick={handleTestStart} size="lg" className="w-full md:w-auto text-lg px-8 shadow-md hover:shadow-lg transition-all">
      Start Test
    </Button>
  )
}