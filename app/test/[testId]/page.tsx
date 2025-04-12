/*
import { Suspense } from "react";
import QuizInterface from "@/components/quiz/QuizInterface";
import { GetTestSeries } from "@/lib/actions";
import { FetchedTestSeriesData } from "@/lib/type";
import { Spinner } from "@/components/custom/spinner";

// Define the type for the component's props
type Params = Promise<{ testId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const id = params.testId;
  const TestSeriesData: FetchedTestSeriesData | null = await GetTestSeries(id);

  console.log(TestSeriesData?.questions);

  if (!TestSeriesData) {
    return <div>No Data Found</div>;
  }

  return (
    <Suspense fallback={<Loading />}>
      <QuizInterface TestSeriesData={TestSeriesData} />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col space-y-2">
      <Spinner size="xl" variant="primary" />
      <p>Fetching Test..</p>
    </div>
  );
}
*/

export default function Page() {
  return <div>Hello</div>;
}
