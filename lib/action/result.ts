"use server";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ErrorTypes } from "@/lib/error-type";
import { headers } from "next/headers";

export async function getResultAction({ attemptId }: { attemptId: string }) {
  return actionWrapper(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new ActionError("User not authenticated", ErrorTypes.UNAUTHORIZED);
    }

    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId: session.user.id,
      },
      include: {
        testPaper: {
          select: {
            title: true,
            totalMarks: true,
            duration: true,
          }
        },
        responses: true,
      }
    });

    if (!attempt) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }

    const testQuestions = await prisma.testQuestion.findMany({
      where: { testPaperId: attempt.testPaperId },
      include: {
        question: true
      },
      orderBy: {
        orderIndex: "asc"
      }
    });

    // Merge questions with responses
    const questions = testQuestions.map(tq => {
      const studentResponse = attempt.responses.find(r => r.questionId === tq.questionId) || null;
      return {
        ...tq,
        studentResponse
      };
    });

    return {
      attempt: {
        id: attempt.id,
        score: attempt.score,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        language: attempt.language,
      },
      testPaper: attempt.testPaper,
      questions,
    };
  });
}
