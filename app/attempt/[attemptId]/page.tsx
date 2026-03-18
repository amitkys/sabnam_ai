"use client";
import { useState, useEffect } from "react";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";
import { Header } from "./_components/header";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { QuestionCard } from "./_components/question-card";
import { QuestionPalette } from "./_components/question-palette";
import { AttemptFooter } from "./_components/attempt-footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { OfflineAlert, SyncAlert } from "./_components/offline-alert";
import { useSyncAnswers } from "@/hooks/use-sync-answers";
import { AttemptPreflightScreen } from "./_components/attempt-preflight";
import { FullscreenSuggestDialog } from "./_components/fullscreen-suggest-dialog";

/**
 * Main Test Attempt Page
 * Handles fetching, state hydration, and responsive layout.
 */
export default function Page() {
  const params = useParams<{ attemptId: string }>();


  const attemptId = params.attemptId;

  // Local State
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [selectedLang, setSelectedLang] = useState("en");

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

  // Session persistence on reload
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem(`attempt_started_${attemptId}`);
      if (storedState === "true") {
        setHasStartedSession(true);
      } else if (data && data.responses && data.responses.length > 0) {
        // If data indicates they already answered questions, skip preflight
        setHasStartedSession(true);
        localStorage.setItem(`attempt_started_${attemptId}`, "true");
      }
    }
    // Only turn off the checking flag once we've processed data if available
    if (!isLoading) {
      setIsCheckingSession(false);
    }
  }, [attemptId, data, isLoading]);

  // Loading / Error States
  // While we are figuring out whether to show the Preflight screen vs the Test screen,
  // we keep the loading skeleton active to avoid flashing the preflight.
  if (isLoading || isCheckingSession) {
    return <div className="flex h-screen items-center justify-center">Loading test environment...</div>
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">Error: {error.message}</div>
  }

  if (!data) {
    return <div className="flex h-screen items-center justify-center">Test data not found</div>
  }

  const handleStartSession = (lang: string) => {
    setSelectedLang(lang);
    setHasStartedSession(true);
    localStorage.setItem(`attempt_started_${attemptId}`, "true");
  };

  // ── PRE-FLIGHT GATE SCREEN ──
  if (!hasStartedSession) {
    return <AttemptPreflightScreen test={data.testPaper} onStart={handleStartSession} />;
  }

  // ── ACTUAL TEST UI SCREEN ──
  return (
    <div className="flex flex-col px-2.5  pt-2 h-screen">
      {/* Global Alerts & Modals */}
      <OfflineAlert />
      <SyncAlert />
      <FullscreenSuggestDialog />
      
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
