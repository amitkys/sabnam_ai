"use client";

import { useEffect, useRef } from "react";

import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { saveBatchStudentResponses } from "@/lib/action/attempt-actions";
import { ErrorTypes } from "@/lib/error-type";

export function useSyncAnswers(attemptId: string) {
  const isOnline = useOnlineStatus();
  const pendingSync = useNewTestAttemptStore((s) => s.pendingSync);
  const answers = useNewTestAttemptStore((s) => s.answers);
  const markAsSynced = useNewTestAttemptStore((s) => s.markAsSynced);
  const markBatchAsSynced = useNewTestAttemptStore((s) => s.markBatchAsSynced);
  const setTestStatus = useNewTestAttemptStore((s) => s.setTestStatus);
  const setIsSyncing = useNewTestAttemptStore((s) => s.setIsSyncing);
  const setLastSyncedAt = useNewTestAttemptStore((s) => s.setLastSyncedAt);
  const incrementSyncErrorCount = useNewTestAttemptStore(
    (s) => s.incrementSyncErrorCount,
  );
  const resetSyncErrorCount = useNewTestAttemptStore(
    (s) => s.resetSyncErrorCount,
  );

  // We use a ref to prevent multiple sync loops running simultaneously
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const syncAnswers = async () => {
      // If offline or already syncing or nothing to sync, return
      if (!isOnline || isSyncingRef.current || pendingSync.size === 0) return;

      isSyncingRef.current = true;
      setIsSyncing(true);

      try {
        const questionsToSync = Array.from(pendingSync);
        const { questionTimes } = useNewTestAttemptStore.getState();
        const responsesToSync: Array<{
          questionId: string;
          userAnswer: string;
          timeTaken?: number;
        }> = [];

        for (const questionId of questionsToSync) {
          const answer = answers.get(questionId);

          // If somehow the answer is missing for a pending ID, just unmark it
          if (!answer || answer.trim().length === 0) {
            markAsSynced(questionId);
          } else {
            const timeTaken = questionTimes.get(questionId) || 0;
            responsesToSync.push({ questionId, userAnswer: answer, timeTaken });
          }
        }

        if (responsesToSync.length === 0) {
          return;
        }

        // Attempt to save entire batch to server in a single request
        const result = await saveBatchStudentResponses({
          attemptId,
          responses: responsesToSync,
        });

        if (result.success) {
          resetSyncErrorCount();
          setLastSyncedAt(Date.now());

          // Only mark as synced if the answer hasn't changed since we started sending it
          const currentAnswers = useNewTestAttemptStore.getState().answers;
          const syncedIds: string[] = [];

          for (const item of responsesToSync) {
            if (currentAnswers.get(item.questionId) === item.userAnswer) {
              syncedIds.push(item.questionId);
            }
          }

          if (syncedIds.length > 0) {
            markBatchAsSynced(syncedIds);
          }
        } else {
          incrementSyncErrorCount();

          const isAlreadySubmitted =
            result.errorCode === ErrorTypes.BAD_REQUEST &&
            result.error.toLowerCase().includes("already submitted");

          if (isAlreadySubmitted) {
            setTestStatus("submitted");
            // Drop queued sync work because this attempt is finalized.
            markBatchAsSynced(questionsToSync);
          }
        }
      } catch {
        incrementSyncErrorCount();
      } finally {
        isSyncingRef.current = false;
        setIsSyncing(false);
      }
    };

    // Trigger sync when online status changes to true, or when pendingSync changes
    syncAnswers();

    // Set up an interval to retry failures while online
    const intervalId = setInterval(syncAnswers, 5000);

    return () => clearInterval(intervalId);
  }, [
    isOnline,
    pendingSync,
    answers,
    attemptId,
    markAsSynced,
    markBatchAsSynced,
    setTestStatus,
    setIsSyncing,
    setLastSyncedAt,
    incrementSyncErrorCount,
    resetSyncErrorCount,
  ]);
}
