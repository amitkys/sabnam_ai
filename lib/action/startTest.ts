"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function startTest({ testId }: { testId: string }) {
  const session = await auth.api.getSession({ headers: await headers() })
  console.log("session", session);

  if (!session?.user.id) {
    return null;
  }
  // 1. Check if an unfinished attempt already exists?
  const existing = await prisma.testAttempt.findFirst({
    where: {
      testPaperId: testId,
      userId: session.user.id,
      status: "STARTED" // or PAUSED
    }
  });

  if (existing) {
    // resume this attempt
    return existing.id;
  };

  // if no, create new attempt:
  const newAttempt = await prisma.testAttempt.create({
    data: {
      testPaperId: testId,
      userId: session.user.id,
      status: "STARTED"
    }
  })

  return newAttempt.id;
}