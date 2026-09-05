"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ActionError, actionWrapper } from "@/lib/action-response";
import { ErrorTypes } from "@/lib/error-type";
import { AttemptStatus } from "@/lib/generated/prisma/client";

import { headers } from "next/headers";

export async function startTest({ testId }: { testId: string }) {

  return actionWrapper(async () => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      throw new ActionError("User not authenticated", ErrorTypes.UNAUTHORIZED);
    }

    // Check if test paper exists and is published (Live)
    const testPaper = await prisma.testPaper.findUnique({
      where: { id: testId },
      select: { isPublished: true },
    });

    if (!testPaper || !testPaper.isPublished) {
      throw new ActionError("This test is currently not live", ErrorTypes.NOT_FOUND);
    }

    // 1. Check if an unfinished attempt already exists?
    const existing = await prisma.testAttempt.findFirst({
      where: {
        testPaperId: testId,
        userId: session.user.id,
        status: { in: [AttemptStatus.STARTED, AttemptStatus.PAUSED] }
      }
    });

    if (existing) {
      // resume this attempt
      return existing.id;
    }

    // if no, create new attempt:
    const newAttempt = await prisma.testAttempt.create({
      data: {
        testPaperId: testId,
        userId: session.user.id,
        status: AttemptStatus.STARTED
      }
    });

    return newAttempt.id;
  });
}
