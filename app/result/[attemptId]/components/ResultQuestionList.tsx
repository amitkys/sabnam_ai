"use client";

import React, { useState } from "react";
import { IResultData, IResultQuestion } from "@/hooks/query/get/use-result";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import {
  CheckCircle2Icon,
  XCircleIcon,
  MinusCircleIcon,
  SparklesIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultQuestionListProps {
  data: IResultData;
  activeLanguage?: string;
}

export function ResultQuestionList({ data, activeLanguage = "en" }: ResultQuestionListProps) {
  const [filter, setFilter] = useState<"ALL" | "ATTEMPTED" | "CORRECT" | "INCORRECT" | "SKIPPED">("ALL");

  const totalQuestions = data.questions.length;
  const attemptedQuestions = data.questions.filter((q) => q.studentResponse !== null).length;
  const correctQuestions = data.questions.filter((q) => q.studentResponse?.isCorrect).length;
  const incorrectQuestions = attemptedQuestions - correctQuestions;
  const skippedQuestions = totalQuestions - attemptedQuestions;

  const filteredQuestions = data.questions.filter((q) => {
    const hasResponse = q.studentResponse !== null;
    if (filter === "ALL") return true;
    if (filter === "ATTEMPTED") return hasResponse;
    if (filter === "CORRECT") return hasResponse && q.studentResponse?.isCorrect;
    if (filter === "INCORRECT") return hasResponse && !q.studentResponse?.isCorrect;
    if (filter === "SKIPPED") return !hasResponse;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant={filter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ALL")}
            className="text-xs h-7 px-2.5 font-semibold"
          >
            All ({totalQuestions})
          </Button>

          <Button
            type="button"
            variant={filter === "ATTEMPTED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ATTEMPTED")}
            className="text-xs h-7 px-2.5 font-semibold"
          >
            Attempted ({attemptedQuestions})
          </Button>

          <Button
            type="button"
            variant={filter === "CORRECT" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("CORRECT")}
            className={cn(
              "text-xs h-7 px-2.5 font-semibold gap-1",
              filter === "CORRECT"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "hover:border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <CheckCircle2Icon className="h-3 w-3" />
            Correct ({correctQuestions})
          </Button>

          <Button
            type="button"
            variant={filter === "INCORRECT" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("INCORRECT")}
            className={cn(
              "text-xs h-7 px-2.5 font-semibold gap-1",
              filter === "INCORRECT"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "hover:border-rose-500/50 text-rose-600 dark:text-rose-400"
            )}
          >
            <XCircleIcon className="h-3 w-3" />
            Incorrect ({incorrectQuestions})
          </Button>

          <Button
            type="button"
            variant={filter === "SKIPPED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("SKIPPED")}
            className="text-xs h-7 px-2.5 font-semibold gap-1 text-muted-foreground"
          >
            <MinusCircleIcon className="h-3 w-3" />
            Skipped ({skippedQuestions})
          </Button>
        </div>

        <span className="text-xs text-muted-foreground font-medium">
          Showing {filteredQuestions.length} of {totalQuestions} questions
        </span>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border shadow-sm">
            <p className="text-sm font-semibold text-foreground">No questions found</p>
            <p className="text-xs text-muted-foreground mt-1">Try switching to a different filter above.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <QuestionCardItem
              key={q.id}
              q={q}
              displayIndex={q.orderIndex || idx + 1}
              language={activeLanguage}
            />
          ))
        )}
      </div>
    </div>
  );
}

function QuestionCardItem({
  q,
  displayIndex,
  language,
}: {
  q: IResultQuestion;
  displayIndex: number;
  language: string;
}) {
  const contentObj = typeof q.question.content === "object" && q.question.content !== null
    ? q.question.content
    : { en: String(q.question.content || ""), hi: String(q.question.content || "") };

  const solutionObj = typeof q.question.solution === "object" && q.question.solution !== null
    ? q.question.solution
    : { en: String(q.question.solution || ""), hi: String(q.question.solution || "") };

  const contentStr = contentObj[language] || contentObj.en || "";
  const solutionStr = solutionObj[language] || solutionObj.en || "";
  const rawOptions = Array.isArray(q.question.options) ? q.question.options : [];

  const response = q.studentResponse;
  const isSkipped = !response || response.userAnswer === null || response.userAnswer === undefined || response.userAnswer === "";
  const isCorrect = Boolean(response?.isCorrect);
  const isIncorrect = !isSkipped && !isCorrect;

  // Student's chosen answers (support comma separated for multiple choice)
  const studentAnswers = response?.userAnswer ? String(response.userAnswer).split(",").map((s) => s.trim().toUpperCase()) : [];
  const correctValues = q.question.correctValue ? String(q.question.correctValue).split(",").map((s) => s.trim().toUpperCase()) : [];

  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-sm transition-all flex flex-col",
        isCorrect && "border-emerald-500/30",
        isIncorrect && "border-rose-500/30",
        isSkipped && "border-border/80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {displayIndex}
          </span>
          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
            {q.question.type}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] font-semibold",
              q.question.difficulty === "EASY" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              q.question.difficulty === "MEDIUM" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              q.question.difficulty === "HARD" && "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {q.question.difficulty}
          </Badge>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          {isCorrect && (
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold gap-1">
              <CheckIcon className="h-3 w-3" />
              +{q.positiveMarks} Correct
            </Badge>
          )}

          {isIncorrect && (
            <Badge variant="destructive" className="text-[10px] font-bold gap-1">
              <XIcon className="h-3 w-3" />
              -{q.negativeMarks} Incorrect
            </Badge>
          )}

          {isSkipped && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-semibold">
              0 Marks (Skipped)
            </Badge>
          )}

          {response?.timeTaken !== undefined && response.timeTaken > 0 && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
              <ClockIcon className="h-3 w-3" />
              {response.timeTaken}s
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4 flex flex-col">
        {/* Question Content (Markdown + KaTeX Math) */}
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
          <MarkdownRenderer content={contentStr} variant="question" />
        </div>

        {/* Options List */}
        {rawOptions.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Options & Response Evaluation
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {rawOptions.map((opt: any, optIdx: number) => {
                const optId = String(opt.id || String.fromCharCode(65 + optIdx)).toUpperCase();
                const optTextObj = typeof opt.text === "object" && opt.text !== null
                  ? opt.text
                  : { en: String(opt.text || opt), hi: String(opt.text || opt) };
                const optText = optTextObj[language] || optTextObj.en || "";

                const isOptSelected = studentAnswers.includes(optId);
                const isOptCorrect = opt.isCorrect ?? correctValues.includes(optId);

                // Option State Styles
                let cardStyle = "bg-background border-border/80 text-muted-foreground";
                let badgeContent = null;

                if (isOptSelected && isOptCorrect) {
                  // User chose it and it's correct!
                  cardStyle = "bg-emerald-500/10 border-emerald-500/60 text-foreground ring-1 ring-emerald-500/30 font-medium";
                  badgeContent = (
                    <Badge className="bg-emerald-600 text-white text-[9px] uppercase px-1.5 py-0 font-bold shrink-0">
                      ✓ Your Answer (Correct)
                    </Badge>
                  );
                } else if (isOptSelected && !isOptCorrect) {
                  // User chose it but it's WRONG!
                  cardStyle = "bg-rose-500/10 border-rose-500/60 text-foreground ring-1 ring-rose-500/30 font-medium";
                  badgeContent = (
                    <Badge variant="destructive" className="text-[9px] uppercase px-1.5 py-0 font-bold shrink-0">
                      ✗ Your Answer (Incorrect)
                    </Badge>
                  );
                } else if (!isOptSelected && isOptCorrect) {
                  // Correct answer that was not chosen
                  cardStyle = "bg-emerald-500/5 border-emerald-500/40 text-foreground font-medium border-dashed";
                  badgeContent = (
                    <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold shrink-0">
                      ○ Correct Answer
                    </Badge>
                  );
                }

                return (
                  <div
                    key={optId}
                    className={cn(
                      "flex items-start gap-2.5 p-3 rounded-lg border text-xs transition-all w-full min-w-0",
                      cardStyle
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold text-xs",
                        isOptSelected && isOptCorrect && "bg-emerald-600 text-white shadow-xs",
                        isOptSelected && !isOptCorrect && "bg-rose-600 text-white shadow-xs",
                        !isOptSelected && isOptCorrect && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                        !isOptSelected && !isOptCorrect && "bg-muted text-foreground"
                      )}
                    >
                      {optId}
                    </span>

                    <div className="flex-1 min-w-0 break-words py-0.5">
                      <MarkdownRenderer content={optText} variant="option" />
                    </div>

                    {badgeContent}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Numerical / Integer Answer Display */}
        {rawOptions.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className={cn(
              "p-3 rounded-lg border text-xs flex items-center justify-between",
              isCorrect ? "bg-emerald-500/10 border-emerald-500/40" : isIncorrect ? "bg-rose-500/10 border-rose-500/40" : "bg-muted/30 border-border"
            )}>
              <span className="font-semibold text-muted-foreground">Your Answer:</span>
              <span className="font-mono font-bold text-foreground text-sm">
                {response?.userAnswer || "(Skipped)"}
              </span>
            </div>

            <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/40 text-xs flex items-center justify-between">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">Correct Value:</span>
              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200 text-sm">
                {q.question.correctValue || "N/A"}
              </span>
            </div>
          </div>
        )}

        {/* Step-by-Step Solution / Explanation */}
        {solutionStr && (
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border/70 text-xs space-y-1.5 mt-2">
            <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <SparklesIcon className="h-3.5 w-3.5 text-primary" />
              Step-by-Step Mathematical Solution & Explanation:
            </p>
            <div className="text-muted-foreground leading-relaxed">
              <MarkdownRenderer content={solutionStr} variant="analysis" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
