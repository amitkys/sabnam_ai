"use client";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";
import { Header } from "./_components/header";
import { useEffect } from "react";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { QuestionCard } from "./_components/question-card";
import { QuestionPalette } from "./_components/question-palette";
import { AttemptFooter } from "./_components/attempt-footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export default function Page() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const { data, isLoading, error } = useAttemptTest({ attemptId })

  const hydrateFromServer = useNewTestAttemptStore(s => s.hydrateFromServer);

  // Hydrate store when data loads
  useEffect(() => {
    if (data?.responses) {
      // Step A: Filter & Transform
      const validResponses = data.responses
        // 1. FILTER: Ignore questions they haven't answered yet (where userAnswer is null)
        .filter((r) => r.userAnswer !== null)

        // 2. MAP: Convert the complex DB object into the simple shape the store expects
        .map((r) => ({
          questionId: r.questionId,
          userAnswer: r.userAnswer as string, // We know it's a string now because we filtered nulls
        }));

      // Step B: Update the Store
      hydrateFromServer(validResponses);
    }
  }, [data, hydrateFromServer]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading test...</div>
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">Error: {error.message}</div>
  }

  if (!data) {
    return <div className="flex h-screen items-center justify-center">Test data not found</div>
  }

  return (
    <div className="flex flex-col px-2.5 pt-2 h-screen">
      {/* Fixed Header */}
      <div className="flex-none">
        <Header attemptId={attemptId} />
      </div>

      {/* Mobile Question Palette */}
      <div className="md:hidden flex-none px-4 py-3 border-b bg-background overflow-x-auto">
        <QuestionPalette />
      </div>

      {/* Scrollable Main Content Area */}
      <div className="flex-1 mt-2.5">
        <div className=" h-full pb-4">
          <div className="grid grid-cols-1  md:grid-cols-12  h-full">

            {/* Left Column: Question Card (Scrollable) */}
            <div className="md:col-span-8 lg:col-span-9 pr-8  h-full flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 ">
                <QuestionCard />
              </ScrollArea>
            </div>

            {/* Right Column: Question Palette (Scrollable) */}
            <div className="hidden md:flex md:col-span-4 lg:col-span-3 h-full flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <Card className="h-full border-none shadow-sm">
                  <div className="p-4">
                    <QuestionPalette />
                  </div>
                </Card>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-none">
        <div className="container mx-auto max-w-full">
          <AttemptFooter />
        </div>
      </div>
    </div>
  )
}
