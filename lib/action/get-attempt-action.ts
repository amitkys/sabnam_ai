"use server";

import { auth } from "@/lib/auth";
import { ActionError, actionWrapper } from "@/lib/action-response";
import { prisma } from "@/lib/db";
import { ErrorTypes } from "@/lib/error-type";
import { AttemptStatus } from "@/lib/generated/prisma/client";
import { headers } from "next/headers";

// Define the shape of your Option to help TypeScript
interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean; // Optional because we might remove it
}

export async function getAttemptAction({ attemptId }: { attemptId: string }) {
  return actionWrapper(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new ActionError("User not authenticated", ErrorTypes.UNAUTHORIZED);
    }

    const attempt = await prisma.testAttempt.findFirst({
      where: { id: attemptId, userId: session.user.id },
      include: {
        testPaper: {
          select: {
            id: true,
            title: true,
            duration: true,
            description: true,
            totalMarks: true,
            languages: true,
            questions: {
              orderBy: { orderIndex: "asc" },
              include: {
                question: {
                  select: {
                    id: true,
                    content: true,
                    type: true,
                    options: true,
                    imageUrl: true,
                    solution: true,
                    correctValue: true,
                  }
                },
              }
            }
          }
        },
        responses: true
      }
    });

    if (!attempt) {
      throw new ActionError("Attempt not found", ErrorTypes.NOT_FOUND);
    }

    const isLiveAttempt =
      attempt.status === AttemptStatus.STARTED ||
      attempt.status === AttemptStatus.PAUSED;

    if (isLiveAttempt) {
      attempt.testPaper.questions.forEach((tq) => {
        const q = tq.question as {
          options: unknown;
          solution?: unknown;
          correctValue?: unknown;
        };

        delete q.solution;
        delete q.correctValue;

        const rawOptions = q.options as QuestionOption[];
        if (Array.isArray(rawOptions)) {
          q.options = rawOptions.map((opt) => ({
            id: opt.id,
            text: opt.text,
          }));
        }
      });
    }

    return attempt;
  });
}
