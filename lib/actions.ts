"use server";
import { Data, TestAttemptSubmission } from "@/lib/type";
import prisma from "@/lib/db";
import { GetServerSessionHere } from "@/auth.config";
export async function CreateTest(data: Data) {
  const session = await GetServerSessionHere();

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testSeries = await prisma.testSeries.create({
      data: {
        title: data.testseries.title,
        duration: data.testseries.duration,
        userId: session.user.id, // Associate test series with user
        questions: {
          create: data.questions.map((question) => ({
            text: question.text,
            answer: question.answer,
            options: {
              create: question.options.map((option) => ({
                text: option.text,
              })),
            },
          })),
        },
      },
    });

    console.log("data inserted");
  } catch (error: any) {
    console.error("Error creating test:", error);
    throw error;
  }
}

// export async function GetTestSeries(
//   id: string
// ): Promise<FetchedTestSeriesData | null> {
//   // await new Promise((resolve) => setTimeout(resolve, 2000));
//   try {
//     const testSeries = await prisma.testSeries.findUnique({
//       where: {
//         id: id,
//       },
//       include: {
//         questions: {
//           include: {
//             options: true,
//           },
//         },
//       },
//     });

//     if (!testSeries) {
//       return null;
//     }

//     // Constructing the response in the Data interface format
//     return {
//       testseries: {
//         id: testSeries.id,
//         title: testSeries.title,
//         duration: testSeries.duration * 60, // sending into second (stored was into minute)
//       },
//       questions: testSeries.questions.map((question) => ({
//         id: question.id,
//         text: question.text,
//         // Assuming 'answer' is the correct answer text, not the answer ID
//         answer: question.answer,
//         options: question.options.map((option) => ({
//           id: option.id,
//           text: option.text,
//         })),
//       })),
//     };
//   } catch (error) {
//     console.error("Error fetching test series:", error);
//     throw error; // or handle the error as needed
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function CreateTestAttempt(data: TestAttemptSubmission) {
  console.log(data);

  try {
    // Calculate the score based on correct answers
    const score = data.answers.reduce(
      (acc, answer) => (answer.isCorrect ? acc + 1 : acc),
      0,
    );

    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId: data.userId,
        testSeriesId: data.testSeriesId,
        startedAt: new Date(data.startedAt),
        completedAt: new Date(data.completedAt),
        score: score, // Set the calculated score here
        answers: {
          create: data.answers.map((answer) => ({
            questionId: answer.questionId,
            optionId: answer.optionId,
            isCorrect: answer.isCorrect,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    return testAttempt.id;
  } catch (error: any) {
    console.error("Error creating test attempt:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAnalysisForTestAttempt(testAttemptId: string) {
  // await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate database delay to mimic real-world conditions
  try {
    // Fetch the TestAttempt using the provided testAttemptId. This query includes:
    // - The TestSeries this attempt belongs to, which in turn includes all questions and their options.
    // - All answers given by the user for this attempt, including details of which question and option they relate to.
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
      include: {
        testSeries: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    });

    if (!testAttempt) {
      throw new Error("Test attempt not found"); // If no attempt matches the ID, throw an error.
    }

    // Structure the data to match the desired output format:
    const result = {
      // Title of the TestSeries associated with this attempt
      title: testAttempt.testSeries.title,

      // Array of questions from the TestSeries. Each question includes:
      questions: testAttempt.testSeries.questions.map((question) => ({
        id: question.id,
        text: question.text,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
        })),
        correctAnswer: question.answer, // The correct answer for each question
      })),

      // Details of the user's attempt, encapsulated in an array (even though it's just one attempt here):
      userAttempts: [
        {
          attemptId: testAttempt.id, // The ID of this test attempt
          startedAt: testAttempt.startedAt, // When the attempt began
          completedAt: testAttempt.completedAt, // When the attempt was completed (if applicable)
          score: testAttempt.score, // The score the user achieved in this attempt

          // Map through all answers given in this attempt, providing:
          answers: testAttempt.answers.map((answer) => ({
            questionId: answer.questionId, // The question this answer pertains to
            userAnswer: answer.option?.text, // The text of the option chosen by the user
            isCorrect: answer.isCorrect, // Boolean indicating if the answer was correct
          })),
        },
      ],

      // Total marks possible for this test series, calculated by the number of questions
      totalMarks: testAttempt.testSeries.questions.length,
    };

    return result; // Return the structured data as per the function's promise
  } catch (error) {
    console.error("Error fetching test attempt details:", error); // Log any errors encountered during the operation
    throw error; // Re-throw the error to be handled by the caller of this function
  } finally {
    await prisma.$disconnect(); // Ensure to close the database connection to prevent resource leaks
  }
}

export async function getUserTestSummary(userId: string) {
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
        testName: test.testSeries.title,
        attemptDate: test.startedAt,
        obtainedMarks: obtainedMarks,
        totalMarks: totalMarks,
      };
    });

    return testSummary;
  } catch (error: any) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTestAttemptId(id: string) {
  // testSeriesId
  try {
    const session = await GetServerSessionHere();
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        testSeriesId: id,
        startedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    return testAttempt.id;
  } catch (error: any) {
    console.error("Error creating test attempt:", error);
    throw new Error("Failed to create test attempt");
  }
}

export default async function loggerSession() {
  const session = await GetServerSessionHere();

  console.log(session.user.id);
}

type SaveQuestionResponseParams = {
  testAttemptId: string;
  questionId: string;
  optionId?: string | null;
  markAs: "solved" | "later" | "skipped";
  isCorrect?: boolean;
};

export async function SaveQuestionResponse({
  testAttemptId,
  questionId,
  optionId,
  markAs,
  isCorrect,
}: SaveQuestionResponseParams) {
  try {
    // Check if an answer for this question already exists
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        testAttemptId,
        questionId,
      },
    });

    if (existingAnswer) {
      // Update existing answer
      await prisma.answer.update({
        where: {
          id: existingAnswer.id,
        },
        data: {
          markAs,
          optionId: optionId || null,
          isCorrect:
            isCorrect !== undefined ? isCorrect : existingAnswer.isCorrect,
        },
      });
    } else {
      // Create new answer
      await prisma.answer.create({
        data: {
          testAttemptId,
          questionId,
          markAs,
          optionId: optionId || null,
          isCorrect: isCorrect !== undefined ? isCorrect : false,
        },
      });
    }

    // Update the score in TestAttempt
    // First get all answers for this test attempt
    const allAnswers = await prisma.answer.findMany({
      where: {
        testAttemptId: testAttemptId,
      },
    });

    // Calculate the new score based on correct answers
    const updatedScore = allAnswers.reduce(
      (acc, answer) => (answer.isCorrect ? acc + 1 : acc),
      0,
    );

    // Update the TestAttempt score
    await prisma.testAttempt.update({
      where: {
        id: testAttemptId,
      },
      data: {
        score: updatedScore,
      },
    });

    // Return success indicator
    return { success: true };
  } catch (error) {
    console.error("Error saving question response:", error);

    return { success: false, error: "Failed to save response" };
  }
}

// export async function SaveQuestionResponse({
//   testAttemptId,
//   questionId,
//   optionId,
//   markAs,
//   isCorrect,
// }: SaveQuestionResponseParams) {
//   try {
//     // Check if an answer for this question already exists
//     const existingAnswer = await prisma.answer.findFirst({
//       where: {
//         testAttemptId,
//         questionId,
//       },
//     });

//     // Handle the answer update/creation
//     let answerPromise;

//     if (existingAnswer) {
//       // Update existing answer
//       answerPromise = prisma.answer.update({
//         where: {
//           id: existingAnswer.id,
//         },
//         data: {
//           markAs,
//           optionId: optionId || null,
//           isCorrect:
//             isCorrect !== undefined ? isCorrect : existingAnswer.isCorrect,
//         },
//       });
//     } else {
//       // Create new answer
//       answerPromise = prisma.answer.create({
//         data: {
//           testAttemptId,
//           questionId,
//           markAs,
//           optionId: optionId || null,
//           isCorrect: isCorrect !== undefined ? isCorrect : false,
//         },
//       });
//     }

//     // Get all answers for score calculation in parallel with the answer update/creation
//     const allAnswersPromise = prisma.answer.findMany({
//       where: {
//         testAttemptId: testAttemptId,
//       },
//       select: {
//         isCorrect: true,
//       },
//     });

//     // Wait for both operations to complete
//     const [_, allAnswers] = await Promise.all([
//       answerPromise,
//       allAnswersPromise,
//     ]);

//     // Calculate the new score based on correct answers
//     const updatedScore = allAnswers.reduce(
//       (acc, answer) => (answer.isCorrect ? acc + 1 : acc),
//       0,
//     );

//     // Update the TestAttempt score
//     await prisma.testAttempt.update({
//       where: {
//         id: testAttemptId,
//       },
//       data: {
//         score: updatedScore,
//       },
//     });

//     // Return success indicator
//     return { success: true };
//   } catch (error) {
//     console.error("Error saving question response:", error);

//     return { success: false, error: "Failed to save response" };
//   }
// }

export async function SubmitTest({ testAttemptId }: { testAttemptId: string }) {
  try {
    // Update the TestAttempt score
    await prisma.testAttempt.update({
      where: {
        id: testAttemptId,
      },
      data: {
        completedAt: new Date(),
      },
    });

    // Return success indicator
    return { success: true };
  } catch (error) {
    console.error("Error saving question response:", error);

    return { success: false, error: "Failed to save response" };
  }
}
