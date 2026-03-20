'use server';

import { prisma } from "@/lib/db";
import { AttemptStatus } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Saves a single student response.
 * Verifies correctness on the server side.
 */
export async function saveStudentResponse(
  attemptId: string,
  questionId: string,
  userAnswer: string
) {
  try {
    // 1. Validation: Ensure Attempt exists and is in progress
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: { status: true }
    });

    if (!attempt) return { error: "Attempt not found" };
    if (attempt.status === AttemptStatus.COMPLETED) {
      return { error: "Test is already submitted" };
    }

    // 2. Fetch Question for Correct Value
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { correctValue: true, type: true }
    });

    if (!question) return { error: "Question not found" };

    // 3. Calculate Correctness
    // TODO: Enhance this logic for Multi-Select (MCQ_MULTIPLE) if needed (e.g. sorting arrays before comparing)
    const isCorrect = question.correctValue === userAnswer;

    // 4. Save to DB
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
        // timeTaken: 0, // Keeping 0 as requested, or we could increment if we tracked it
      },
      create: {
        attemptId,
        questionId,
        userAnswer,
        isCorrect,
        timeTaken: 0, // Default as requested
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving response:", error);
    return { error: "Failed to save response" };
  }
}

/**
 * Helper to calculate final score for an attempt.
 */
async function calculateScore(attemptId: string) {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
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
export async function submitAttempt(attemptId: string) {
  try {
    const totalScore = await calculateScore(attemptId);

    if (totalScore === null) return { error: "Attempt not found" };

    // 3. Update Attempt
    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.COMPLETED,
        submittedAt: new Date(),
        score: totalScore
      }
    });

    revalidatePath(`/attempt/${attemptId}`);
    return { success: true };

  } catch (error) {
    console.error("Error submitting attempt:", error);
    return { error: "Failed to submit attempt" };
  }
}

/**
 * Marks the attempt session as officially started (preflight complete)
 * and saves the user's selected language medium.
 */
export async function startAttemptSession(attemptId: string, language: string) {
  try {
    const updated = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        hasStartedSession: true,
        language
      }
    });

    revalidatePath(`/attempt/${attemptId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error starting attempt session:", error);
    return { error: "Failed to start attempt session" };
  }
}

/**
 * Cancels the attempt.
 * Updates status to COMPLETED.
 */
export async function cancelAttempt(attemptId: string) {
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: { status: true }
    });

    if (!attempt) return { error: "Attempt not found" };

    if (attempt.status === AttemptStatus.COMPLETED) {
      return { error: "Test is already submitted" };
    }

    const totalScore = await calculateScore(attemptId) ?? 0;

    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.COMPLETED,
        submittedAt: new Date(),
        score: totalScore
      }
    });

    revalidatePath(`/attempt/${attemptId}`);
    return { success: true };
  } catch (error) {
    console.error("Error canceling attempt:", error);
    return { error: "Failed to cancel attempt" };
  }
}

