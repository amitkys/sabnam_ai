'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AttemptStatus } from "@/lib/generated/prisma/client";
import { ActionError, actionWrapper } from "@/lib/action-response";
import { ErrorTypes } from "@/lib/error-type";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Saves a single student response.
 * Verifies correctness on the server side.
 */
async function getSessionUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new ActionError("User not authenticated", ErrorTypes.UNAUTHORIZED);
  }
  return session.user.id;
}

export async function saveStudentResponse({
  attemptId,
  questionId,
  userAnswer,
}: {
  attemptId: string;
  questionId: string;
  userAnswer: string;
}) {
  return actionWrapper(async () => {
    const userId = await getSessionUserId();

    const attempt = await prisma.testAttempt.findFirst({
      where: { id: attemptId, userId },
      select: { status: true }
    });

    if (!attempt) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }
    if (attempt.status === AttemptStatus.COMPLETED) {
      throw new ActionError("Test is already submitted", ErrorTypes.BAD_REQUEST);
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { correctValue: true }
    });

    if (!question) {
      throw new ActionError("Question not found", ErrorTypes.NOT_FOUND);
    }

    const isCorrect = question.correctValue === userAnswer;

    await prisma.studentResponse.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        userAnswer,
        isCorrect,
      },
      create: {
        attemptId,
        questionId,
        userAnswer,
        isCorrect,
        timeTaken: 0,
      },
    });

    return true;
  });
}

/**
 * Helper to calculate final score for an attempt.
 */
async function calculateScore(attemptId: string, userId: string) {
  const attempt = await prisma.testAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      responses: true,
      testPaper: {
        include: {
          questions: true // To get positive/negative marks per question
        }
      }
    }
  });

  if (!attempt) return null;

  let totalScore = 0;
  const questionSettingsMap = new Map(
    attempt.testPaper.questions.map(tq => [tq.questionId, tq])
  );

  for (const response of attempt.responses) {
    const settings = questionSettingsMap.get(response.questionId);
    if (!settings) continue;

    if (response.isCorrect) {
      totalScore += settings.positiveMarks;
    } else if (response.userAnswer) {
      // Only deduct if attempted (and incorrect)
      // Assuming negativeMarks is a positive number representing deduction (e.g. 1.0)
      // If it's stored as -1.0, add it. If stored as 1.0, subtract it.
      // Usually stored as positive value to subtract.
      totalScore -= settings.negativeMarks;
    }
  }

  return totalScore;
}

/**
 * Finalizes the attempt.
 * Calculates final score and updates status.
 */
export async function submitAttempt({ attemptId }: { attemptId: string }) {
  return actionWrapper(async () => {
    const userId = await getSessionUserId();
    const totalScore = await calculateScore(attemptId, userId);

    if (totalScore === null) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }

    const submitResult = await prisma.testAttempt.updateMany({
      where: { id: attemptId, userId },
      data: {
        status: AttemptStatus.COMPLETED,
        submittedAt: new Date(),
        score: totalScore
      }
    });
    if (submitResult.count === 0) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }

    revalidatePath(`/attempt/${attemptId}`);
    return true;
  });
}

/**
 * Marks the attempt session as officially started (preflight complete)
 * and saves the user's selected language medium.
 */
export async function startAttemptSession({
  attemptId,
  language,
}: {
  attemptId: string;
  language: string;
}) {
  return actionWrapper(async () => {
    const userId = await getSessionUserId();

    const attempt = await prisma.testAttempt.findFirst({
      where: { id: attemptId, userId },
      select: { status: true },
    });

    if (!attempt) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }
    if (attempt.status === AttemptStatus.COMPLETED) {
      throw new ActionError("Test is already submitted", ErrorTypes.BAD_REQUEST);
    }

    const updateResult = await prisma.testAttempt.updateMany({
      where: { id: attemptId, userId },
      data: {
        hasStartedSession: true,
        language
      }
    });
    if (updateResult.count === 0) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }

    revalidatePath(`/attempt/${attemptId}`);
    return true;
  });
}

/**
 * Cancels the attempt.
 * Updates status to COMPLETED.
 */
export async function cancelAttempt({ attemptId }: { attemptId: string }) {
  return actionWrapper(async () => {
    const userId = await getSessionUserId();

    const attempt = await prisma.testAttempt.findFirst({
      where: { id: attemptId, userId },
      select: { status: true }
    });

    if (!attempt) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }
    if (attempt.status === AttemptStatus.COMPLETED) {
      throw new ActionError("Test is already submitted", ErrorTypes.BAD_REQUEST);
    }

    const totalScore = (await calculateScore(attemptId, userId)) ?? 0;

    const cancelResult = await prisma.testAttempt.updateMany({
      where: { id: attemptId, userId },
      data: {
        status: AttemptStatus.COMPLETED,
        submittedAt: new Date(),
        score: totalScore
      }
    });
    if (cancelResult.count === 0) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }

    revalidatePath(`/attempt/${attemptId}`);
    return true;
  });
}
