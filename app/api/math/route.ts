import { NextRequest } from "next/server";

import { GetServerSessionHere } from "@/auth.config";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const claas = searchParams.get("claas");
  const subject = searchParams.get("subject");
  const chapter = searchParams.get("chapter");
  const session = await GetServerSessionHere();
  const userId = session.user.id;

  if (!claas || !subject || !chapter) {
    return Response.json(
      {
        success: false,
        error: "Not getting enough data to fetch Test-Series",
      },
      { status: 400 }
    );
  }

  if (!userId) {
    return Response.json(
      {
        success: false,
        error: "User not found",
      },
      { status: 400 }
    );
  }

  try {
    const titlePattern = `10th Math ${chapter}`;

    const testSeries = await prisma.testSeries.findMany({
      where: {
        title: {
          contains: titlePattern,
          mode: "insensitive",
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

    // map the response with attempt test details
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
        hasAttempted,
        lastScore,
        isCompleted,
        totalQuestions: series._count.questions,
      };
    });

    return Response.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.log("Error fetching test series", error);
  }

  return Response.json({ name: "working good" });
}
