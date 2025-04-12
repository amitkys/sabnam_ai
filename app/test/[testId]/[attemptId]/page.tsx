"use client";
import { usePathname } from "next/navigation";
import useSWR from "swr";

import { FetchedTestSeriesData } from "@/lib/type";
import QuizInterface from "@/components/quiz/QuizInterface";

// Fetcher function for SWR
const fetcher = (url: string): Promise<FetchedTestSeriesData> =>
  fetch(url).then((res) => res.json());

export default function Page() {
  const pathname = usePathname();

  const parts = pathname.split("/");

  const testSeriesId = parts[2];
  const testAttemptId = parts[3];
  // const testSeriesId = "cm8ugjts30001cz02z5siz7xz";
  // const testAttemptId = "cm98vmyqi0001jv04sdj9w9lj";

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

  if (error) return <div>Error loading data</div>;
  if (!testSeriesData) return <div>Loading...</div>;

  console.log("coming data from backedn", testSeriesData);

  return (
    <div>
      <QuizInterface
        TestSeriesData={testSeriesData}
        attemptId={testAttemptId}
      />
    </div>
  );
}
