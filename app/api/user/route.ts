import { NextRequest } from "next/server";

import prisma from "@/lib/db";
import { GetServerSessionHere } from "@/auth.config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const subject = searchParams.get("subject");
  const className = searchParams.get("class");
  const year = searchParams.get("year");
  const session = await GetServerSessionHere();
  const userId = session.user.id;

  // Check if all required parameters are provided
  if (!topic || !subject || !className || !year) {
    return Response.json(
      {
        success: false,
        error: "Not getting enough data to fetch Previous test series",
      },
      { status: 400 },
    );
  }

  if (!userId) {
    return Response.json(
      {
        success: false,
        error: "Not getting enough data to fetch Previous test series",
      },
      { status: 400 },
    );
  }

  try {
    // Construct the pattern for matching the test series title
    const titlePattern =
      `Prev ${topic} ${subject} ${className}-${year}`.toLowerCase();

    // Query for TestSeries where the title matches the pattern
    const testSeries = await prisma.testSeries.findMany({
      where: {
        title: {
          contains: titlePattern,
          mode: "insensitive", // Case-insensitive search
        },
      },
      include: {
        testAttempts: {
          where: {
            userId: userId,
          },
          orderBy: {
            startedAt: "desc",
          },
          take: 1,
          select: {
            score: true,
            completedAt: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

// Map the response to include attempt status, last score, and question count
    const responseData = testSeries.map((series) => {
      const hasAttempted = series.testAttempts.length > 0;
      const lastScore = hasAttempted ? series.testAttempts[0].score : null;
      const isCompleted = hasAttempted
        ? series.testAttempts[0].completedAt !== null
        : false;

      return {
        id: series.id,
        title: series.title,
        duration: series.duration,
        hasAttempted, // Boolean indicating if the user attempted this series
        lastScore, // Last score if attempted, null otherwise
        isCompleted, // Whether the last attempt was completed
        totalQuestions: series._count.questions, // Total number of questions
      };
    });

    return Response.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching test series:", error);

    return Response.json(
      { success: false, error: "Failed to fetch test series" },
      { status: 500 },
    );
  }
}
