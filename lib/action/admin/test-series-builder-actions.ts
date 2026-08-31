"use server";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { prisma } from "@/lib/db";
import { ErrorTypes } from "@/lib/error-type";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { NormalizedQuestion, NormalizedOption } from "@/lib/question-parser";
import { Prisma } from "@/lib/generated/prisma/client";
import { QuestionType, Difficulty } from "@/lib/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export interface CreateTestSeriesInput {
  title: string;
  slug: string;
  description?: string | null;
  duration: number;
  totalMarks: number;
  languages?: string[];
  isPublished?: boolean;
  categoryId: string;
}

/**
 * Creates a TestPaper and all its Questions in one atomic transaction
 */
export async function createTestSeriesWithQuestionsAction({
  testPaper,
  questions,
}: {
  testPaper: CreateTestSeriesInput;
  questions: NormalizedQuestion[];
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!testPaper.title?.trim()) {
      throw new ActionError("Test title is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    if (!testPaper.categoryId) {
      throw new ActionError("Target category/folder is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    if (!questions || questions.length === 0) {
      throw new ActionError("At least one question is required to create a test series", ErrorTypes.INVALID_INPUT);
    }

    const cleanTitle = testPaper.title.trim();
    const cleanSlug = (
      testPaper.slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    ).trim();

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: testPaper.categoryId },
    });

    if (!category) {
      throw new ActionError("Selected category/folder does not exist", ErrorTypes.NOT_FOUND);
    }

    // Check slug uniqueness
    const existingTest = await prisma.testPaper.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingTest) {
      throw new ActionError(`A test paper with slug "${cleanSlug}" already exists`, ErrorTypes.DUPLICATE);
    }

    // Calculate auto total marks if not provided or 0
    let computedTotalMarks = testPaper.totalMarks;
    if (!computedTotalMarks || computedTotalMarks <= 0) {
      computedTotalMarks = questions.reduce((sum, q) => sum + (q.positiveMarks || 1), 0);
    }

    // Execute atomic transaction
    const createdTest = await prisma.$transaction(async (tx) => {
      // 1. Create Test Paper
      const test = await tx.testPaper.create({
        data: {
          title: cleanTitle,
          slug: cleanSlug,
          description: testPaper.description?.trim() || null,
          duration: Math.max(1, Number(testPaper.duration) || 90),
          totalMarks: Math.max(1, Number(computedTotalMarks)),
          languages: testPaper.languages && testPaper.languages.length > 0 ? testPaper.languages : ["en", "hi"],
          isPublished: testPaper.isPublished ?? true,
          categoryId: testPaper.categoryId,
        },
      });

      // 2. Create Questions & TestQuestion joins
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        const createdQuestion = await tx.question.create({
          data: {
            content: q.content as unknown as Prisma.InputJsonValue,
            type: q.type,
            difficulty: q.difficulty,
            options: q.options as unknown as Prisma.InputJsonValue,
            correctValue: q.correctValue,
            solution: q.solution as unknown as Prisma.InputJsonValue,
            imageUrl: q.imageUrl || null,
            categoryId: testPaper.categoryId,
          },
        });

        await tx.testQuestion.create({
          data: {
            testPaperId: test.id,
            questionId: createdQuestion.id,
            positiveMarks: q.positiveMarks ?? 1,
            negativeMarks: q.negativeMarks ?? 0,
            orderIndex: i + 1,
          },
        });
      }

      return test;
    });

    revalidatePath("/admin");
    revalidatePath("/home");

    return {
      success: true,
      testId: createdTest.id,
      slug: createdTest.slug,
      questionCount: questions.length,
    };
  });
}

/**
 * Retrieves detailed test paper information with all questions and category breadcrumbs
 */
export async function getAdminTestDetailAction({ testId }: { testId: string }) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!testId) {
      throw new ActionError("Test ID is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    const testPaper = await prisma.testPaper.findUnique({
      where: { id: testId },
      include: {
        category: {
          include: {
            parent: {
              include: {
                parent: true,
              },
            },
          },
        },
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            question: true,
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!testPaper) {
      throw new ActionError("Test paper not found", ErrorTypes.NOT_FOUND);
    }

    return testPaper;
  });
}

/**
 * Appends a batch of questions to an existing test paper
 */
export async function addQuestionsToTestAction({
  testId,
  questions,
}: {
  testId: string;
  questions: NormalizedQuestion[];
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!testId || !questions || questions.length === 0) {
      throw new ActionError("Test ID and questions are required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    const testPaper = await prisma.testPaper.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { orderIndex: "desc" },
          take: 1,
        },
      },
    });

    if (!testPaper) {
      throw new ActionError("Test paper not found", ErrorTypes.NOT_FOUND);
    }

    const currentMaxOrder = testPaper.questions[0]?.orderIndex || 0;

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        const createdQuestion = await tx.question.create({
          data: {
            content: q.content as unknown as Prisma.InputJsonValue,
            type: q.type,
            difficulty: q.difficulty,
            options: q.options as unknown as Prisma.InputJsonValue,
            correctValue: q.correctValue,
            solution: q.solution as unknown as Prisma.InputJsonValue,
            imageUrl: q.imageUrl || null,
            categoryId: testPaper.categoryId,
          },
        });

        await tx.testQuestion.create({
          data: {
            testPaperId: testId,
            questionId: createdQuestion.id,
            positiveMarks: q.positiveMarks ?? 1,
            negativeMarks: q.negativeMarks ?? 0,
            orderIndex: currentMaxOrder + i + 1,
          },
        });
      }
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/tests/${testId}`);
    revalidatePath("/home");

    return { success: true, addedCount: questions.length };
  });
}

/**
 * Unlinks a question from a test paper (and deletes question if exclusive)
 */
export async function removeQuestionFromTestAction({
  testPaperId,
  questionId,
}: {
  testPaperId: string;
  questionId: string;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!testPaperId || !questionId) {
      throw new ActionError("Test paper ID and Question ID are required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete test question link
      await tx.testQuestion.delete({
        where: {
          testPaperId_questionId: {
            testPaperId,
            questionId,
          },
        },
      });

      // 2. Check if question is used in any other test paper
      const otherUsages = await tx.testQuestion.count({
        where: { questionId },
      });

      // If not used anywhere else, clean up student responses and question
      if (otherUsages === 0) {
        await tx.studentResponse.deleteMany({
          where: { questionId },
        });
        await tx.question.delete({
          where: { id: questionId },
        });
      }
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/tests/${testPaperId}`);

    return { success: true, removedId: questionId };
  });
}

/**
 * Reorders questions and updates question marks in a test paper
 */
export async function reorderTestQuestionsAction({
  testPaperId,
  questionUpdates,
}: {
  testPaperId: string;
  questionUpdates: Array<{
    questionId: string;
    orderIndex: number;
    positiveMarks?: number;
    negativeMarks?: number;
  }>;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    await prisma.$transaction(async (tx) => {
      for (const update of questionUpdates) {
        await tx.testQuestion.update({
          where: {
            testPaperId_questionId: {
              testPaperId,
              questionId: update.questionId,
            },
          },
          data: {
            orderIndex: update.orderIndex,
            positiveMarks: update.positiveMarks !== undefined ? update.positiveMarks : undefined,
            negativeMarks: update.negativeMarks !== undefined ? update.negativeMarks : undefined,
          },
        });
      }
    });

    revalidatePath(`/admin/tests/${testPaperId}`);
    return { success: true };
  });
}

export interface UpdateQuestionInput {
  questionId: string;
  testPaperId?: string;
  content: {
    en: string;
    hi: string;
  };
  type: QuestionType;
  difficulty: Difficulty;
  options: NormalizedOption[];
  correctValue: string;
  solution: {
    en: string;
    hi: string;
  };
  positiveMarks?: number;
  negativeMarks?: number;
}

/**
 * Updates full question details: bilingual text, options, correctness, solution, marks, difficulty, and type
 */
export async function updateQuestionDetailAction(input: UpdateQuestionInput) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!input.questionId) {
      throw new ActionError("Question ID is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Question model
      const q = await tx.question.update({
        where: { id: input.questionId },
        data: {
          content: input.content as unknown as Prisma.InputJsonValue,
          type: input.type,
          difficulty: input.difficulty,
          options: input.options as unknown as Prisma.InputJsonValue,
          correctValue: input.correctValue,
          solution: input.solution as unknown as Prisma.InputJsonValue,
        },
      });

      // 2. If testPaperId is provided and marks are passed, update TestQuestion
      if (input.testPaperId) {
        await tx.testQuestion.updateMany({
          where: {
            testPaperId: input.testPaperId,
            questionId: input.questionId,
          },
          data: {
            positiveMarks: input.positiveMarks !== undefined ? input.positiveMarks : undefined,
            negativeMarks: input.negativeMarks !== undefined ? input.negativeMarks : undefined,
          },
        });
      }

      return q;
    });

    if (input.testPaperId) {
      revalidatePath(`/admin/tests/${input.testPaperId}`);
    }
    revalidatePath("/admin");
    revalidatePath("/home");

    return updated;
  });
}

/**
 * Replaces / synchronizes all questions in a test paper in one atomic operation
 */
export async function syncAllTestQuestionsAction({
  testPaperId,
  questions,
}: {
  testPaperId: string;
  questions: NormalizedQuestion[];
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!testPaperId) {
      throw new ActionError("Test paper ID is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    const testPaper = await prisma.testPaper.findUnique({
      where: { id: testPaperId },
      include: {
        questions: {
          include: { question: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!testPaper) {
      throw new ActionError("Test paper not found", ErrorTypes.NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Get existing question IDs
      const existingTQ = testPaper.questions;
      const existingQuestionIds = existingTQ.map((tq) => tq.questionId);

      // 2. Remove all existing TestQuestion links for this test paper
      await tx.testQuestion.deleteMany({
        where: { testPaperId },
      });

      // 3. For each existing question, if not used in any other test paper, delete it
      for (const qId of existingQuestionIds) {
        const otherUsages = await tx.testQuestion.count({
          where: { questionId: qId },
        });
        if (otherUsages === 0) {
          await tx.studentResponse.deleteMany({
            where: { questionId: qId },
          });
          await tx.question.delete({
            where: { id: qId },
          });
        }
      }

      // 4. Create new Questions and TestQuestion links
      let totalCalculatedMarks = 0;
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const posMarks = q.positiveMarks ?? 1;
        const negMarks = q.negativeMarks ?? 0;
        totalCalculatedMarks += posMarks;

        const createdQuestion = await tx.question.create({
          data: {
            content: q.content as unknown as Prisma.InputJsonValue,
            type: q.type,
            difficulty: q.difficulty,
            options: q.options as unknown as Prisma.InputJsonValue,
            correctValue: q.correctValue,
            solution: q.solution as unknown as Prisma.InputJsonValue,
            imageUrl: q.imageUrl || null,
            categoryId: testPaper.categoryId,
          },
        });

        await tx.testQuestion.create({
          data: {
            testPaperId,
            questionId: createdQuestion.id,
            positiveMarks: posMarks,
            negativeMarks: negMarks,
            orderIndex: i + 1,
          },
        });
      }

      // 5. Update test paper totalMarks
      await tx.testPaper.update({
        where: { id: testPaperId },
        data: {
          totalMarks: totalCalculatedMarks > 0 ? totalCalculatedMarks : testPaper.totalMarks,
        },
      });
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/tests/${testPaperId}`);
    revalidatePath("/home");

    return { success: true, count: questions.length };
  });
}


