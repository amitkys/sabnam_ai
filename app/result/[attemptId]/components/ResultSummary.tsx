"use client";

import React from "react";
import {
  TrophyIcon,
  TargetIcon,
  CheckCircle2Icon,
  ClockIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";

import { IResultData } from "@/hooks/query/get/use-result";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResultSummaryProps {
  data: IResultData;
}

export function ResultSummary({ data }: ResultSummaryProps) {
  const { attempt, testPaper, questions } = data;

  const totalQuestions = questions.length;
  const attemptedQuestions = questions.filter(
    (q) => q.studentResponse !== null,
  ).length;
  const correctQuestions = questions.filter(
    (q) => q.studentResponse !== null && q.studentResponse.isCorrect,
  );
  const correctAnswers = correctQuestions.length;
  const incorrectQuestions = questions.filter(
    (q) => q.studentResponse !== null && !q.studentResponse.isCorrect,
  );
  const incorrectAnswers = incorrectQuestions.length;
  const skippedQuestions = totalQuestions - attemptedQuestions;

  const accuracy =
    attemptedQuestions > 0
      ? ((correctAnswers / attemptedQuestions) * 100).toFixed(1)
      : "0.0";

  const percentage =
    testPaper.totalMarks > 0
      ? (((attempt.score || 0) / testPaper.totalMarks) * 100).toFixed(1)
      : "0.0";

  let totalDiffSec = 0;

  if (attempt.startedAt && attempt.submittedAt) {
    totalDiffSec = Math.max(
      0,
      Math.floor(
        (new Date(attempt.submittedAt).getTime() -
          new Date(attempt.startedAt).getTime()) /
          1000,
      ),
    );
  } else {
    totalDiffSec = questions.reduce(
      (sum, q) => sum + (q.studentResponse?.timeTaken || 0),
      0,
    );
  }

  const formatDuration = (sec: number) => {
    if (sec <= 0) return "0s";
    const m = Math.floor(sec / 60);
    const s = sec % 60;

    if (m > 0 && s > 0) return `${m}m ${s}s`;
    if (m > 0) return `${m}m`;

    return `${s}s`;
  };

  const timeSpentStr = formatDuration(totalDiffSec);

  // Per-question timing analytics
  const totalRecordedQuestionTime = questions.reduce(
    (sum, q) => sum + (q.studentResponse?.timeTaken || 0),
    0,
  );
  const effectiveTotalTime =
    totalRecordedQuestionTime > 0 ? totalRecordedQuestionTime : totalDiffSec;

  const avgTimePerQuestionSec =
    totalQuestions > 0 ? Math.round(effectiveTotalTime / totalQuestions) : 0;
  const avgTimePerQuestionStr = formatDuration(avgTimePerQuestionSec);

  const totalCorrectTimeSec = correctQuestions.reduce(
    (sum, q) => sum + (q.studentResponse?.timeTaken || 0),
    0,
  );
  const avgCorrectTimeSec =
    correctAnswers > 0 ? Math.round(totalCorrectTimeSec / correctAnswers) : 0;
  const avgCorrectTimeStr = formatDuration(avgCorrectTimeSec);

  const totalIncorrectTimeSec = incorrectQuestions.reduce(
    (sum, q) => sum + (q.studentResponse?.timeTaken || 0),
    0,
  );
  const avgIncorrectTimeSec =
    incorrectAnswers > 0
      ? Math.round(totalIncorrectTimeSec / incorrectAnswers)
      : 0;
  const avgIncorrectTimeStr = formatDuration(avgIncorrectTimeSec);

  return (
    <div className="space-y-3">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Score Card */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrophyIcon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground font-medium">
                Score Obtained
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-foreground">
                  {attempt.score !== null ? attempt.score : 0}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {testPaper.totalMarks}
                </span>
              </div>
              <div className="mt-1">
                <Badge
                  className="text-[10px] px-1.5 py-0 font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                  variant="outline"
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
              <p className="text-[11px] text-muted-foreground font-medium">
                Accuracy
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {accuracy}%
                </span>
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
              <p className="text-[11px] text-muted-foreground font-medium">
                Attempted
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-foreground">
                  {attemptedQuestions}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {totalQuestions}
                </span>
              </div>
              <div className="mt-1">
                <Badge
                  className="text-[10px] px-1.5 py-0 font-medium text-muted-foreground bg-muted"
                  variant="outline"
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
              <p className="text-[11px] text-muted-foreground font-medium">
                Total Time
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-foreground">
                  {timeSpentStr}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">
                Duration: {testPaper.duration} min
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time & Speed Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border bg-card/60 shadow-xs text-xs">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ClockIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium">
              Avg Time / Question
            </p>
            <p className="font-bold font-mono text-xs text-foreground mt-0.5">
              {avgTimePerQuestionStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-t sm:border-t-0 sm:border-l border-border/60 pt-2 sm:pt-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium">
              Avg Time on Correct
            </p>
            <p className="font-bold font-mono text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              {correctAnswers > 0 ? avgCorrectTimeStr : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-t sm:border-t-0 sm:border-l border-border/60 pt-2 sm:pt-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <XIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium">
              Avg Time on Incorrect
            </p>
            <p className="font-bold font-mono text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              {incorrectAnswers > 0 ? avgIncorrectTimeStr : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
