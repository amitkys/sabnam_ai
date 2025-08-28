import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/auth.config";
import prisma from "@/lib/db";
import { TestAttemptQuestionFetched } from "@/lib/type";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testSeriesId: string; attemptId: string }> },
) {
  try {
    const { testSeriesId, attemptId } = await params;
    const session = await getServerSession(authOptions);
    const userId = session.user.id;

    // Validate required fields
    if (!testSeriesId || !attemptId) {
      return NextResponse.json(
        { message: "Required data not provided" },
        { status: 400 },
      );
    }
    if (!userId) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 },
      );
    }

    // Fetch TestAttempt with nested TestSeries data in a single query
    const testAttempt = (await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        userId: true,
        selectedLanguage: true,
        startedAt: true,
        testSeries: {
          select: {
            id: true,
            title: true,
            exactName: true,
            preferredLanguage: true,
            duration: true,
            createdAt: true,
            level: true,
            availableLanguage: true,
            questions: {
              orderBy: { id: "asc" },
              select: {
                id: true,
                tags: true,
                text: true,
                options: true,
              },
            },
          },
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            markAs: true,
            selectedOptionIndex: true,
          },
        },
      },
    })) as TestAttemptQuestionFetched;

    // Verify the testSeriesId matches
    if (testAttempt?.testSeries.id !== testSeriesId) {
      return NextResponse.json(
        {
          message: "Test attempt does not belong to the specified test series",
        },
        { status: 400 },
      );
    }

    // If userId is provided, verify it matches the test attempt
    if (userId && testAttempt && testAttempt.userId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized access to test attempt" },
        { status: 403 },
      );
    }

    return NextResponse.json(testAttempt, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching test data:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
