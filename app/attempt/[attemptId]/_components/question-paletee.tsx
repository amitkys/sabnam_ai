"use client";

import { Card } from "@/components/ui/card";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { cn } from "@/lib/utils";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";

/**
 * Render a visual grid of all questions in the test.
 * Color-codes each button based on its state (answered, review, or unattempted).
 * Lets users quickly jump between questions using the numbers.
 */
export function QuestionPalette() {
  const params = useParams<{ attemptId: string }>();
  const { data } = useAttemptTest({ attemptId: params.attemptId });

  const activeQuestionIndex = useNewTestAttemptStore((s) => s.activeQuestionIndex);
  const setActiveQuestionIndex = useNewTestAttemptStore((s) => s.setActiveQuestionIndex);
  const answers = useNewTestAttemptStore((s) => s.answers);
  const markedForReview = useNewTestAttemptStore((s) => s.markedForReview);

  if (!data) return null;

  return (
    <div className="flex flex-row gap-2 overflow-x-auto md:grid md:grid-cols-5 md:overflow-visible pb-2 md:pb-0 no-scrollbar">
      {data.testPaper.questions.map((q, idx) => {
        const isActive = activeQuestionIndex === idx;
        const isAnswered = answers.has(q.questionId);
        const isReview = markedForReview.has(q.questionId);

        // Default styling (Unanswered / Neutral)
        let variantClass =
          "bg-muted/40 text-muted-foreground border border-border hover:bg-muted hover:border-primary/30";

        // Green styling: The user has selected an option
        if (isAnswered) {
          variantClass =
            "bg-emerald-900/60 text-emerald-100 border-none  hover:bg-emerald-900 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]";
        }

        // Blue styling: The user explicitly flagged this question for 'Review'
        if (isReview) {
          variantClass =
            "bg-blue-900/50 text-blue-100 border border-blue-700 hover:bg-blue-900";
        }

        // Add an extra highlight ring if this is the currently active question
        if (isActive) {
          variantClass +=
            " ring-2 ring-primary/40 ring-offset-2 ring-offset-background";
        }


        return (
          <button
            key={q.id}
            onClick={() => setActiveQuestionIndex(idx)}
            className={cn(
              "flex-shrink-0 h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 border mt-2",
              variantClass
            )}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}