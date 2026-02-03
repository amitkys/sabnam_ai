"use client";

import { useEffect, useRef } from "react";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { saveStudentResponse } from "@/lib/action/attempt-actions";

export function useSyncAnswers(attemptId: string) {
  const isOnline = useOnlineStatus();
  const pendingSync = useNewTestAttemptStore((s) => s.pendingSync);
  const answers = useNewTestAttemptStore((s) => s.answers);
  const markAsSynced = useNewTestAttemptStore((s) => s.markAsSynced);

  // We use a ref to prevent multiple sync loops running simultaneously
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const syncAnswers = async () => {
      // If offline or already syncing or nothing to sync, return
      if (!isOnline || isSyncingRef.current || pendingSync.size === 0) return;

      isSyncingRef.current = true;

      try {
        // Convert Set to Array for iteration
        const questionsToSync = Array.from(pendingSync);

        for (const questionId of questionsToSync) {
          const answer = answers.get(questionId);

          // If somehow the answer is missing for a pending ID, just unmark it
          if (!answer) {
            markAsSynced(questionId);
            continue;
          }

          // Attempt to save to server
          const result = await saveStudentResponse(
            attemptId,
            questionId,
            answer
          );

          if (result.success) {
            // FIX: Only mark as synced if the answer hasn't changed since we started sending it
            // This prevents a race condition where the user updates the answer again while we are syncing the old one
            const currentAnswerInStore = useNewTestAttemptStore.getState().answers.get(questionId);
            if (currentAnswerInStore === answer) {
              markAsSynced(questionId);
            }
          } else {
            console.error(`Failed to sync question ${questionId}: ${result.error}`);
            // If it failed, we leave it in pendingSync so we retry next time
            // But we might want to break the loop if auth failed or something global?
            // For now, let's continue trying others.
          }
        }
      } catch (error) {
        console.error("Sync process crashed:", error);
      } finally {
        isSyncingRef.current = false;

        // If we still have pending items (maybe some failed), and we are still online,
        // we might want to try again after a delay. 
        // For now, the next effect trigger (dependency change) or manual trigger handles it.
      }
    };

    // Trigger sync when online status changes to true, or when pendingSync changes
    syncAnswers();

    // Optional: Set up an interval to retry failures while online?
    const intervalId = setInterval(syncAnswers, 5000);

    return () => clearInterval(intervalId);

  }, [isOnline, pendingSync, answers, attemptId, markAsSynced]);
}
