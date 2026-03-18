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
import { OfflineAlert, SyncAlert } from "./_components/offline-alert";
import { useSyncAnswers } from "@/hooks/use-sync-answers";

/**
 * Main Test Attempt Page
 * Handles fetching, state hydration, and responsive layout.
 */
export default function Page() {
  const params = useParams<{ attemptId: string }>();


  const attemptId = params.attemptId;

  // Fetch test data
  const { data, isLoading, error } = useAttemptTest({ attemptId })

  // Start background sync
  useSyncAnswers(attemptId);

  const hydrateFromServer = useNewTestAttemptStore(s => s.hydrateFromServer);

  // Pre-fill the global store with the user's previously saved answers
  useEffect(() => {
    if (data?.responses) {
      const validResponses = data.responses
        // 1. Drop unanswered questions
        .filter((r) => r.userAnswer !== null)
        // 2. Map database fields to the exact shape expected by the Zustand store
        .map((r) => ({
          questionId: r.questionId,
          userAnswer: r.userAnswer as string,
        }));

      // 3. Update the client state so the UI selects the answered options
      hydrateFromServer(validResponses);
    }
  }, [data, hydrateFromServer]);

  // Loading / Error States
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
    <div className="flex flex-col px-2.5  pt-2 h-screen">
      {/* Global Alerts */}
      <OfflineAlert />
      <SyncAlert />
      
      {/* Fixed Header */}
      <div className="flex-none">
        <Header attemptId={attemptId} />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex-none px-4 py-3 border-b bg-background  overflow-x-auto">
        <QuestionPalette />
      </div>

      {/* Main Content (12-col grid) */}
      <div className="flex-1 mt-2.5 min-h-0">
        <div className=" h-full pb-4">
          <div className="grid grid-cols-1  md:grid-cols-12  h-full">
            {/* Question Card (Left) */}
            <Card className="md:col-span-8 lg:col-span-9  md:mr-8 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <QuestionCard />
              </ScrollArea>
            </Card>

            {/* Desktop Navigation (Right) */}
            <Card className="hidden  md:flex md:col-span-4  lg:col-span-3 h-full flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <QuestionPalette />
                </div>
              </ScrollArea>
            </Card>
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
