import { NextRequest, NextResponse } from "next/server";

import { GetServerSessionHere } from "@/auth.config";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get session
    const session = await GetServerSessionHere();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        testAttempts: {
          select: {
            score: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate average score
    const testAttempts = dbUser.testAttempts.filter(
      (attempt) => attempt.score !== null,
    );
    const averageScore =
      testAttempts.length > 0
        ? (
            testAttempts.reduce(
              (sum, attempt) => sum + (attempt.score || 0),
              0,
            ) / testAttempts.length
          ).toFixed(2)
        : "0.00";

    // Construct response matching User interface
    return NextResponse.json(
      {
        name: dbUser.name,
        email: dbUser.email,
        registeredAt: dbUser.createdAt,
        avatar: dbUser.avatar || session.user.avatar || "",
        averageScore,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching user data:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
