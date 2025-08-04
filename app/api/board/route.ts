import { NextRequest } from "next/server";

import { GetServerSessionHere } from "@/auth.config";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board");
    const standard = searchParams.get("standard");
    const subject = searchParams.get("subject");
    const chapter = searchParams.get("chapter");
    const session = await GetServerSessionHere();
    const userId = session?.user?.id;

    if (!board || !standard || !subject || !chapter) {
      return Response.json(
        {
          message: "Required data not provided",
        },
        { status: 400 },
      );
    }

    const titlePattern = `${board} ${standard} ${subject} ${chapter}`;

    const testSeries = await prisma.testSeries.findMany({
      where: {
        title: {
          contains: titlePattern,
          mode: "insensitive",
        },
      },
      include: {
        testAttempts: userId ? {
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
        } : undefined,
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    // map the response with attempt test details
    const responseData = testSeries.map((series) => {
      if (!userId) {
        return {
          id: series.id,
          title: series.title,
          duration: series.duration,
          totalQuestions: series._count.questions,
          level: series.level, 
        };
      }

      const hasAttempted = series.testAttempts.length > 0;
      const lastScore = hasAttempted ? series.testAttempts[0].score : null;
      const isCompleted = hasAttempted
        ? series.testAttempts[0].completedAt !== null
        : false;

      return {
        id: series.id,
        title: series.title,
        duration: series.duration,
        hasAttempted,
        lastScore,
        isCompleted,
        totalQuestions: series._count.questions,
        level: series.level,
      };
    });

    return Response.json(
      {
        data: responseData,
      },
      { status: 200 },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);

    return Response.json(
      {
        message: `Unexpected error occured while fetching Test Series`,
      },
      { status: 500 },
    );
  }
}
