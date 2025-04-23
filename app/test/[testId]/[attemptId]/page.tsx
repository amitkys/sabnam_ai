"use client";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";

import { FetchedTestSeriesData } from "@/lib/type";
import QuizInterface from "@/components/quiz/QuizInterface";

const fetcher = async (url: string): Promise<FetchedTestSeriesData> => {
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

  if (!testSeriesId || !testAttemptId) {
    alert("URL is missing");

    return;
  }
  const {
    data: testSeriesData,
    error,
    isLoading,
  } = useSWR<FetchedTestSeriesData>(
    `/api/testSeries/${testSeriesId}/${testAttemptId}`,
    fetcher,
  );

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
    return (
      <div className="min-h-screen flex items-center flex-col justify-center space-x-2">
        <Image
          alt="Loading illustration"
          height={400}
          src={"/dog.svg"}
          width={400}
        />
        <p className="text-lg font-medium text-foreground/75">
          Loading your test series, please wait...
        </p>
      </div>
    );
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
