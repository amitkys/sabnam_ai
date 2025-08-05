import { GetServerSessionHere } from "@/auth.config";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export interface IChartData {
  month: string;
  totalAttempts: number;
}

// Month names for mapping
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    
    const user = await GetServerSessionHere();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the first and last day of the selected year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get test attempts for the user in the selected year, grouped by month
    const attempts = await prisma.testAttempt.findMany({
      where: {
        userId: user.id,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startedAt: true,
      },
    });

    // Initialize monthly counts with 0
    const monthlyCounts = monthNames.map((month, index) => ({
      month,
      totalAttempts: 0,
      monthIndex: index,
    }));

    // Count attempts per month
    attempts.forEach((attempt) => {
      const monthIndex = attempt.startedAt.getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyCounts[monthIndex].totalAttempts++;
      }
    });

    // Sort by month index and remove the index from the response
    const result: IChartData[] = monthlyCounts
      .sort((a, b) => a.monthIndex - b.monthIndex)
      .map(({ monthIndex, ...rest }) => rest);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching test attempts data:", error);
    return NextResponse.json(
      { error: "Failed to fetch test attempts data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
