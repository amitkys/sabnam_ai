"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

import { Header } from "./_components/header";
import { QuestionCard } from "./_components/question-card";
import { QuestionPalette } from "./_components/question-paletee";
import { AttemptFooter } from "./_components/attempt-footer";
import { OfflineAlert, SyncAlert } from "./_components/offline-alert";
import { AttemptPreflightScreen } from "./_components/attempt-preflight";
import { FullscreenSuggestDialog } from "./_components/full-screen-dialog";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSyncAnswers } from "@/hooks/use-sync-answers";
import { useAttemptTimers } from "@/hooks/use-attempt-timers";
import {
  clearAttemptLocalStorage,
  useNewTestAttemptStore,
} from "@/lib/store/new-attempt-store";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { startAttemptSession } from "@/lib/action/attempt-actions";

/**
 * Main Test Attempt Page
 * Handles fetching, state hydration, and responsive layout.
 */
export default function Page() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;
  const attemptStartedStorageKey = `attempt_started_${attemptId}`;

  // Local State
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Fetch test data
  const { data, isLoading, error } = useAttemptTest({ attemptId });

  // Start background sync
  useSyncAnswers(attemptId);

  const hydrateFromServer = useNewTestAttemptStore((s) => s.hydrateFromServer);
  const storeAttemptId = useNewTestAttemptStore((s) => s.attemptId);
  const setStoreAttemptId = useNewTestAttemptStore((s) => s.setAttemptId);
  const resetStore = useNewTestAttemptStore((s) => s.reset);
  const setLanguage = useNewTestAttemptStore((s) => s.setLanguage);
  const testStatus = useNewTestAttemptStore((s) => s.testStatus);
  const setTestStatus = useNewTestAttemptStore((s) => s.setTestStatus);
  const activeQuestionIndex = useNewTestAttemptStore(
    (s) => s.activeQuestionIndex,
  );

  // Active question ID for active question timer
  const safeIndex =
    data && data.testPaper.questions.length > 0
      ? activeQuestionIndex >= data.testPaper.questions.length
        ? 0
        : activeQuestionIndex
      : 0;
  const activeQuestionId =
    data?.testPaper.questions[safeIndex]?.question.id ?? null;

  // Start dual timers engine (overall countdown + per-question tracker)
  useAttemptTimers({
    attemptId,
    durationMinutes: data?.testPaper.duration ?? 0,
    startedAt: data?.startedAt,
    activeQuestionId,
    enabled: hasStartedSession && testStatus !== "submitted",
  });

  // Clear store only if the tab was loaded with a DIFFERENT test's storage
  useEffect(() => {
    if (storeAttemptId && storeAttemptId !== attemptId) {
      resetStore();
    }
    setStoreAttemptId(attemptId);
  }, [attemptId, storeAttemptId, resetStore, setStoreAttemptId]);

  // Track which attempt has already hydrated answers into the client store.
  // This avoids duplicate hydrate work on refetch while still rehydrating when attemptId changes.
  const hydratedAttemptIdRef = useRef<string | null>(null);

  // Hydrate previously saved answers and question times once per attempt.
  // We intentionally keep this idempotent because query data can refetch during the session.
  useEffect(() => {
    if (!data?.responses) return;
    if (hydratedAttemptIdRef.current === attemptId) return;

    const validResponses = data.responses
      .filter(
        (r) =>
          r.userAnswer !== null ||
          (typeof r.timeTaken === "number" && r.timeTaken > 0),
      )
      .map((r) => ({
        questionId: r.questionId,
        userAnswer: (r.userAnswer as string) || "",
        timeTaken: r.timeTaken,
      }));

    hydrateFromServer(validResponses);
    hydratedAttemptIdRef.current = attemptId;
  }, [attemptId, data?.responses, hydrateFromServer]);

  // Resolve "has started" state using server as source of truth, then local fallback for reload continuity.
  // We only mark localStorage for fallback path so DB-backed attempts remain authoritative.
  useEffect(() => {
    if (isLoading) return;
    if (!data) {
      setIsCheckingSession(false);

      return;
    }

    // If this attempt was already completed, wipe local attempt state and redirect to result
    if ((data.status as string) === "COMPLETED") {
      clearAttemptLocalStorage(attemptId);
      if (typeof window !== "undefined") {
        window.location.href = `/result/${attemptId}`;
      }

      return;
    }

    const storedState =
      typeof window !== "undefined"
        ? localStorage.getItem(attemptStartedStorageKey)
        : null;

    const hasFallbackSession =
      storedState === "true" || (data.responses?.length ?? 0) > 0;

    if (data.hasStartedSession || hasFallbackSession) {
      setHasStartedSession(true);
    }

    if (data.hasStartedSession && data.language) {
      setLanguage(data.language);
    } else if (hasFallbackSession && typeof window !== "undefined") {
      localStorage.setItem(attemptStartedStorageKey, "true");
    }

    if (testStatus === null && data.status) {
      setTestStatus("active");
    }

    setIsCheckingSession(false);
  }, [
    attemptId,
    attemptStartedStorageKey,
    data,
    isLoading,
    testStatus,
    setLanguage,
    setTestStatus,
  ]);

  const handleStartSession = useCallback(
    async (lang: string) => {
      const result = await startAttemptSession({ attemptId, language: lang });

      if (!result.success) {
        throw new Error(result.error || "Failed to start test");
      }

      setLanguage(lang);
      setHasStartedSession(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(attemptStartedStorageKey, "true");
      }
    },
    [attemptId, attemptStartedStorageKey, setLanguage],
  );

  // Loading / Error States
  // While we are figuring out whether to show the Preflight screen vs the Test screen,
  // we keep the loading skeleton active to avoid flashing the preflight.
  if (isLoading || isCheckingSession) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Loading test environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="red">
            <AlertTitle>Unable to Load Test</AlertTitle>
            <AlertDescription>
              {error.message ||
                "An unexpected error occurred while loading this test paper."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="yellow">
            <AlertTitle>Test Paper Not Found</AlertTitle>
            <AlertDescription>
              This test paper could not be found or may have been deleted.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // ── PRE-FLIGHT GATE SCREEN ──
  if (!hasStartedSession) {
    return (
      <AttemptPreflightScreen
        test={data.testPaper}
        onStart={handleStartSession}
      />
    );
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
  );
}
