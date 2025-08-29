import type {
  ITestAttemptHistory,
  ITestAttemptHistoryResponse,
} from "@/lib/type";

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { GetServerSessionHere } from "@/auth.config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testSeriesId: string }> },
) {
  const { testSeriesId } = await params;

  if (!testSeriesId) {
    return NextResponse.json(
      { message: "Test series ID is required" },
      { status: 400 },
    );
  }

  const user = await GetServerSessionHere();

  if (!user?.user) {
    return NextResponse.json(
      { message: "User is not authenticated" },
      { status: 401 },
    );
  }

  try {
    const testAttemptHistory: ITestAttemptHistory[] =
      await prisma.testAttempt.findMany({
        where: {
          testSeriesId: testSeriesId,
          userId: user.user.id,
        },
        select: {
          id: true,
          score: true,
          startedAt: true,
          completedAt: true,
          testSeries: {
            select: {
              title: true,
              duration: true,
              level: true,
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
        take: 5,
      });

    const response: ITestAttemptHistoryResponse = {
      success: true,
      testAttemptHistory,
      count: testAttemptHistory.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user test attempts:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user test attempts",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
