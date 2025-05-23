import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@/lib/db";
import { authOptions } from "@/auth.config";
import { FetchedTestSeriesData } from "@/lib/type";

// Define TypeScript interfaces based on your schema
interface RequestBody {
  testSeriesId: string;
  attemptId: string;
}

export async function POST(req: NextRequest) {
  try {
    const { testSeriesId, attemptId }: RequestBody = await req.json();
    const session = await getServerSession(authOptions);
    const userId = session.user.id;

    console.log(testSeriesId, attemptId, userId);

    // Validate required fields
    if (!testSeriesId || !attemptId) {
      return NextResponse.json(
        { error: "testSeriesId, userId and attemptId are required" },
        { status: 400 }
      );
    }

    // Fetch TestAttempt with nested TestSeries data in a single query
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        testSeries: {
          select: {
            id: true,
            title: true,
            duration: true,
            createdAt: true,
            questions: {
              select: {
                id: true,
                text: true,
                answer: true,
                options: {
                  select: {
                    id: true,
                    text: true,
                  },
                },
              },
            },
          },
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            markAs: true,
            optionId: true,
            isCorrect: true,
          },
        },
      },
    });

    // Verify the testSeriesId matches
    if (testAttempt?.testSeriesId !== testSeriesId) {
      return NextResponse.json(
        { error: "Test attempt does not belong to the specified test series" },
        { status: 400 }
      );
    }

    // If userId is provided, verify it matches the test attempt
    if (userId && testAttempt && testAttempt.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access to test attempt" },
        { status: 403 }
      );
    }

    // Prepare response
    const response: FetchedTestSeriesData = {
      testAttempt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching test data:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
