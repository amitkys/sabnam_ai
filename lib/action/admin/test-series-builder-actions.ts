"use server";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { prisma } from "@/lib/db";
import { ErrorTypes } from "@/lib/error-type";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { NormalizedQuestion, NormalizedOption, NormalizedSection } from "@/lib/question-parser";
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
 * Creates a TestPaper, optional Sections, and all Questions in one atomic transaction
 */
export async function createTestSeriesWithQuestionsAction({
  testPaper,
  questions,
  sections,
}: {
  testPaper: CreateTestSeriesInput;
  questions: NormalizedQuestion[];
  sections?: NormalizedSection[];
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

      // 2. Handle Sections
      const sectionNameToId = new Map<string, string>();
      if (sections && sections.length > 0) {
        for (let sIdx = 0; sIdx < sections.length; sIdx++) {
          const sec = sections[sIdx];
          const createdSec = await tx.testSection.create({
            data: {
              name: sec.name.trim(),
              orderIndex: sec.orderIndex || sIdx + 1,
              description: sec.description || null,
              duration: sec.duration || null,
              testPaperId: test.id,
            },
          });
          sectionNameToId.set(sec.name.trim().toLowerCase(), createdSec.id);
          if (sec.id) sectionNameToId.set(sec.id, createdSec.id);
        }
      } else {
        // Auto-detect sections from question-level tags if present
        const uniqueSectionNames = Array.from(
          new Set(questions.map((q) => q.section?.trim()).filter(Boolean))
        ) as string[];

        for (let sIdx = 0; sIdx < uniqueSectionNames.length; sIdx++) {
          const sName = uniqueSectionNames[sIdx];
          const createdSec = await tx.testSection.create({
            data: {
              name: sName,
              orderIndex: sIdx + 1,
              testPaperId: test.id,
            },
          });
          sectionNameToId.set(sName.toLowerCase(), createdSec.id);
        }
      }

      // 3. Create Questions & TestQuestion joins
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

        let targetSectionId: string | null = null;
        if (q.sectionId && sectionNameToId.has(q.sectionId)) {
          targetSectionId = sectionNameToId.get(q.sectionId)!;
        } else if (q.section && sectionNameToId.has(q.section.trim().toLowerCase())) {
          targetSectionId = sectionNameToId.get(q.section.trim().toLowerCase())!;
        }

        await tx.testQuestion.create({
          data: {
            testPaperId: test.id,
            questionId: createdQuestion.id,
            positiveMarks: q.positiveMarks ?? 1,
            negativeMarks: q.negativeMarks ?? 0,
            orderIndex: i + 1,
            sectionId: targetSectionId,
          },
        });
      }

      return test;
    });

    revalidatePath("/admin");
    revalidatePath("/home", "layout");

    return {
      success: true,
      testId: createdTest.id,
      slug: createdTest.slug,
      questionCount: questions.length,
    };
  });
}

/**
 * Retrieves detailed test paper information with all sections, questions, and category breadcrumbs
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
        sections: {
          orderBy: { orderIndex: "asc" },
        },
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            question: true,
            section: true,
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
 * Appends a batch of questions to an existing test paper (optionally targeted to a section)
 */
export async function addQuestionsToTestAction({
  testId,
  questions,
  sectionId,
  sectionName,
}: {
  testId: string;
  questions: NormalizedQuestion[];
  sectionId?: string | null;
  sectionName?: string | null;
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
      let defaultSectionId = sectionId || null;
      if (!defaultSectionId && sectionName?.trim()) {
        let sec = await tx.testSection.findFirst({
          where: { testPaperId: testId, name: { equals: sectionName.trim(), mode: "insensitive" } },
        });
        if (!sec) {
          const maxOrder = await tx.testSection.aggregate({
            where: { testPaperId: testId },
            _max: { orderIndex: true },
          });
          sec = await tx.testSection.create({
            data: {
              testPaperId: testId,
              name: sectionName.trim(),
              orderIndex: (maxOrder._max.orderIndex || 0) + 1,
            },
          });
        }
        defaultSectionId = sec.id;
      }

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

        let targetSecId = defaultSectionId;
        if (q.sectionId) {
          targetSecId = q.sectionId;
        } else if (q.section?.trim()) {
          let sec = await tx.testSection.findFirst({
            where: { testPaperId: testId, name: { equals: q.section.trim(), mode: "insensitive" } },
          });
          if (!sec) {
            const maxOrder = await tx.testSection.aggregate({
              where: { testPaperId: testId },
              _max: { orderIndex: true },
            });
            sec = await tx.testSection.create({
              data: {
                testPaperId: testId,
                name: q.section.trim(),
                orderIndex: (maxOrder._max.orderIndex || 0) + 1,
              },
            });
          }
          targetSecId = sec.id;
        }

        await tx.testQuestion.create({
          data: {
            testPaperId: testId,
            questionId: createdQuestion.id,
            positiveMarks: q.positiveMarks ?? 1,
            negativeMarks: q.negativeMarks ?? 0,
            orderIndex: currentMaxOrder + i + 1,
            sectionId: targetSecId,
          },
        });
      }
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/tests/${testId}`);
    revalidatePath("/home", "layout");

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
    sectionId?: string | null;
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
            sectionId: update.sectionId !== undefined ? update.sectionId : undefined,
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
  sectionId?: string | null;
}

/**
 * Updates full question details: bilingual text, options, correctness, solution, marks, difficulty, type, and section
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

      // 2. If testPaperId is provided and marks/section are passed, update TestQuestion
      if (input.testPaperId) {
        await tx.testQuestion.updateMany({
          where: {
            testPaperId: input.testPaperId,
            questionId: input.questionId,
          },
          data: {
            positiveMarks: input.positiveMarks !== undefined ? input.positiveMarks : undefined,
            negativeMarks: input.negativeMarks !== undefined ? input.negativeMarks : undefined,
            sectionId: input.sectionId !== undefined ? input.sectionId : undefined,
          },
        });
      }

      return q;
    });

    if (input.testPaperId) {
      revalidatePath(`/admin/tests/${input.testPaperId}`);
    }
    revalidatePath("/admin");
    revalidatePath("/home", "layout");

    return updated;
  });
}

/**
 * Replaces / synchronizes all questions and sections in a test paper in one atomic operation
 */
export async function syncAllTestQuestionsAction({
  testPaperId,
  questions,
  sections,
}: {
  testPaperId: string;
  questions: NormalizedQuestion[];
  sections?: NormalizedSection[];
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

      // 4. Clean up old sections for this test paper
      await tx.testSection.deleteMany({
        where: { testPaperId },
      });

      // 5. Create new Sections if provided or detected
      const sectionNameToId = new Map<string, string>();
      if (sections && sections.length > 0) {
        for (let sIdx = 0; sIdx < sections.length; sIdx++) {
          const sec = sections[sIdx];
          const createdSec = await tx.testSection.create({
            data: {
              name: sec.name.trim(),
              orderIndex: sec.orderIndex || sIdx + 1,
              description: sec.description || null,
              duration: sec.duration || null,
              testPaperId,
            },
          });
          sectionNameToId.set(sec.name.trim().toLowerCase(), createdSec.id);
          if (sec.id) sectionNameToId.set(sec.id, createdSec.id);
        }
      } else {
        const uniqueSectionNames = Array.from(
          new Set(questions.map((q) => q.section?.trim()).filter(Boolean))
        ) as string[];

        for (let sIdx = 0; sIdx < uniqueSectionNames.length; sIdx++) {
          const sName = uniqueSectionNames[sIdx];
          const createdSec = await tx.testSection.create({
            data: {
              name: sName,
              orderIndex: sIdx + 1,
              testPaperId,
            },
          });
          sectionNameToId.set(sName.toLowerCase(), createdSec.id);
        }
      }

      // 6. Create new Questions and TestQuestion links
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

        let targetSectionId: string | null = null;
        if (q.sectionId && sectionNameToId.has(q.sectionId)) {
          targetSectionId = sectionNameToId.get(q.sectionId)!;
        } else if (q.section && sectionNameToId.has(q.section.trim().toLowerCase())) {
          targetSectionId = sectionNameToId.get(q.section.trim().toLowerCase())!;
        }

        await tx.testQuestion.create({
          data: {
            testPaperId,
            questionId: createdQuestion.id,
            positiveMarks: posMarks,
            negativeMarks: negMarks,
            orderIndex: i + 1,
            sectionId: targetSectionId,
          },
        });
      }

      // 7. Update test paper totalMarks
      await tx.testPaper.update({
        where: { id: testPaperId },
        data: {
          totalMarks: totalCalculatedMarks > 0 ? totalCalculatedMarks : testPaper.totalMarks,
        },
      });
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/tests/${testPaperId}`);
    revalidatePath("/home", "layout");

    return { success: true, count: questions.length };
  });
}

/**
 * Assigns or removes a question's section
 */
export async function assignQuestionToSectionAction({
  testPaperId,
  questionId,
  sectionId,
}: {
  testPaperId: string;
  questionId: string;
  sectionId: string | null;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    await prisma.testQuestion.updateMany({
      where: { testPaperId, questionId },
      data: { sectionId },
    });

    revalidatePath(`/admin/tests/${testPaperId}`);
    return { success: true };
  });
}

/**
 * Creates a new section for a test paper
 */
export async function createTestSectionAction({
  testPaperId,
  name,
  description,
  duration,
}: {
  testPaperId: string;
  name: string;
  description?: string | null;
  duration?: number | null;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    const cleanName = name?.trim();
    if (!cleanName) {
      throw new ActionError("Section name is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    const maxOrder = await prisma.testSection.aggregate({
      where: { testPaperId },
      _max: { orderIndex: true },
    });

    const newSection = await prisma.testSection.create({
      data: {
        testPaperId,
        name: cleanName,
        description: description?.trim() || null,
        duration: duration || null,
        orderIndex: (maxOrder._max.orderIndex || 0) + 1,
      },
    });

    revalidatePath(`/admin/tests/${testPaperId}`);
    return newSection;
  });
}

/**
 * Updates a section's details
 */
export async function updateTestSectionAction({
  sectionId,
  testPaperId,
  name,
  description,
  duration,
}: {
  sectionId: string;
  testPaperId: string;
  name: string;
  description?: string | null;
  duration?: number | null;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    const cleanName = name?.trim();
    if (!cleanName) {
      throw new ActionError("Section name is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    const updated = await prisma.testSection.update({
      where: { id: sectionId },
      data: {
        name: cleanName,
        description: description !== undefined ? description?.trim() || null : undefined,
        duration: duration !== undefined ? duration : undefined,
      },
    });

    revalidatePath(`/admin/tests/${testPaperId}`);
    return updated;
  });
}

/**
 * Deletes a section (unlinking its questions to null section without deleting questions)
 */
export async function deleteTestSectionAction({
  sectionId,
  testPaperId,
}: {
  sectionId: string;
  testPaperId: string;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    await prisma.$transaction(async (tx) => {
      // Unlink questions from this section
      await tx.testQuestion.updateMany({
        where: { testPaperId, sectionId },
        data: { sectionId: null },
      });

      // Delete the section record
      await tx.testSection.delete({
        where: { id: sectionId },
      });
    });

    revalidatePath(`/admin/tests/${testPaperId}`);
    return { success: true };
  });
}


