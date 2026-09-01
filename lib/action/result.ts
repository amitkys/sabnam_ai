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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        testPaper: {
          select: {
            id: true,
            title: true,
            slug: true,
            totalMarks: true,
            duration: true,
            category: {
              select: {
                id: true,
                name: true,
                level: true,
                parent: {
                  select: {
                    id: true,
                    name: true,
                    level: true,
                    parent: {
                      select: {
                        id: true,
                        name: true,
                        level: true,
                        parent: {
                          select: {
                            id: true,
                            name: true,
                            level: true,
                            parent: {
                              select: {
                                id: true,
                                name: true,
                                level: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: true,
      },
    });

    if (!attempt) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }

    const testQuestions = await prisma.testQuestion.findMany({
      where: { testPaperId: attempt.testPaperId },
      include: {
        question: true,
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    // Merge questions with responses
    const questions = testQuestions.map((tq) => {
      const studentResponse = attempt.responses.find((r) => r.questionId === tq.questionId) || null;
      return {
        ...tq,
        studentResponse,
      };
    });

    // Build breadcrumb hierarchy string
    const hierarchyParts: string[] = [];
    let currentCat: any = attempt.testPaper?.category;
    while (currentCat) {
      hierarchyParts.unshift(currentCat.name);
      currentCat = currentCat.parent;
    }
    const categoryHierarchy = hierarchyParts.join(" > ");

    return {
      user: attempt.user || {
        name: session.user.name || "Student",
        email: session.user.email || "",
      },
      attempt: {
        id: attempt.id,
        score: attempt.score,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        language: attempt.language,
      },
      testPaper: attempt.testPaper,
      categoryHierarchy,
      questions,
    };
  });
}
