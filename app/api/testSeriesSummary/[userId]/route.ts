import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";

export async function GET(req: NextRequest, context: any) {
  const { params } = context;
  const { userId } = await params;

  try {
    const userTests = await prisma.testAttempt.findMany({
      where: {
        userId: userId,
      },
      include: {
        testSeries: {
          select: {
            title: true,
            duration: true,
            questions: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const testSummary = userTests.map((test) => {
      const totalMarks = test.testSeries.questions.length;
      const obtainedMarks = test.score || 0;

      return {
        testSeriesId: test.testSeriesId,
        attempId: test.id,
        testName: test.testSeries.title,
        attemptDate: test.startedAt,
        obtainedMarks: obtainedMarks,
        totalMarks: totalMarks,
      };
    });

    return NextResponse.json({ testSummary });
  } catch (error: any) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
