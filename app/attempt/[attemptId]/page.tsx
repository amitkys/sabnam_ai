"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

import { Header } from "./_components/header";
import { QuestionCard } from "./_components/question-card";
import { QuestionPalette } from "./_components/question-palette";
import { AttemptFooter } from "./_components/attempt-footer";
import { OfflineAlert, SyncAlert } from "./_components/offline-alert";
import { AttemptPreflightScreen } from "./_components/attempt-preflight";
import { FullscreenSuggestDialog } from "./_components/fullscreen-suggest-dialog";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useSyncAnswers } from "@/hooks/use-sync-answers";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
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

  // Clear store if the tab was loaded with a different test's storage,
  // or if explicitly starting a brand new one.
  useEffect(() => {
    if (storeAttemptId !== attemptId) {
      resetStore();
      setStoreAttemptId(attemptId);
    }
  }, [attemptId, storeAttemptId, resetStore, setStoreAttemptId]);

  // Track which attempt has already hydrated answers into the client store.
  // This avoids duplicate hydrate work on refetch while still rehydrating when attemptId changes.
  const hydratedAttemptIdRef = useRef<string | null>(null);

  // Hydrate previously saved answers once per attempt.
  // We intentionally keep this idempotent because query data can refetch during the session.
  useEffect(() => {
    if (!data?.responses) return;
    if (hydratedAttemptIdRef.current === attemptId) return;

    const validResponses = data.responses
      .filter((r) => r.userAnswer !== null)
      .map((r) => ({
        questionId: r.questionId,
        userAnswer: r.userAnswer as string,
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
      setTestStatus(data.status === "COMPLETED" ? "submitted" : "active");
    }

    setIsCheckingSession(false);
  }, [
    attemptStartedStorageKey,
    data,
    isLoading,
    testStatus,
    setLanguage,
    setTestStatus,
  ]);

  const handleStartSession = useCallback(
    async (lang: string) => {
      setLanguage(lang);
      setHasStartedSession(true);

      if (typeof window !== "undefined") {
        localStorage.setItem(attemptStartedStorageKey, "true");
      }

      await startAttemptSession({ attemptId, language: lang });
    },
    [attemptId, attemptStartedStorageKey, setLanguage],
  );

  // Loading / Error States
  // While we are figuring out whether to show the Preflight screen vs the Test screen,
  // we keep the loading skeleton active to avoid flashing the preflight.
  if (isLoading || isCheckingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading test environment...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        Test data not found
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
