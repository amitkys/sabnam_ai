"use server";

import { headers } from "next/headers";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ErrorTypes } from "@/lib/error-type";

export async function getAnalysisAction({ attemptId }: { attemptId: string }) {
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
      select: {
        id: true,
        score: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        language: true,
        testPaperId: true,
        testPaper: {
          select: {
            title: true,
            totalMarks: true,
            duration: true,
          },
        },
        responses: {
          select: {
            id: true,
            attemptId: true,
            questionId: true,
            userAnswer: true,
            isCorrect: true,
            timeTaken: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }

    const responseByQuestionId = new Map(
      attempt.responses.map((response) => [response.questionId, response]),
    );

    const questions = await prisma.testQuestion.findMany({
      where: { testPaperId: attempt.testPaperId },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        testPaperId: true,
        questionId: true,
        positiveMarks: true,
        negativeMarks: true,
        orderIndex: true,
        question: {
          select: {
            id: true,
            content: true,
            imageUrl: true,
            type: true,
            difficulty: true,
            solution: true,
            options: true,
            correctValue: true,
            categoryId: true,
            createdAt: true,
          },
        },
      },
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
      questions: questions.map((question) => ({
        ...question,
        studentResponse: responseByQuestionId.get(question.questionId) ?? null,
      })),
    };
  });
}
