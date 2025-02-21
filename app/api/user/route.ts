import { NextRequest } from "next/server";

import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const subject = searchParams.get("subject");
  const className = searchParams.get("class");
  const year = searchParams.get("year");

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
    });

    return Response.json({
      success: true,
      data: testSeries.map((series) => ({
        id: series.id,
        title: series.title,
        duration: series.duration,
      })),
    });
  } catch (error) {
    console.error("Error fetching test series:", error);

    return Response.json(
      { success: false, error: "Failed to fetch test series" },
      { status: 500 },
    );
  }
}
