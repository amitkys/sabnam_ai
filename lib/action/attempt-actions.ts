"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AttemptStatus, Prisma } from "@/lib/generated/prisma/client";
import { ActionError, actionWrapper } from "@/lib/action-response";
import { ErrorTypes } from "@/lib/error-type";

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
// in test attempt, when user save the response,
export async function saveStudentResponse({
  attemptId,
  questionId,
  userAnswer,
}: {
  attemptId: string;
  questionId: string;
  userAnswer: string;
}) {
  return saveBatchStudentResponses({
    attemptId,
    responses: [{ questionId, userAnswer }],
  });
}

/**
 * Saves multiple student responses in a single database transaction.
 */
export async function saveBatchStudentResponses({
  attemptId,
  responses,
}: {
  attemptId: string;
  responses: Array<{
    questionId: string;
    userAnswer: string;
    timeTaken?: number;
  }>;
}) {
  return actionWrapper(async () => {
    if (!responses || responses.length === 0) return true;

    const userId = await getSessionUserId();

    await prisma.$transaction(
      async (tx) => {
        const attempt = await tx.testAttempt.findFirst({
          where: { id: attemptId, userId },
          select: {
            status: true,
            testPaperId: true,
          },
        });

        if (!attempt) {
          throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
        }

        if (attempt.status === AttemptStatus.COMPLETED) {
          throw new ActionError(
            "Test is already submitted",
            ErrorTypes.BAD_REQUEST,
          );
        }

        // Re-check status right before write to avoid late writes after submit/cancel race.
        const liveAttempt = await tx.testAttempt.findFirst({
          where: {
            id: attemptId,
            userId,
            status: { in: [AttemptStatus.STARTED, AttemptStatus.PAUSED] },
          },
          select: { id: true },
        });

        if (!liveAttempt) {
          throw new ActionError(
            "Test is already submitted",
            ErrorTypes.BAD_REQUEST,
          );
        }

        const testQuestions = await tx.testQuestion.findMany({
          where: {
            testPaperId: attempt.testPaperId,
            questionId: { in: responses.map((r) => r.questionId) },
          },
          select: {
            questionId: true,
            question: {
              select: { correctValue: true },
            },
          },
        });

        const questionMap = new Map(
          testQuestions.map((tq) => [tq.questionId, tq.question.correctValue]),
        );

        for (const resp of responses) {
          const correctValue = questionMap.get(resp.questionId);

          if (correctValue === undefined) continue;

          const isCorrect = correctValue === resp.userAnswer;
          const timeTaken =
            typeof resp.timeTaken === "number"
              ? Math.max(0, Math.floor(resp.timeTaken))
              : 0;

          await tx.studentResponse.upsert({
            where: {
              attemptId_questionId: {
                attemptId,
                questionId: resp.questionId,
              },
            },
            update: {
              userAnswer: resp.userAnswer,
              isCorrect,
              ...(typeof resp.timeTaken === "number" ? { timeTaken } : {}),
            },
            create: {
              attemptId,
              questionId: resp.questionId,
              userAnswer: resp.userAnswer,
              isCorrect,
              timeTaken,
            },
          });
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return true;
  });
}

/**
 * Helper to calculate final score for an attempt.
 */
async function calculateScore(
  db: Prisma.TransactionClient | typeof prisma,
  attemptId: string,
  userId: string,
) {
  const attempt = await db.testAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      responses: {
        select: {
          questionId: true,
          isCorrect: true,
          userAnswer: true,
        },
      },
      testPaper: {
        include: {
          questions: true, // To get positive/negative marks per question
        },
      },
    },
  });

  if (!attempt) return null;

  let totalScore = 0;
  const questionSettingsMap = new Map(
    attempt.testPaper.questions.map((tq) => [tq.questionId, tq]),
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
export async function submitAttempt({
  attemptId,
  responses,
}: {
  attemptId: string;
  responses?: Array<{
    questionId: string;
    userAnswer: string;
    timeTaken?: number;
  }>;
}) {
  return actionWrapper(async () => {
    const userId = await getSessionUserId();
    const now = new Date();

    await prisma.$transaction(
      async (tx) => {
        const attempt = await tx.testAttempt.findFirst({
          where: { id: attemptId, userId },
          select: {
            status: true,
            testPaperId: true,
          },
        });

        if (!attempt) {
          throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
        }

        if (attempt.status === AttemptStatus.COMPLETED) {
          throw new ActionError(
            "Test is already submitted",
            ErrorTypes.BAD_REQUEST,
          );
        }

        // If there are pending responses provided at submit time, upsert them first!
        if (responses && responses.length > 0) {
          const testQuestions = await tx.testQuestion.findMany({
            where: {
              testPaperId: attempt.testPaperId,
              questionId: { in: responses.map((r) => r.questionId) },
            },
            select: {
              questionId: true,
              question: {
                select: { correctValue: true },
              },
            },
          });

          const questionMap = new Map(
            testQuestions.map((tq) => [
              tq.questionId,
              tq.question.correctValue,
            ]),
          );

          for (const resp of responses) {
            const correctValue = questionMap.get(resp.questionId);

            if (correctValue === undefined) continue;

            const isCorrect = correctValue === resp.userAnswer;
            const timeTaken =
              typeof resp.timeTaken === "number"
                ? Math.max(0, Math.floor(resp.timeTaken))
                : 0;

            await tx.studentResponse.upsert({
              where: {
                attemptId_questionId: {
                  attemptId,
                  questionId: resp.questionId,
                },
              },
              update: {
                userAnswer: resp.userAnswer,
                isCorrect,
                ...(typeof resp.timeTaken === "number" ? { timeTaken } : {}),
              },
              create: {
                attemptId,
                questionId: resp.questionId,
                userAnswer: resp.userAnswer,
                isCorrect,
                timeTaken,
              },
            });
          }
        }

        const totalScore = await calculateScore(tx, attemptId, userId);

        if (totalScore === null) {
          throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
        }

        const submitResult = await tx.testAttempt.updateMany({
          where: {
            id: attemptId,
            userId,
            status: { in: [AttemptStatus.STARTED, AttemptStatus.PAUSED] },
          },
          data: {
            status: AttemptStatus.COMPLETED,
            submittedAt: now,
            score: totalScore,
          },
        });

        if (submitResult.count === 0) {
          throw new ActionError(
            "Test is already submitted",
            ErrorTypes.BAD_REQUEST,
          );
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

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
    const normalizedLanguage = language.trim().toLowerCase();

    const attempt = await prisma.testAttempt.findFirst({
      where: { id: attemptId, userId },
      select: {
        status: true,
        testPaper: {
          select: { languages: true },
        },
      },
    });

    if (!attempt) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }
    if (attempt.status === AttemptStatus.COMPLETED) {
      throw new ActionError(
        "Test is already submitted",
        ErrorTypes.BAD_REQUEST,
      );
    }
    const supportedLanguages = attempt.testPaper.languages.map((lang) =>
      lang.toLowerCase(),
    );

    if (!supportedLanguages.includes(normalizedLanguage)) {
      throw new ActionError(
        "Selected language is not available for this test",
        ErrorTypes.BAD_REQUEST,
      );
    }

    const updateResult = await prisma.testAttempt.updateMany({
      where: { id: attemptId, userId },
      data: {
        hasStartedSession: true,
        language: normalizedLanguage,
      },
    });

    if (updateResult.count === 0) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }

    revalidatePath(`/attempt/${attemptId}`);

    return true;
  });
}

/**
 * Saves progress and marks an in-progress attempt as paused so it can be resumed.
 */
export async function pauseAttempt({ attemptId }: { attemptId: string }) {
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
      throw new ActionError(
        "Test is already submitted",
        ErrorTypes.BAD_REQUEST,
      );
    }

    const updateResult = await prisma.testAttempt.updateMany({
      where: {
        id: attemptId,
        userId,
        status: { in: [AttemptStatus.STARTED, AttemptStatus.PAUSED] },
      },
      data: {
        status: AttemptStatus.PAUSED,
      },
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
    const now = new Date();

    await prisma.$transaction(
      async (tx) => {
        const attempt = await tx.testAttempt.findFirst({
          where: { id: attemptId, userId },
          select: { status: true },
        });

        if (!attempt) {
          throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
        }
        if (attempt.status === AttemptStatus.COMPLETED) {
          throw new ActionError(
            "Test is already submitted",
            ErrorTypes.BAD_REQUEST,
          );
        }

        const totalScore = await calculateScore(tx, attemptId, userId);

        if (totalScore === null) {
          throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
        }

        const cancelResult = await tx.testAttempt.updateMany({
          where: {
            id: attemptId,
            userId,
            status: { in: [AttemptStatus.STARTED, AttemptStatus.PAUSED] },
          },
          data: {
            status: AttemptStatus.COMPLETED,
            submittedAt: now,
            score: totalScore,
          },
        });

        if (cancelResult.count === 0) {
          throw new ActionError(
            "Test is already submitted",
            ErrorTypes.BAD_REQUEST,
          );
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    revalidatePath(`/attempt/${attemptId}`);

    return true;
  });
}
