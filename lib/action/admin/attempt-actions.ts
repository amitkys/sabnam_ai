"use server";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { prisma } from "@/lib/db";
import { ErrorTypes } from "@/lib/error-type";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AttemptStatus, Prisma } from "@/lib/generated/prisma/client";

export interface AdminAttemptItem {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  testPaperId: string;
  testPaper: {
    id: string;
    title: string;
    slug: string;
    totalMarks: number;
    duration: number;
    category?: {
      id: string;
      name: string;
      level: string;
      parent?: {
        id: string;
        name: string;
        level: string;
      } | null;
    } | null;
    _count: {
      questions: number;
    };
  };
  score: number | null;
  status: AttemptStatus;
  startedAt: Date;
  submittedAt: Date | null;
  language: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  timeSpentSeconds: number;
  categoryHierarchy: string;
}

export interface GetAdminAttemptsParams {
  page?: number;
  limit?: number;
  email?: string;
  search?: string;
  status?: AttemptStatus | "ALL";
  testPaperId?: string;
}

export interface GetAdminAttemptsResult {
  attempts: AdminAttemptItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summaryStats: {
    totalAttempts: number;
    completedAttempts: number;
    inProgressAttempts: number;
    uniqueUsersCount: number;
    averageScore: number;
  };
}

/**
 * Retrieves paginated recent student test attempts for admin with optional email and status filters.
 */
export async function getAdminRecentAttemptsAction(
  params: GetAdminAttemptsParams = {},
) {
  return actionWrapper(async (): Promise<GetAdminAttemptsResult> => {
    const isAuth = await isAdminAuthenticated();

    if (!isAuth) {
      throw new ActionError(
        "Admin authorization required",
        ErrorTypes.UNAUTHORIZED,
      );
    }

    const {
      page = 1,
      limit = 20,
      email,
      search,
      status = "ALL",
      testPaperId,
    } = params;

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(100, Math.max(1, limit));
    const skip = (validatedPage - 1) * validatedLimit;

    // Construct Prisma where query
    const where: Prisma.TestAttemptWhereInput = {};

    // Filter by specific email or search term
    const emailQuery = email?.trim();
    const generalSearch = search?.trim();

    if (emailQuery) {
      where.user = {
        email: {
          contains: emailQuery,
          mode: "insensitive",
        },
      };
    } else if (generalSearch) {
      where.OR = [
        {
          user: {
            email: {
              contains: generalSearch,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            name: {
              contains: generalSearch,
              mode: "insensitive",
            },
          },
        },
        {
          testPaper: {
            title: {
              contains: generalSearch,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Filter by status
    if (status && status !== "ALL") {
      where.status = status as AttemptStatus;
    }

    // Filter by test paper
    if (testPaperId && testPaperId !== "ALL") {
      where.testPaperId = testPaperId;
    }

    // Fetch total matching count & data concurrently
    const [totalMatching, rawAttempts, totalStats] = await Promise.all([
      prisma.testAttempt.count({ where }),
      prisma.testAttempt.findMany({
        where,
        skip,
        take: validatedLimit,
        orderBy: {
          startedAt: "desc",
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
                    },
                  },
                },
              },
              _count: {
                select: {
                  questions: true,
                },
              },
            },
          },
          responses: {
            select: {
              id: true,
              questionId: true,
              userAnswer: true,
              isCorrect: true,
              timeTaken: true,
            },
          },
        },
      }),
      // Summary stats across all attempts
      prisma.testAttempt.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        _avg: {
          score: true,
        },
      }),
    ]);

    // Compute summary stats
    let totalAttemptsCount = 0;
    let completedAttemptsCount = 0;
    let inProgressAttemptsCount = 0;
    let totalScoreSum = 0;
    let completedWithScoreCount = 0;

    totalStats.forEach((group) => {
      const count = group._count.id;

      totalAttemptsCount += count;
      if (group.status === AttemptStatus.COMPLETED) {
        completedAttemptsCount += count;
        if (group._avg.score !== null) {
          totalScoreSum += (group._avg.score || 0) * count;
          completedWithScoreCount += count;
        }
      } else {
        inProgressAttemptsCount += count;
      }
    });

    const averageScore =
      completedWithScoreCount > 0
        ? Number((totalScoreSum / completedWithScoreCount).toFixed(1))
        : 0;

    // Distinct users count
    const uniqueUsersCount = await prisma.user.count({
      where: {
        testAttempts: {
          some: {},
        },
      },
    });

    // Format attempts
    const attempts: AdminAttemptItem[] = rawAttempts.map((att) => {
      const totalQuestions = att.testPaper._count.questions;
      const answeredResponses = att.responses.filter(
        (r) => r.userAnswer !== null && r.userAnswer !== "",
      );
      const answeredCount = answeredResponses.length;
      const correctCount = att.responses.filter((r) => r.isCorrect).length;
      const incorrectCount = answeredCount - correctCount;
      const unansweredCount = Math.max(0, totalQuestions - answeredCount);

      const accuracy =
        answeredCount > 0
          ? Number(((correctCount / answeredCount) * 100).toFixed(1))
          : 0;

      // Calculate time spent
      let timeSpentSeconds = att.responses.reduce(
        (acc, curr) => acc + (curr.timeTaken || 0),
        0,
      );

      if (timeSpentSeconds === 0 && att.submittedAt && att.startedAt) {
        timeSpentSeconds = Math.max(
          0,
          Math.floor(
            (new Date(att.submittedAt).getTime() -
              new Date(att.startedAt).getTime()) /
              1000,
          ),
        );
      }

      // Hierarchy breadcrumb
      const catParts: string[] = [];

      if (att.testPaper.category?.parent?.name) {
        catParts.push(att.testPaper.category.parent.name);
      }
      if (att.testPaper.category?.name) {
        catParts.push(att.testPaper.category.name);
      }
      const categoryHierarchy =
        catParts.length > 0 ? catParts.join(" > ") : "General";

      return {
        id: att.id,
        userId: att.userId,
        user: att.user || {
          id: att.userId,
          name: "Unknown Student",
          email: "unknown@example.com",
          image: null,
        },
        testPaperId: att.testPaperId,
        testPaper: att.testPaper,
        score: att.score,
        status: att.status,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt,
        language: att.language,
        totalQuestions,
        answeredCount,
        correctCount,
        incorrectCount,
        unansweredCount,
        accuracy,
        timeSpentSeconds,
        categoryHierarchy,
      };
    });

    return {
      attempts,
      pagination: {
        total: totalMatching,
        page: validatedPage,
        limit: validatedLimit,
        totalPages: Math.max(1, Math.ceil(totalMatching / validatedLimit)),
      },
      summaryStats: {
        totalAttempts: totalAttemptsCount,
        completedAttempts: completedAttemptsCount,
        inProgressAttempts: inProgressAttemptsCount,
        uniqueUsersCount,
        averageScore,
      },
    };
  });
}

/**
 * Retrieves detailed attempt information for admin review and report generation.
 * Can inspect any student attempt with full question responses and solutions.
 */
export async function getAdminAttemptDetailsAction({
  attemptId,
}: {
  attemptId: string;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();

    if (!isAuth) {
      throw new ActionError(
        "Admin authorization required",
        ErrorTypes.UNAUTHORIZED,
      );
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
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

    // Merge questions with student responses
    const questions = testQuestions.map((tq) => {
      const studentResponse =
        attempt.responses.find((r) => r.questionId === tq.questionId) || null;

      return {
        id: tq.id,
        testPaperId: tq.testPaperId,
        questionId: tq.questionId,
        positiveMarks: tq.positiveMarks,
        negativeMarks: tq.negativeMarks,
        orderIndex: tq.orderIndex,
        question: tq.question,
        studentResponse,
      };
    });

    // Build hierarchy string
    const hierarchyParts: string[] = [];
    let currentCat: any = attempt.testPaper?.category;

    while (currentCat) {
      hierarchyParts.unshift(currentCat.name);
      currentCat = currentCat.parent;
    }
    const categoryHierarchy =
      hierarchyParts.length > 0
        ? hierarchyParts.join(" > ")
        : "General Assessment";

    return {
      user: attempt.user || {
        id: attempt.userId,
        name: "Student",
        email: "N/A",
        image: null,
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

/**
 * Deletes an attempt and associated student responses (Admin only).
 */
export async function deleteAdminAttemptAction({
  attemptId,
}: {
  attemptId: string;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();

    if (!isAuth) {
      throw new ActionError(
        "Admin authorization required",
        ErrorTypes.UNAUTHORIZED,
      );
    }

    // Delete responses first then attempt
    await prisma.$transaction([
      prisma.studentResponse.deleteMany({
        where: { attemptId },
      }),
      prisma.testAttempt.delete({
        where: { id: attemptId },
      }),
    ]);

    return { success: true };
  });
}
