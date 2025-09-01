"use server";
import { revalidatePath } from "next/cache";

import { ITestSeriesInput } from "@/lib/type";
import prisma from "@/lib/db";
import { GetServerSessionHere } from "@/auth.config";

export async function CreateTest(data: ITestSeriesInput) {
  const session = await GetServerSessionHere();

  if (session.user.email != "amitkys59@gmail.com") {
    throw new Error("Unauthorized");
  }
  try {
    const testSeries = await prisma.testSeries.create({
      data: {
        title: data.testseries.title,
        exactName: data.testseries.exactName,
        duration: data.testseries.duration,
        level: data.testseries.level,
        availableLanguage: data.testseries.availableLanguage,
        preferredLanguage: data.testseries.preferredLanguage,
        isPublic: data.testseries.isPublic,
        userId: session.user.id,
        questions: {
          create: data.testseries.questions.map((question) => ({
            text: question.text, // JSON
            answerIndex: question.answerIndex,
            options: question.options, // JSON array
            marks: question.marks ?? 1,
            tags: question.tags ?? [],
          })),
        },
      },
    });

    console.log("Test series created:", testSeries.id);

    return testSeries;
  } catch (error: any) {
    console.error("Error creating test:");
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

export async function getAnalysisForTestAttempt(testAttemptId: string) {
  try {
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
      include: {
        testSeries: {
          include: {
            questions: {
              orderBy: { id: "asc" },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!testAttempt) {
      throw new Error("Test attempt not found");
    }
    const selectedLanguage = (testAttempt.selectedLanguage ?? "en")
      .slice(0, 2)
      .toLowerCase();

    const getLocalizedText = (text: any): string => {
      if (!text) return "";
      if (typeof text === "string") return text;

      return text[selectedLanguage] || text["en"] || "";
    };

    // Structure the data to match the expected format
    const result = {
      // Title from the TestSeries (assuming it's a string or needs conversion)
      exactName: testAttempt.testSeries.exactName,

      // Map questions from the TestSeries
      questions: testAttempt.testSeries.questions.map((question) => {
        const options = Array.isArray(question.options)
          ? question.options
          : typeof question.options === "object" && question.options !== null
            ? Object.values(question.options as any)
            : [];

        const correctAnswerText = options[question.answerIndex]
          ? getLocalizedText(options[question.answerIndex])
          : "Correct answer not available";

        return {
          id: question.id,
          text: getLocalizedText(question.text),
          options: options.map((option, optIndex) => ({
            id: `${question.id}-opt-${optIndex}`, // Generate a stable ID
            text: getLocalizedText(option),
          })),
          correctAnswer: correctAnswerText,
          marks: question.marks,
          tags: question.tags,
        };
      }),

      // User attempts array (contains just this one attempt)
      userAttempts: [
        {
          attemptId: testAttempt.id,
          startedAt: testAttempt.startedAt,
          completedAt: testAttempt.completedAt,
          score: testAttempt.score || 0,

          // Map through answers for this attempt
          answers: testAttempt.answers.map((answer) => {
            const question = testAttempt.testSeries.questions.find(
              (q) => q.id === answer.questionId,
            );

            let userAnswerText: string | undefined = undefined;

            if (question && answer.selectedOptionIndex !== null) {
              const options = Array.isArray(question.options)
                ? question.options
                : Object.values(question.options as any);

              if (options[answer.selectedOptionIndex]) {
                userAnswerText = getLocalizedText(
                  options[answer.selectedOptionIndex],
                );
              }
            }

            return {
              questionId: answer.questionId,
              userAnswer: userAnswerText,
              isCorrect: answer.isCorrect ?? false,
            };
          }),
        },
      ],

      totalMarks:
        testAttempt.totalMarks || testAttempt.testSeries.questions.length,
    };

    return result;
  } catch (error) {
    console.error("Error fetching test attempt details:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
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

interface SaveQuestionResponseParams {
  testAttemptId: string;
  questionId: string;
  selectedOptionIndex: number | null; // Changed from optionId to selectedOptionIndex
  markAs: string;
}

export async function SaveQuestionResponse({
  testAttemptId,
  questionId,
  selectedOptionIndex, // Changed from optionId to selectedOptionIndex
  markAs,
}: SaveQuestionResponseParams) {
  try {
    console.log("selected options index", selectedOptionIndex);
    // Fetch the question to determine correctness
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { answerIndex: true },
    });

    if (!question) {
      throw new Error("Question not found.");
    }

    let isCorrect: boolean | null = null;
    // Check if an answer for this question already exists
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        testAttemptId,
        questionId,
      },
    });

    if (selectedOptionIndex !== null) {
      isCorrect = selectedOptionIndex === question.answerIndex;
    }

    if (existingAnswer) {
      // Update existing answer
      await prisma.answer.update({
        where: {
          id: existingAnswer.id,
        },
        data: {
          markAs,
          selectedOptionIndex: selectedOptionIndex,
          isCorrect: isCorrect, // Store correctness
        },
      });
    } else {
      // Create new answer
      await prisma.answer.create({
        data: {
          testAttemptId,
          questionId,
          markAs,
          selectedOptionIndex: selectedOptionIndex,
          isCorrect: isCorrect, // Store correctness,
        },
      });
    }

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

export async function SubmitTest({
  testAttemptId,
  createdAt,
  totalMarks,
}: {
  testAttemptId: string;
  createdAt: string | Date;
  totalMarks: number;
}) {
  // normalize both dates
  const startTime = new Date(createdAt);
  const endTime = new Date();

  // calculate difference in minutes
  const diffMs = endTime.getTime() - startTime.getTime();
  const timeSpentMinutes = Math.floor(diffMs / 1000 / 60);

  try {
    // Fetch all answers for this test attempt to calculate the score
    const answers = await prisma.answer.findMany({
      where: {
        testAttemptId: testAttemptId,
      },
      select: {
        isCorrect: true,
      },
    });

    // Calculate the score based on the 'isCorrect' field
    const calculatedScore = answers.filter((answer) => answer.isCorrect).length;

    // Update the TestAttempt
    await prisma.testAttempt.update({
      where: {
        id: testAttemptId,
      },
      data: {
        completedAt: endTime,
        timeSpent: timeSpentMinutes, // store in minutes
        totalMarks: totalMarks,
        score: calculatedScore, // Update the score here
      },
    });

    return {
      success: true,
      timeSpent: timeSpentMinutes,
      score: calculatedScore,
    };
  } catch (error) {
    console.error("Error submitting test:", error);

    return { success: false, error: "Failed to save response" };
  }
}

export async function deleteAttempt(testAttemptId: string) {
  try {
    await prisma.answer.deleteMany({
      where: {
        testAttemptId: testAttemptId,
      },
    });

    const result = await prisma.testAttempt.delete({
      where: {
        id: testAttemptId,
      },
    });

    console.log("deleted test attempt", result);

    revalidatePath("/api/dashboardTable");

    return { success: true };
  } catch (error) {
    console.error("Error deleting test attempt:", error);

    return { success: false, error: "Failed to delete test attempt" };
  }
}

export async function getUserCreationDate() {
  const user = await GetServerSessionHere();
  const creationDate = await prisma.user.findUnique({
    where: {
      id: user.user.id,
    },
    select: {
      createdAt: true,
    },
  });

  return creationDate?.createdAt;
}

export async function updateSelectedLanguage(attemptId: string, lang: string) {
  await prisma.testAttempt.update({
    where: {
      id: attemptId,
    },
    data: {
      selectedLanguage: lang,
    },
  });

  return true;
}
