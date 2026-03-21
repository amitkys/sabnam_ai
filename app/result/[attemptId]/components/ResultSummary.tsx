import React from "react";
import { IResultData } from "@/hooks/query/get/use-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultSummaryProps {
  data: IResultData;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ data }) => {
  const { attempt, testPaper, questions } = data;

  const totalQuestions = questions.length;
  const attemptedQuestions = questions.filter((q) => q.studentResponse !== null).length;
  const correctAnswers = questions.filter(
    (q) => q.studentResponse !== null && q.studentResponse.isCorrect
  ).length;
  const incorrectAnswers = attemptedQuestions - correctAnswers;
  const skippedQuestions = totalQuestions - attemptedQuestions;

  const accuracy =
    attemptedQuestions > 0 ? ((correctAnswers / attemptedQuestions) * 100).toFixed(2) : 0;

  let totalTimeSeconds = 0;
  if (attempt.startedAt && attempt.submittedAt) {
    const start = new Date(attempt.startedAt).getTime();
    const end = new Date(attempt.submittedAt).getTime();
    totalTimeSeconds = Math.floor((end - start) / 1000);
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Final Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {attempt.score !== null ? attempt.score : 0} / {testPaper.totalMarks}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{accuracy}%</div>
          <p className="text-xs text-muted-foreground">
            {correctAnswers} correct out of {attemptedQuestions} attempted
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Time Taken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(totalTimeSeconds)}</div>
          <p className="text-xs text-muted-foreground">
            out of {testPaper.duration} mins
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Attempt Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 text-sm">
            <span className="text-green-600 font-semibold">{correctAnswers} C</span>
            <span className="text-red-600 font-semibold">{incorrectAnswers} W</span>
            <span className="text-gray-500 font-semibold">{skippedQuestions} S</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
