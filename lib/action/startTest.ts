"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ({testId, userId}: {testId: string; userId: string}) {
  const session = await auth.api.getSession({ headers: await headers() })
  // 1. Check if an unfinished attempt already exists?
  const existing = await prisma.testAttempt.findFirst({
    where: {
      testPaperId: testId,
      userId: session?.user.id,
      status: "STARTED" // or PAUSED
    }
  });
}