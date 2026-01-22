"use client";

import { Button } from "@/components/ui/button";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams, useRouter } from "next/navigation";
import { saveStudentResponse, submitAttempt } from "@/lib/action/attempt-actions";

export function AttemptFooter() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const { data } = useAttemptTest({ attemptId: params.attemptId });

  const activeQuestionIndex = useNewTestAttemptStore((s) => s.activeQuestionIndex);
  const setActiveQuestionIndex = useNewTestAttemptStore((s) => s.setActiveQuestionIndex);
  const toggleReview = useNewTestAttemptStore((s) => s.toggleReview);
  const isMarkedForReview = useNewTestAttemptStore((s) => s.isMarkedForReview);
  const answers = useNewTestAttemptStore((s) => s.answers);

  if (!data) return null;

  const currentQuestion = data.testPaper.questions[activeQuestionIndex];
  const totalQuestions = data.testPaper.questions.length;

  // Guard clause if index is out of bounds (e.g. during loading/transitions)
  if (!currentQuestion) return null;

  const handleSaveAndNext = async () => {
    const userAnswer = answers.get(currentQuestion.questionId);

    if (userAnswer) {
      const result = await saveStudentResponse(
        params.attemptId,
        currentQuestion.questionId,
        userAnswer
      );

      if (result.error) {
        console.error(result.error);
        alert("Failed to save answer: " + result.error);
        return;
      }
    }

    // Move to next if not last
    if (activeQuestionIndex < totalQuestions - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 px-24  rounded-xl border shadow-sm">
      <Button
        variant="outline"
        onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
        disabled={activeQuestionIndex === 0}
      >
        Previous
      </Button>

      <Button onClick={handleSaveAndNext}>Save and Next</Button>

      <Button
        // @ts-ignore: Prisma JSON types
        variant={isMarkedForReview(currentQuestion.questionId) ? "default" : "secondary"}
        // @ts-ignore: Prisma JSON types
        onClick={() => toggleReview(currentQuestion.questionId)}
      >
        {/* @ts-ignore: Prisma JSON types */}
        {isMarkedForReview(currentQuestion.questionId) ? "Unmark Review" : "Mark for Review"}
      </Button>

      <Button
        onClick={() => setActiveQuestionIndex(Math.min(totalQuestions - 1, activeQuestionIndex + 1))}
        disabled={activeQuestionIndex === totalQuestions - 1}
      >
        Next
      </Button>
    </div>
  );
}
