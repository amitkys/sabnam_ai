"use client";

import { useParams } from "next/navigation";
import { useResult } from "@/hooks/query/get/use-result";
import { ResultSummary } from "./components/ResultSummary";
import { ResultQuestionList } from "./components/ResultQuestionList";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ResultPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const { data, isLoading, error } = useResult(attemptId);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load result data."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center text-muted-foreground mt-10">No result data available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {data.testPaper.title} - Result
        </h1>
        <p className="text-muted-foreground">
          Review your performance and explore detailed solutions below.
        </p>
      </div>

      <ResultSummary data={data} />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 tracking-tight">
          Detailed Analysis
        </h2>
        <ResultQuestionList data={data} />
      </div>
    </div>
  );
}
