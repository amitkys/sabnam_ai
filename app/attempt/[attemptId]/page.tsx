"use client";
import { useState, useEffect, useRef } from "react";
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
import { startAttemptSession } from "@/lib/action/attempt-actions";

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
  const storeAttemptId = useNewTestAttemptStore(s => s.attemptId);
  const setStoreAttemptId = useNewTestAttemptStore(s => s.setAttemptId);
  const resetStore = useNewTestAttemptStore(s => s.reset);
  const setLanguage = useNewTestAttemptStore(s => s.setLanguage);
  const testStatus = useNewTestAttemptStore(s => s.testStatus);
  const setTestStatus = useNewTestAttemptStore(s => s.setTestStatus);

  // Clear store if the tab was loaded with a different test's storage,
  // or if explicitly starting a brand new one.
  useEffect(() => {
    if (storeAttemptId !== attemptId) {
      resetStore();
      setStoreAttemptId(attemptId);
    }
  }, [attemptId, storeAttemptId, resetStore, setStoreAttemptId]);

  const hasHydrated = useRef(false);

  // Pre-fill the global store with the user's previously saved answers
  useEffect(() => {
    if (data?.responses && !hasHydrated.current) {
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
      hasHydrated.current = true;
    }
  }, [data?.responses, hydrateFromServer]);

  // Session persistence on reload
  useEffect(() => {
    if (!isLoading && data) {
      // 1. Check DB first (authoritative source)
      if (data.hasStartedSession) {
        setHasStartedSession(true);
        if (data.language) {
          setSelectedLang(data.language);
          setLanguage(data.language);
        }
      } 
      // 2. Fallback to localStorage and response check
      else {
        const storedState = typeof window !== "undefined" ? localStorage.getItem(`attempt_started_${attemptId}`) : null;
        if (storedState === "true" || (data.responses && data.responses.length > 0)) {
          setHasStartedSession(true);
          if (typeof window !== "undefined") {
            localStorage.setItem(`attempt_started_${attemptId}`, "true");
          }
        }
      }
      
      // 3. Sync test status to Zustand
      if (testStatus === null && data.status) {
        setTestStatus(data.status === "COMPLETED" ? "submitted" : "active");
      }
      
      setIsCheckingSession(false);
    } else if (!isLoading) {
        setIsCheckingSession(false);
    }
  }, [attemptId, data, isLoading, testStatus, setTestStatus, setHasStartedSession, setSelectedLang, setLanguage, setIsCheckingSession]);

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

  const handleStartSession = async (lang: string) => {
    setSelectedLang(lang);
    setLanguage(lang);
    setHasStartedSession(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(`attempt_started_${attemptId}`, "true");
    }
    
    // Save to database
    await startAttemptSession(attemptId, lang);
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
