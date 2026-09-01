"use client";

import { saveBatchStudentResponses } from "@/lib/action/attempt-actions";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { ErrorTypes } from "@/lib/error-type";

export async function flushAttemptAnswers(attemptId: string) {
  const {
    answers,
    pendingSync,
    questionTimes,
    markBatchAsSynced,
    markAsSynced,
    setTestStatus,
  } = useNewTestAttemptStore.getState();

  if (pendingSync.size === 0) {
    return;
  }

  const pendingQuestionIds = Array.from(pendingSync);
  const responses: Array<{
    questionId: string;
    userAnswer: string;
    timeTaken?: number;
  }> = [];

  for (const questionId of pendingQuestionIds) {
    const userAnswer = answers.get(questionId);

    if (userAnswer && userAnswer.trim().length > 0) {
      const timeTaken = questionTimes.get(questionId) || 0;

      responses.push({ questionId, userAnswer, timeTaken });
    } else {
      markAsSynced(questionId);
    }
  }

  if (responses.length === 0) {
    return;
  }

  const result = await saveBatchStudentResponses({
    attemptId,
    responses,
  });

  if (!result.success) {
    const isAlreadySubmitted =
      result.errorCode === ErrorTypes.BAD_REQUEST &&
      result.error.toLowerCase().includes("already submitted");

    if (isAlreadySubmitted) {
      setTestStatus("submitted");
      markBatchAsSynced(responses.map((r) => r.questionId));
    }

    throw new Error(result.error || "Failed to save responses");
  }

  // Mark all responses that haven't changed during the network call as synced
  const syncedIds: string[] = [];
  const currentAnswers = useNewTestAttemptStore.getState().answers;

  for (const resp of responses) {
    if (currentAnswers.get(resp.questionId) === resp.userAnswer) {
      syncedIds.push(resp.questionId);
    }
  }

  if (syncedIds.length > 0) {
    markBatchAsSynced(syncedIds);
  }
}
