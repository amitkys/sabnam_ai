"use client";

import { useParams } from "next/navigation";
import { useResult } from "@/hooks/query/get/use-result";
import { ResultSummary } from "./components/ResultSummary";
import { ResultQuestionList } from "./components/ResultQuestionList";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, TrendingUp, Target, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ResultPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const { data, isLoading, error } = useResult(attemptId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto p-4 max-w-6xl flex justify-center items-center min-h-[60vh]">
          <Alert variant="destructive" className="max-w-lg shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Error Loading Results</AlertTitle>
            <AlertDescription className="text-base">
              {error instanceof Error ? error.message : "Failed to load result data. Please try again later."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Result Data Available</h2>
            <p className="text-muted-foreground max-w-md">
              The result data for this attempt could not be found. Please check your attempt ID or contact support if the issue persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { attempt, testPaper, questions } = data;
  const totalQuestions = questions.length;
  const attemptedQuestions = questions.filter((q) => q.studentResponse !== null).length;
  const correctAnswers = questions.filter(
    (q) => q.studentResponse !== null && q.studentResponse.isCorrect
  ).length;
  const accuracy = attemptedQuestions > 0 ? ((correctAnswers / attemptedQuestions) * 100).toFixed(1) : 0;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-4 max-w-6xl">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              {data.testPaper.title} - Result
            </h1>
          </div>
          <p className="text-lg text-muted-foreground ml-14">
            Review your performance and explore detailed solutions below.
          </p>
          <div className="flex items-center gap-6 ml-14 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Attempt ID: {attempt.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>{testPaper.duration} minutes duration</span>
            </div>
            <div className="flex items-center gap-2">
              {attempt.status === "COMPLETED" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="capitalize">{attempt.status.toLowerCase()}</span>
            </div>
          </div>
        </header>

        <ResultSummary data={data} />

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold tracking-tight">Detailed Analysis</h2>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {attemptedQuestions} of {totalQuestions} questions attempted</span>
            </div>
          </div>
          <ResultQuestionList data={data} />
        </div>
      </div>
    </div>
  );
}
