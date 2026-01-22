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
    <Card className="h-full border-none shadow-sm">
      <div className="p-4">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
          Question Palette
        </h3>
        <div className="grid grid-cols-5 gap-2">
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
                  "h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 border",
                  variantClass
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
            <span>Marked for Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-white border"></div>
            <span>Not Visited</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
