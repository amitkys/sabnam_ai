"use client";

import { Card } from "@/components/ui/card";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { cn } from "@/lib/utils";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";

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

        let variantClass = "bg-white text-muted-foreground hover:bg-muted hover:border-primary/30";

        if (isActive) {
          variantClass = "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20";
        } else if (isReview) {
          variantClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
        } else if (isAnswered) {
          variantClass = "bg-green-100 text-green-700 border-green-300";
        }

        return (
          <button
            key={q.id}
            onClick={() => setActiveQuestionIndex(idx)}
            className={cn(
              "flex-shrink-0 h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 border",
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
