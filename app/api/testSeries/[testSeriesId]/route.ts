import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { GetServerSessionHere } from "@/auth.config";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ testSeriesId: string }> },
) {
  try {
    const session = await GetServerSessionHere();
    const email = session?.user?.email;

    console.log("user email is", email);

    if (email != "amitkys59@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { testSeriesId } = await params;

    console.log("Starting deletion process for test series:", testSeriesId);

    // First check if the test series exists
    const testSeries = await prisma.testSeries.findUnique({
      where: {
        id: testSeriesId,
      },
    });

    if (!testSeries) {
      console.log("Test series not found:", testSeriesId);

      return NextResponse.json(
        { error: "Test series not found" },
        { status: 404 },
      );
    }

    // eslint-disable-next-line no-console
    console.log("Test series found, proceeding with deletion");

    // With `onDelete: Cascade` in the schema, Prisma will automatically delete
    // all related Questions, TestAttempts, and Answers.
    const deletedTestSeries = await prisma.testSeries.delete({
      where: {
        id: testSeriesId,
      },
    });

    // eslint-disable-next-line no-console
    console.log(
      "Successfully completed deletion of test series:",
      testSeriesId,
    );

    return NextResponse.json(
      {
        message: "Test series and all related data deleted successfully",
        deletedId: deletedTestSeries.id,
      },
      { status: 200 },
    );
  } catch (error) {
    // Simple error logging to avoid null payload issues
    // eslint-disable-next-line no-console
    console.error("=== ERROR DELETING TEST SERIES ===");

    try {
      const { testSeriesId } = await params;

      // eslint-disable-next-line no-console
      console.error("TestSeriesId:", testSeriesId);
    } catch (paramError) {
      // eslint-disable-next-line no-console
      console.error("Could not get testSeriesId from params");
    }

    // eslint-disable-next-line no-console
    console.error("Error details:", error);

    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error("Error message:", error.message);
      // eslint-disable-next-line no-console
      console.error("Error stack:", error.stack);
    } else {
      // eslint-disable-next-line no-console
      console.error("Non-Error object thrown:", typeof error, error);
    }

    // eslint-disable-next-line no-console
    console.error("=== END ERROR LOG ===");

    return NextResponse.json(
      {
        error: "Failed to delete test series",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
