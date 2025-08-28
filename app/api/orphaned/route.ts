import { NextResponse } from "next/server";

import prisma from "@/lib/db";

export async function DELETE() {
  try {
    // eslint-disable-next-line no-console
    console.log("Starting orphaned data cleanup...");

    // Step 1: Identify and clean orphaned TestAttempts (where testSeries no longer exists)
    // eslint-disable-next-line no-console
    console.log("Cleaning orphaned test attempts...");
    const allTestAttempts = await prisma.testAttempt.findMany({
      select: { id: true, testSeriesId: true },
    });

    const testSeriesIds = new Set(
      (await prisma.testSeries.findMany({ select: { id: true } })).map(
        (ts) => ts.id,
      ),
    );

    const orphanedTestAttemptIds = allTestAttempts
      .filter((attempt) => !testSeriesIds.has(attempt.testSeriesId))
      .map((attempt) => attempt.id);

    if (orphanedTestAttemptIds.length > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `Found ${orphanedTestAttemptIds.length} orphaned test attempts to delete`,
      );
      // Delete answers related to orphaned test attempts first to avoid foreign key issues
      await prisma.answer.deleteMany({
        where: { testAttemptId: { in: orphanedTestAttemptIds } },
      });

      await prisma.testAttempt.deleteMany({
        where: { id: { in: orphanedTestAttemptIds } },
      });
    }

    // Step 2: Identify and clean orphaned Questions (where testSeries no longer exists)
    // eslint-disable-next-line no-console
    console.log("Cleaning orphaned questions...");
    const allQuestions = await prisma.question.findMany({
      select: { id: true, testSeriesId: true },
    });

    const orphanedQuestionIds = allQuestions
      .filter((question) => !testSeriesIds.has(question.testSeriesId))
      .map((question) => question.id);

    if (orphanedQuestionIds.length > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `Found ${orphanedQuestionIds.length} orphaned questions to delete`,
      );

      // Delete answers and options related to orphaned questions first
      await prisma.answer.deleteMany({
        where: { questionId: { in: orphanedQuestionIds } },
      });


      await prisma.question.deleteMany({
        where: { id: { in: orphanedQuestionIds } },
      });
    }


    const questionIds = new Set(
      (await prisma.question.findMany({ select: { id: true } })).map(
        (q) => q.id,
      ),
    );



    // Step 4: Clean remaining orphaned Answers
    // eslint-disable-next-line no-console
    console.log("Cleaning remaining orphaned answers...");
    const allAnswers = await prisma.answer.findMany({
      select: {
        id: true,
        testAttemptId: true,
        questionId: true,
      },
    });

    const testAttemptIds = new Set(
      (await prisma.testAttempt.findMany({ select: { id: true } })).map(
        (ta) => ta.id,
      ),
    );

    const orphanedAnswerIds = allAnswers
      .filter((answer) => {
        // Check if related testAttempt exists
        if (!testAttemptIds.has(answer.testAttemptId)) return true;

        // Check if related question exists
        if (!questionIds.has(answer.questionId)) return true;

        return false;
      })
      .map((answer) => answer.id);

    let answersDeleted = 0;

    if (orphanedAnswerIds.length > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `Found ${orphanedAnswerIds.length} orphaned answers to delete`,
      );

      // Process in batches to avoid potential issues with large arrays
      const batchSize = 100;

      for (let i = 0; i < orphanedAnswerIds.length; i += batchSize) {
        const batch = orphanedAnswerIds.slice(i, i + batchSize);

        await prisma.answer.deleteMany({
          where: { id: { in: batch } },
        });
        answersDeleted += batch.length;
      }
    }

    // eslint-disable-next-line no-console
    console.log("Orphaned data cleanup completed successfully");

    // Don't pass the entire arrays as they might be very large
    return NextResponse.json(
      {
        message: "Data cleaned successfully",
        stats: {
          testAttemptsDeleted: orphanedTestAttemptIds.length,
          questionsDeleted: orphanedQuestionIds.length,
          answersDeleted: answersDeleted,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error cleaning orphaned data:", error);
    // Safely extract error message to avoid serialization issues
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const errorCode =
      error instanceof Error && "code" in error
        ? (error as { code: string }).code
        : "UNKNOWN_ERROR";

    return NextResponse.json(
      {
        message: "Internal server error",
        error: errorMessage,
        code: errorCode,
      },
      { status: 500 },
    );
  }
}
