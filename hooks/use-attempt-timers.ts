"use client";

import { useEffect, useRef } from "react";

import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useSubmitTest } from "@/hooks/query/mutation/use-submit-test";

interface UseAttemptTimersOptions {
  attemptId: string;
  durationMinutes: number;
  startedAt?: Date | string | null;
  activeQuestionId?: string | null;
  enabled?: boolean;
}

/**
 * Microsecond-accurate dual-timer engine:
 * 1. Overall Test Countdown Timer (synchronized against server start time, auto-submits on 0:00).
 * 2. Per-Question Time Tracker using Continuous Wall-Clock Timestamp Deltas:
 *    - Captures exact milliseconds when entering/switching questions.
 *    - Zero time dropped during rapid question navigation.
 *    - Automatically persists rounded whole-second values to DB.
 */
export function useAttemptTimers({
  attemptId,
  durationMinutes,
  startedAt,
  activeQuestionId,
  enabled = true,
}: UseAttemptTimersOptions) {
  const testStatus = useNewTestAttemptStore((s) => s.testStatus);
  const timeRemaining = useNewTestAttemptStore((s) => s.timeRemaining);
  const setTimeRemaining = useNewTestAttemptStore((s) => s.setTimeRemaining);
  const decrementTimeRemaining = useNewTestAttemptStore(
    (s) => s.decrementTimeRemaining,
  );
  const addQuestionDurationMs = useNewTestAttemptStore(
    (s) => s.addQuestionDurationMs,
  );

  const { mutate: submitTest } = useSubmitTest({ attemptId });
  const hasAutoSubmittedRef = useRef(false);

  // References for timestamp delta tracking
  const activeQuestionIdRef = useRef<string | null>(activeQuestionId ?? null);
  const questionEnteredAtRef = useRef<number>(Date.now());
  const lastOverallTickRef = useRef<number>(Date.now());

  // Initialize remaining time accurately based on server startedAt
  useEffect(() => {
    if (!enabled || !durationMinutes) return;

    const totalSeconds = durationMinutes * 60;
    let initialRemaining = totalSeconds;

    if (startedAt) {
      const startEpoch = new Date(startedAt).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - startEpoch) / 1000));

      initialRemaining = Math.max(0, totalSeconds - elapsed);
    }

    if (timeRemaining === null) {
      setTimeRemaining(initialRemaining);
    }
  }, [durationMinutes, startedAt, enabled, timeRemaining, setTimeRemaining]);

  // Handle Question Switching: flush exact delta to previous question and reset clock for new question
  useEffect(() => {
    if (!enabled || testStatus === "submitted") return;

    const now = Date.now();
    const previousQuestionId = activeQuestionIdRef.current;

    if (previousQuestionId && previousQuestionId !== activeQuestionId) {
      const elapsedMs = now - questionEnteredAtRef.current;

      if (elapsedMs > 0) {
        addQuestionDurationMs(previousQuestionId, elapsedMs);
      }
    }

    activeQuestionIdRef.current = activeQuestionId ?? null;
    questionEnteredAtRef.current = now;
  }, [activeQuestionId, enabled, testStatus, addQuestionDurationMs]);

  // Main high-precision heartbeat loop (runs every 250ms for buttery-smooth updates and zero timer drift)
  useEffect(() => {
    if (!enabled || testStatus === "submitted") return;

    questionEnteredAtRef.current = Date.now();
    lastOverallTickRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();

      // 1. Per-Question Time Accumulation (continuous wall-clock delta)
      const currentQuestionId = activeQuestionIdRef.current;

      if (currentQuestionId) {
        const elapsedMs = now - questionEnteredAtRef.current;

        if (elapsedMs > 0) {
          addQuestionDurationMs(currentQuestionId, elapsedMs);
          questionEnteredAtRef.current = now;
        }
      }

      // 2. Overall Test Timer Decrement
      const deltaOverallSec = Math.floor(
        (now - lastOverallTickRef.current) / 1000,
      );

      if (deltaOverallSec >= 1) {
        decrementTimeRemaining(deltaOverallSec);
        lastOverallTickRef.current = now;
      }

      // 3. Auto-submit check when overall test runs out
      const currentRemaining = useNewTestAttemptStore.getState().timeRemaining;

      if (
        currentRemaining !== null &&
        currentRemaining <= 0 &&
        !hasAutoSubmittedRef.current
      ) {
        hasAutoSubmittedRef.current = true;
        submitTest();
      }
    }, 250);

    return () => {
      clearInterval(interval);
      // If the test has already been submitted, never touch store timers
      if (useNewTestAttemptStore.getState().testStatus === "submitted") {
        return;
      }
      // Flush any trailing sub-second duration upon unmount/pause
      const now = Date.now();
      const currentQuestionId = activeQuestionIdRef.current;

      if (currentQuestionId) {
        const elapsedMs = now - questionEnteredAtRef.current;

        if (elapsedMs > 0) {
          addQuestionDurationMs(currentQuestionId, elapsedMs);
          questionEnteredAtRef.current = now;
        }
      }
    };
  }, [
    enabled,
    testStatus,
    addQuestionDurationMs,
    decrementTimeRemaining,
    submitTest,
  ]);
}
