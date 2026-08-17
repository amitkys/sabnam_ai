"use client";

import { saveStudentResponse } from "@/lib/action/attempt-actions";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { ErrorTypes } from "@/lib/error-type";

export async function flushAttemptAnswers(attemptId: string) {
  const { answers } = useNewTestAttemptStore.getState();
  const answerEntries = Array.from(answers.entries()).filter(
    ([, answer]) => answer.trim().length > 0,
  );

  for (const [questionId, userAnswer] of answerEntries) {
    const result = await saveStudentResponse({
      attemptId,
      questionId,
      userAnswer,
    });

    if (!result.success) {
      const isAlreadySubmitted =
        result.errorCode === ErrorTypes.BAD_REQUEST &&
        result.error.toLowerCase().includes("already submitted");

      if (isAlreadySubmitted) {
        useNewTestAttemptStore.getState().setTestStatus("submitted");
      }

      throw new Error(result.error || "Failed to save response");
    }

    const currentAnswer = useNewTestAttemptStore
      .getState()
      .answers.get(questionId);

    if (currentAnswer === userAnswer) {
      useNewTestAttemptStore.getState().markAsSynced(questionId);
    }
  }
}
