import { Suspense } from "react";

import QuizInterface from "@/components/custom/TestUI";
import { GetTestSeries } from "@/lib/actions";
import { FetchedTestSeriesData } from "@/lib/type";
import { Spinner } from "@/components/custom/spinner";

// Define the type for the component's props
type Params = Promise<{ id: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const id = params.id;
  const TestSeriesData: FetchedTestSeriesData | null = await GetTestSeries(id);

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

      <Spinner variant="primary" size="xl" />
      <p>Fetching Test..</p>
    </div>
  );
}
