"use client";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { useEffect } from "react";

import TestSererisSkeleton from "../loading";

import { TestAttemptQuestionFetched } from "@/lib/type";
import { QuizInterface } from "@/components/quiz";
import { ErrorDisplay } from "@/components/error/ErrorDisplay";
import { updateSelectedLanguage } from "@/lib/actions";

const fetcher = async (url: string): Promise<TestAttemptQuestionFetched> => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message || "Something went wrong");

    throw error;
  }

  return res.json();
};

export default function Page() {
  const pathname = usePathname();

  const parts = pathname.split("/");
  const testSeriesId = parts[2];
  const testAttemptId = parts[3];

  const {
    data: testSeriesData,
    error,
    isLoading,
    mutate,
  } = useSWR<TestAttemptQuestionFetched>(
    testSeriesId && testAttemptId
      ? `/api/testSeries/${testSeriesId}/${testAttemptId}`
      : null,
    fetcher,
  );

  useEffect(() => {
    const updateLanguage = async () => {
      if (!testAttemptId) return;

      const savedLanguage = testSeriesData?.selectedLanguage;
      const preferred = testSeriesData?.testSeries?.preferredLanguage;

      // Only update if no language is saved yet
      if (!savedLanguage && preferred) {
        try {
          await updateSelectedLanguage(testAttemptId, preferred);
        } catch (error) {
          console.error("Failed to update language:", error);
        }
      }
    };

    updateLanguage();
  }, [
    testAttemptId,
    testSeriesData?.selectedLanguage,
    testSeriesData?.testSeries?.preferredLanguage,
  ]);

  // Early returns after all hooks
  if (!testSeriesId || !testAttemptId) {
    return (
      <ErrorDisplay message="Invalid test series ID or test attempt ID." />
    );
  }

  if (error) {
    return <ErrorDisplay message={error.message} retry={mutate} />;
  }

  if (isLoading) {
    return <TestSererisSkeleton />;
  }

  if (!testSeriesData) {
    return (
      <ErrorDisplay
        message={"Failed to load test series data."}
        retry={mutate}
      />
    );
  }

  return (
    <div>
      <QuizInterface
        TestSeriesData={testSeriesData}
        attemptId={testAttemptId}
      />
    </div>
  );
}
