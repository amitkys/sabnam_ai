import React from "react";
import { IResultData } from "@/hooks/query/get/use-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedGroup } from "@/components/ui/animated-group";

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

  const performancePercentage = testPaper.totalMarks > 0 ? ((attempt.score || 0) / testPaper.totalMarks) * 100 : 0;

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

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    if (percentage >= 40) return "outline";
    return "destructive";
  };

  return (
    <div className="space-y-8 mb-8">
      <AnimatedGroup
        preset="blur-slide"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Final Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className={`text-3xl font-bold ${getScoreColor(performancePercentage)}`}>
                {attempt.score !== null ? attempt.score : 0}
              </div>
              <div className="text-sm text-muted-foreground">/ {testPaper.totalMarks}</div>
            </div>
            <div className="mt-2">
              <Badge variant={getScoreBadgeVariant(performancePercentage)} className="text-xs">
                {performancePercentage.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Performance on total marks
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {accuracy}%
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Correct:</span>
                <span className="font-medium text-green-600">{correctAnswers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Incorrect:</span>
                <span className="font-medium text-red-600">{incorrectAnswers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Skipped:</span>
                <span className="font-medium text-gray-500">{skippedQuestions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
              Time Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatTime(totalTimeSeconds)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Allocated:</span>
                <span className="font-medium">{testPaper.duration} mins</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Efficiency:</span>
                <span className="font-medium">
                  {((totalTimeSeconds / 60) / testPaper.duration * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            {totalTimeSeconds > testPaper.duration * 60 && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                  Over time
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Question Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {correctAnswers}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
                <div className="text-xs text-green-600 mt-1">
                  ({((correctAnswers / attemptedQuestions) * 100).toFixed(0)}%)
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {incorrectAnswers}
                </div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
                <div className="text-xs text-red-600 mt-1">
                  ({((incorrectAnswers / attemptedQuestions) * 100).toFixed(0)}%)
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-500">
                  {skippedQuestions}
                </div>
                <div className="text-xs text-muted-foreground">Skipped</div>
                <div className="text-xs text-gray-500 mt-1">
                  ({((skippedQuestions / totalQuestions) * 100).toFixed(0)}%)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedGroup>

      <div className="bg-muted/30 rounded-lg p-4 border transition-all duration-200 hover:bg-muted/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Test Paper</h3>
            <p className="text-lg font-semibold text-primary">
              {testPaper.title}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Attempted</div>
            <div className="text-lg font-bold">
              {attemptedQuestions}/{totalQuestions} questions
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {((attemptedQuestions / totalQuestions) * 100).toFixed(1)}% completion
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
