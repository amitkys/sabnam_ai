"use client";

import { useState, useEffect } from "react";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { cn } from "@/lib/utils";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";

/**
 * Render a visual grid of all questions in the test.
 * Color-codes each button based on its state (answered, review, or unattempted).
 * Lets users quickly jump between questions using the numbers.
 * Supports sectional tabs (Math, Science, etc.) when the test paper has sections.
 */
export function QuestionPalette() {
  const params = useParams<{ attemptId: string }>();
  const { data } = useAttemptTest({ attemptId: params.attemptId });

  const activeQuestionIndex = useNewTestAttemptStore((s) => s.activeQuestionIndex);
  const setActiveQuestionIndex = useNewTestAttemptStore((s) => s.setActiveQuestionIndex);
  const answers = useNewTestAttemptStore((s) => s.answers);
  const markedForReview = useNewTestAttemptStore((s) => s.markedForReview);

  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");

  const sections: any[] = (data?.testPaper as any)?.sections || [];

  // When active question changes, keep section tab synced if a specific section was chosen
  useEffect(() => {
    if (selectedSectionId !== "all" && data?.testPaper.questions) {
      const curQ = data.testPaper.questions[activeQuestionIndex] as any;
      const curSecId = curQ?.sectionId || curQ?.section?.id;
      if (curSecId && curSecId !== selectedSectionId) {
        setSelectedSectionId(curSecId);
      }
    }
  }, [activeQuestionIndex, data, selectedSectionId]);

  if (!data) return null;

  const totalQuestions = data.testPaper.questions.length;

  const sectionStats = sections.map((sec) => {
    const secQuestions = data.testPaper.questions.filter(
      (q: any) => q.sectionId === sec.id || q.section?.id === sec.id
    );
    const answeredCount = secQuestions.filter((q) => answers.has(q.questionId)).length;
    return {
      ...sec,
      total: secQuestions.length,
      answered: answeredCount,
    };
  });

  const filteredItems = data.testPaper.questions
    .map((q, idx) => ({ q: q as any, idx }))
    .filter(({ q }) => {
      if (selectedSectionId === "all") return true;
      return q.sectionId === selectedSectionId || q.section?.id === selectedSectionId;
    });

  return (
    <div className="flex flex-col gap-2">
      {/* Section Tabs if test has defined sections */}
      {sections.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/50 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedSectionId("all")}
            className={cn(
              "text-xs px-2.5 py-1 rounded-md font-medium transition-all shrink-0 border whitespace-nowrap",
              selectedSectionId === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
            )}
          >
            All ({answers.size}/{totalQuestions})
          </button>
          {sectionStats.map((sec) => {
            const isSelected = selectedSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setSelectedSectionId(sec.id);
                  const firstIdx = data.testPaper.questions.findIndex(
                    (q: any) => q.sectionId === sec.id || q.section?.id === sec.id
                  );
                  if (firstIdx !== -1) {
                    const currentQ = data.testPaper.questions[activeQuestionIndex] as any;
                    const inSameSec = currentQ && (currentQ.sectionId === sec.id || currentQ.section?.id === sec.id);
                    if (!inSameSec) {
                      setActiveQuestionIndex(firstIdx);
                    }
                  }
                }}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md font-medium transition-all shrink-0 border whitespace-nowrap",
                  isSelected
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs font-semibold"
                    : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
                )}
              >
                {sec.name} ({sec.answered}/{sec.total})
              </button>
            );
          })}
        </div>
      )}

      {/* Button Grid */}
      <div className="flex flex-row gap-2 overflow-x-auto md:grid md:grid-cols-5 md:overflow-visible pb-2 md:pb-0 no-scrollbar">
        {filteredItems.map(({ q, idx }) => {
          const isActive = activeQuestionIndex === idx;
          const isAnswered = answers.has(q.questionId);
          const isReview = markedForReview.has(q.questionId);

          // Default styling (Unanswered / Neutral)
          let variantClass =
            "bg-muted/40 text-muted-foreground border border-border hover:bg-muted hover:border-primary/30";

          // Green styling: The user has selected an option
          if (isAnswered) {
            variantClass =
              "bg-emerald-900/60 text-emerald-100 border-none hover:bg-emerald-900 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]";
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
                "flex-shrink-0 h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 border mt-1",
                variantClass
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}