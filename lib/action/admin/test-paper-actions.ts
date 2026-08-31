"use server";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { prisma } from "@/lib/db";
import { ErrorTypes } from "@/lib/error-type";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

/**
 * Retrieves all test papers, optionally filtered by category
 */
export async function getAdminTestPapersAction({
  categoryId,
}: {
  categoryId?: string;
} = {}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    const testPapers = await prisma.testPaper.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            level: true,
            slug: true,
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
            attempts: true,
          },
        },
      },
    });

    return testPapers;
  });
}

/**
 * Creates a new test paper linked to a category
 */
export async function createTestPaperAction({
  title,
  slug,
  description,
  duration,
  totalMarks,
  languages = ["en"],
  isPublished = false,
  categoryId,
}: {
  title: string;
  slug: string;
  description?: string | null;
  duration: number;
  totalMarks: number;
  languages?: string[];
  isPublished?: boolean;
  categoryId: string;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    const cleanTitle = title.trim();
    const cleanSlug = (slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).trim();

    if (!cleanTitle) {
      throw new ActionError("Test title is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    if (!cleanSlug) {
      throw new ActionError("Test slug is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    if (!categoryId) {
      throw new ActionError("Target category/folder is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    // Check unique slug
    const existing = await prisma.testPaper.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      throw new ActionError(`A test paper with slug "${cleanSlug}" already exists`, ErrorTypes.DUPLICATE);
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new ActionError("Selected category does not exist", ErrorTypes.NOT_FOUND);
    }

    const created = await prisma.testPaper.create({
      data: {
        title: cleanTitle,
        slug: cleanSlug,
        description: description?.trim() || null,
        duration: Math.max(1, Number(duration) || 60),
        totalMarks: Math.max(0, Number(totalMarks) || 100),
        languages: languages.length > 0 ? languages : ["en"],
        isPublished: Boolean(isPublished),
        categoryId,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/home");

    return created;
  });
}

/**
 * Updates an existing test paper's attributes and placement
 */
export async function updateTestPaperAction({
  id,
  title,
  slug,
  description,
  duration,
  totalMarks,
  languages,
  isPublished,
  categoryId,
}: {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  duration: number;
  totalMarks: number;
  languages?: string[];
  isPublished?: boolean;
  categoryId: string;
}) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!id) {
      throw new ActionError("Test paper ID is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    const cleanTitle = title.trim();
    const cleanSlug = (slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).trim();

    if (!cleanTitle) {
      throw new ActionError("Test title is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    // Check unique slug (excluding itself)
    const existing = await prisma.testPaper.findFirst({
      where: {
        slug: cleanSlug,
        NOT: { id },
      },
    });

    if (existing) {
      throw new ActionError(`A test paper with slug "${cleanSlug}" already exists`, ErrorTypes.DUPLICATE);
    }

    const updated = await prisma.testPaper.update({
      where: { id },
      data: {
        title: cleanTitle,
        slug: cleanSlug,
        description: description !== undefined ? (description?.trim() || null) : undefined,
        duration: duration !== undefined ? Math.max(1, Number(duration)) : undefined,
        totalMarks: totalMarks !== undefined ? Math.max(0, Number(totalMarks)) : undefined,
        languages: languages && languages.length > 0 ? languages : undefined,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
        categoryId: categoryId || undefined,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/home");

    return updated;
  });
}

/**
 * Deletes a test paper
 */
export async function deleteTestPaperAction({ id }: { id: string }) {
  return actionWrapper(async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
    }

    if (!id) {
      throw new ActionError("Test paper ID is required", ErrorTypes.MISSING_REQUIRED_FIELD);
    }

    // Delete linked test questions first
    await prisma.testQuestion.deleteMany({
      where: { testPaperId: id },
    });

    // Delete test paper
    await prisma.testPaper.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/home");

    return { success: true, deletedId: id };
  });
}
