"use client";

import { Button } from "@/components/ui/button";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";

export function AttemptFooter() {
  const params = useParams<{ attemptId: string }>();
  const { data } = useAttemptTest({ attemptId: params.attemptId });

  const activeQuestionIndex = useNewTestAttemptStore((s) => s.activeQuestionIndex);
  const setActiveQuestionIndex = useNewTestAttemptStore((s) => s.setActiveQuestionIndex);
  const toggleReview = useNewTestAttemptStore((s) => s.toggleReview);
  const isMarkedForReview = useNewTestAttemptStore((s) => s.isMarkedForReview);

  if (!data) return null;

  const currentQuestion = data.testPaper.questions[activeQuestionIndex];
  const totalQuestions = data.testPaper.questions.length;

  // Guard clause if index is out of bounds (e.g. during loading/transitions)
  if (!currentQuestion) return null;

  return (
    <div className="flex items-center justify-between p-4  rounded-xl border shadow-sm">
      <Button
        variant="outline"
        onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
        disabled={activeQuestionIndex === 0}
      >
        Previous
      </Button>

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
