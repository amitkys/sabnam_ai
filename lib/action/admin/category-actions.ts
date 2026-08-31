"use server";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { prisma } from "@/lib/db";
import { ErrorTypes } from "@/lib/error-type";
import { CategoryLevel, ExamDomain } from "@/lib/generated/prisma/enums";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  level: CategoryLevel;
  domain: ExamDomain | null;
  parentId: string | null;
  childrenCount: number;
  testCount: number;
  questionCount: number;
  children: CategoryTreeNode[];
}

/**
 * Returns all categories structured as a hierarchical tree
 */
export async function getAdminCategoryTreeAction() {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            children: true,
            tests: true,
            questions: true,
          },
        },
      },
    });

    const categoryMap = new Map<string, CategoryTreeNode>();

    // 1. Initialize map
    for (const cat of categories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        level: cat.level,
        domain: cat.domain,
        parentId: cat.parentId,
        childrenCount: cat._count.children,
        testCount: cat._count.tests,
        questionCount: cat._count.questions,
        children: [],
      });
    }

    // 2. Build tree
    const rootNodes: CategoryTreeNode[] = [];

    for (const cat of categories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }

    return rootNodes;
  });
}

/**
 * Returns a flat list of all categories for dropdown pickers
 */
export async function getAllCategoriesFlatAction() {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    const categories = await prisma.category.findMany({
      orderBy: [{ level: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        level: true,
        domain: true,
        parentId: true,
        parent: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        _count: {
          select: {
            children: true,
            tests: true,
          },
        },
      },
    });

    return categories;
  });
}

/**
 * Creates a new category or subfolder
 */
export async function createCategoryAction({
  name,
  slug,
  level,
  domain,
  parentId,
}: {
  name: string;
  slug: string;
  level: CategoryLevel;
  domain?: ExamDomain | null;
  parentId?: string | null;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    const cleanName = name.trim();
    const cleanSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).trim();

    if (!cleanName) {
      throw new ActionError("Category name is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    if (!cleanSlug) {
      throw new ActionError("Category slug is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    // Check duplicate slug under same parent
    const existing = await prisma.category.findFirst({
      where: {
        slug: cleanSlug,
        parentId: parentId || null,
      },
    });

    if (existing) {
      throw new ActionError(
        `A category with slug "${cleanSlug}" already exists under this parent folder`,
        ErrorTypes.DUPLICATE
      );
    }

    const created = await prisma.category.create({
      data: {
        name: cleanName,
        slug: cleanSlug,
        level,
        domain: level === CategoryLevel.ROOT ? (domain ?? ExamDomain.BOARD) : null,
        parentId: parentId || null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/home");

    return created;
  });
}

/**
 * Updates an existing category
 */
export async function updateCategoryAction({
  id,
  name,
  slug,
  level,
  domain,
  parentId,
}: {
  id: string;
  name: string;
  slug: string;
  level: CategoryLevel;
  domain?: ExamDomain | null;
  parentId?: string | null;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!id) {
      throw new ActionError("Category ID is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    if (parentId === id) {
      throw new ActionError("A category cannot be its own parent", ErrorTypes.INVALID_INPUT);
    }

    const cleanName = name.trim();
    const cleanSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).trim();

    if (!cleanName) {
      throw new ActionError("Category name is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    // Check if duplicate slug under new parent exists (excluding itself)
    const existing = await prisma.category.findFirst({
      where: {
        slug: cleanSlug,
        parentId: parentId || null,
        NOT: { id },
      },
    });

    if (existing) {
      throw new ActionError(
        `Another category with slug "${cleanSlug}" already exists under the chosen parent`,
        ErrorTypes.DUPLICATE
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: cleanName,
        slug: cleanSlug,
        level,
        domain: level === CategoryLevel.ROOT ? domain : null,
        parentId: parentId || null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/home");

    return updated;
  });
}

/**
 * Recursively collects all descendant category IDs (depth-first / BFS)
 */
async function getAllSubtreeCategoryIds(rootId: string): Promise<string[]> {
  const result: string[] = [rootId];
  const queue: string[] = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = await prisma.category.findMany({
      where: { parentId: currentId },
      select: { id: true },
    });
    for (const child of children) {
      result.push(child.id);
      queue.push(child.id);
    }
  }

  return result;
}

/**
 * Deletes a category and recursively cascades through all subcategories and tests.
 * Questions exclusively linked to this subtree are deleted, while questions linked
 * to other tests outside this subtree are preserved.
 */
export async function deleteCategoryAction({ id }: { id: string }) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!id) {
      throw new ActionError("Category ID is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    const targetCategory = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, parentId: true },
    });

    if (!targetCategory) {
      throw new ActionError("Category not found", ErrorTypes.NOT_FOUND);
    }

    // 1. Collect all category IDs in the subtree
    const subtreeCategoryIds = await getAllSubtreeCategoryIds(id);

    // 2. Perform cascade deletion inside a database transaction
    const stats = await prisma.$transaction(async (tx) => {
      // Find all test papers in this subtree
      const subtreeTests = await tx.testPaper.findMany({
        where: { categoryId: { in: subtreeCategoryIds } },
        select: { id: true },
      });
      const subtreeTestIds = subtreeTests.map((t) => t.id);

      // Find all questions directly belonging to any category in this subtree
      const subtreeQuestions = await tx.question.findMany({
        where: { categoryId: { in: subtreeCategoryIds } },
        select: { id: true },
      });
      const subtreeQuestionIds = subtreeQuestions.map((q) => q.id);

      // Check which questions are used in test papers OUTSIDE this subtree
      const externalUsages = await tx.testQuestion.findMany({
        where: {
          questionId: { in: subtreeQuestionIds },
          testPaperId: { notIn: subtreeTestIds },
        },
        select: { questionId: true },
      });
      const sharedQuestionIdSet = new Set(externalUsages.map((u) => u.questionId));

      const exclusiveQuestionIds = subtreeQuestionIds.filter(
        (qId) => !sharedQuestionIdSet.has(qId)
      );
      const sharedQuestionIds = subtreeQuestionIds.filter((qId) =>
        sharedQuestionIdSet.has(qId)
      );

      // If there are shared questions, re-assign their categoryId to a surviving category
      if (sharedQuestionIds.length > 0) {
        // Look for the target category's parent (if outside subtree) or any surviving category
        let fallbackCategory = targetCategory.parentId
          ? await tx.category.findFirst({
              where: {
                id: targetCategory.parentId,
                NOT: { id: { in: subtreeCategoryIds } },
              },
              select: { id: true },
            })
          : null;

        if (!fallbackCategory) {
          fallbackCategory = await tx.category.findFirst({
            where: {
              NOT: { id: { in: subtreeCategoryIds } },
            },
            select: { id: true },
          });
        }

        if (fallbackCategory) {
          await tx.question.updateMany({
            where: { id: { in: sharedQuestionIds } },
            data: { categoryId: fallbackCategory.id },
          });
        }
      }

      // 3. Delete exclusive questions and their response/test links
      if (exclusiveQuestionIds.length > 0) {
        // Delete student responses for exclusive questions
        await tx.studentResponse.deleteMany({
          where: { questionId: { in: exclusiveQuestionIds } },
        });

        // Delete test question links for exclusive questions
        await tx.testQuestion.deleteMany({
          where: { questionId: { in: exclusiveQuestionIds } },
        });

        // Delete the questions themselves
        await tx.question.deleteMany({
          where: { id: { in: exclusiveQuestionIds } },
        });
      }

      // 4. Delete test papers in the subtree and their attempt/response links
      if (subtreeTestIds.length > 0) {
        // Delete student responses for attempts on these tests
        await tx.studentResponse.deleteMany({
          where: { attempt: { testPaperId: { in: subtreeTestIds } } },
        });

        // Delete test attempts
        await tx.testAttempt.deleteMany({
          where: { testPaperId: { in: subtreeTestIds } },
        });

        // Delete remaining test question links for these tests
        await tx.testQuestion.deleteMany({
          where: { testPaperId: { in: subtreeTestIds } },
        });

        // Delete the test papers
        await tx.testPaper.deleteMany({
          where: { id: { in: subtreeTestIds } },
        });
      }

      // 5. Delete categories in reverse hierarchical order (leaves/children first)
      for (let i = subtreeCategoryIds.length - 1; i >= 0; i--) {
        await tx.category.delete({
          where: { id: subtreeCategoryIds[i] },
        });
      }

      return {
        deletedCategoriesCount: subtreeCategoryIds.length,
        deletedTestsCount: subtreeTestIds.length,
        deletedQuestionsCount: exclusiveQuestionIds.length,
        preservedQuestionsCount: sharedQuestionIds.length,
      };
    });

    revalidatePath("/admin");
    revalidatePath("/home");

    return {
      success: true,
      deletedId: id,
      stats,
    };
  });
}

