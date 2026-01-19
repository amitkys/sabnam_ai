'use server'

import { prisma } from "@/lib/db"; // Adjust path to your db client
import { AttemptStatus } from "@/lib/generated/prisma/client";

// Define the shape of your Option to help TypeScript
interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean; // Optional because we might remove it
}

export async function getAttemptAction(attemptId: string) {
  try {
    // 1. Fetch the Attempt + Test + Questions + User Responses
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        testPaper: {
          select: {
            id: true,
            title: true,
            duration: true,
            questions: {
              orderBy: { orderIndex: 'asc' }, // Keep questions in order
              include: {
                question: {
                  select: {
                    id: true,
                    content: true,
                    type: true,
                    options: true,      // We fetch this, but will sanitize it
                    imageUrl: true,
                    solution: true,     // We fetch this, but will sanitize it
                    correctValue: true, // We fetch this, but will sanitize it
                  }
                },
              }
            }
          }
        },
        responses: true // Load previous answers so we can restore the UI
      }
    });

    if (!attempt) {
      return { error: "Attempt not found" };
    }

    // 2. CHECK STATUS: Is the user currently taking the test?
    const isLiveAttempt = attempt.status === AttemptStatus.STARTED || attempt.status === AttemptStatus.PAUSED;

    // 3. SANITIZATION LOGIC (Security Layer)
    if (isLiveAttempt) {
      // Loop through every question in the test paper
      attempt.testPaper.questions.forEach((tq: any) => {
        const q = tq.question;

        // A. DELETE explicit answers/solutions
        // @ts-ignore: Deleting optional properties from the response object
        delete q.solution; 
        // @ts-ignore
        delete q.correctValue;

        // B. FILTER the Options JSON
        // We cast 'options' to our interface to manipulate it safely
        const rawOptions = q.options as unknown as QuestionOption[];
        
        if (Array.isArray(rawOptions)) {
          // Overwrite the options with a "Clean" version
          q.options = rawOptions.map((opt) => ({
            id: opt.id,
            text: opt.text,
            // NOTICE: We do NOT include 'isCorrect' here
          }));
        }
      });
    }

    // 4. Return the safe data
    return { success: true, data: attempt };

  } catch (error) {
    console.error("Error fetching attempt:", error);
    return { error: "Failed to load test data" };
  }
}