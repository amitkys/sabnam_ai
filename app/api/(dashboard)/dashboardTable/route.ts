import { NextRequest, NextResponse } from "next/server";

import { GetServerSessionHere } from "@/auth.config";
import prisma from "@/lib/db";

// TypeScript interfaces for the response data
export interface TestAttemptResponse {
  testSeriesId: string;
  testSeriesTitle: string;
  isCompleted: boolean;
  startedAT: Date;
  score: string; // Format: "correctAnswers/totalQuestions"
  attemptId: string;
}

export interface ResponseData {
  testAttempts: TestAttemptResponse[];
  totalCount: number;
}

// Main GET handler
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filterBy = searchParams.get("filterBy") || "recent";
  const pageNo = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  // Validate pagination parameters
  if (pageNo < 1 || pageSize < 1) {
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
      { status: 400 },
    );
  }

  const session = await GetServerSessionHere();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Calculate skip for pagination
    const skip = (pageNo - 1) * pageSize;

    // Determine sorting based on filterBy
    const orderBy = {
      recent: { startedAt: "desc" as const },
      highestScore: { score: "desc" as const },
      lowestScore: { score: "asc" as const },
    }[filterBy] || { startedAt: "desc" as const };

    // Fetch test attempts with related data
    const [testAttempts, totalCount] = await Promise.all([
      prisma.testAttempt.findMany({
        where: { userId },
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          testSeriesId: true,
          completedAt: true,
          startedAt: true,
          score: true,
          testSeries: {
            select: {
              title: true,
              questions: {
                select: { id: true },
              },
            },
          },
          answers: {
            select: { isCorrect: true },
          },
        },
      }),
      prisma.testAttempt.count({ where: { userId } }),
    ]);

    // Format the response data
    const formattedAttempts: TestAttemptResponse[] = testAttempts.map(
      (attempt) => {
        const totalQuestions = attempt.testSeries.questions.length;
        const correctAnswers = attempt.answers.filter(
          (answer) => answer.isCorrect,
        ).length;

        return {
          testSeriesId: attempt.testSeriesId,
          testSeriesTitle: attempt.testSeries.title,
          isCompleted: !!attempt.completedAt,
          startedAT: attempt.startedAt,
          score: `${correctAnswers}/${totalQuestions}`,
          attemptId: attempt.id,
        };
      },
    );

    // Return response with data and pagination info
    return NextResponse.json(
      {
        testAttempts: formattedAttempts,
        totalCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching test attempts:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
