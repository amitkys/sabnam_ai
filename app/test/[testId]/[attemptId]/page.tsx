"use client";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { useEffect } from "react";

import TestSererisSkeleton from "../loading";

import { TestAttemptQuestionFetched } from "@/lib/type";
import { QuizInterface } from "@/components/quiz";
import { updateSelectedLanguage } from "@/lib/actions";

const fetcher = async (url: string): Promise<TestAttemptQuestionFetched> => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message || "Unknown error");

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          <p>Invalid URL: Missing test series ID or attempt ID</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <TestSererisSkeleton />;
  }

  if (!testSeriesData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to load test series data.</p>
      </div>
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
