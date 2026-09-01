"use client";

import React from "react";
import { IResultData } from "@/hooks/query/get/use-result";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrophyIcon,
  TargetIcon,
  CheckCircle2Icon,
  ClockIcon,
  CheckIcon,
  XIcon,
  MinusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultSummaryProps {
  data: IResultData;
}

export function ResultSummary({ data }: ResultSummaryProps) {
  const { attempt, testPaper, questions } = data;

  const totalQuestions = questions.length;
  const attemptedQuestions = questions.filter((q) => q.studentResponse !== null).length;
  const correctAnswers = questions.filter(
    (q) => q.studentResponse !== null && q.studentResponse.isCorrect
  ).length;
  const incorrectAnswers = attemptedQuestions - correctAnswers;
  const skippedQuestions = totalQuestions - attemptedQuestions;

  const accuracy =
    attemptedQuestions > 0 ? ((correctAnswers / attemptedQuestions) * 100).toFixed(1) : "0.0";

  const percentage =
    testPaper.totalMarks > 0 ? (((attempt.score || 0) / testPaper.totalMarks) * 100).toFixed(1) : "0.0";

  let timeSpentStr = "0m";
  if (attempt.startedAt && attempt.submittedAt) {
    const diffSec = Math.floor(
      (new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000
    );
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    timeSpentStr = `${m}m ${s}s`;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 1. Score Card */}
      <Card className="border-border/80 shadow-sm bg-card">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <TrophyIcon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground font-medium">Score Obtained</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-foreground">
                {attempt.score !== null ? attempt.score : 0}
              </span>
              <span className="text-xs text-muted-foreground">/ {testPaper.totalMarks}</span>
            </div>
            <div className="mt-1">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
              >
                {percentage}% Score
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Accuracy Card */}
      <Card className="border-border/80 shadow-sm bg-card">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TargetIcon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground font-medium">Accuracy</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <CheckIcon className="h-3 w-3" /> {correctAnswers}
              </span>
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                <XIcon className="h-3 w-3" /> {incorrectAnswers}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Questions Attempted Breakdown */}
      <Card className="border-border/80 shadow-sm bg-card">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CheckCircle2Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground font-medium">Attempted</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-foreground">{attemptedQuestions}</span>
              <span className="text-xs text-muted-foreground">/ {totalQuestions}</span>
            </div>
            <div className="mt-1">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 font-medium text-muted-foreground bg-muted"
              >
                {skippedQuestions} skipped
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Time Spent Card */}
      <Card className="border-border/80 shadow-sm bg-card">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ClockIcon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground font-medium">Time Taken</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-foreground">{timeSpentStr}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
              Allocated: {testPaper.duration} min
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
