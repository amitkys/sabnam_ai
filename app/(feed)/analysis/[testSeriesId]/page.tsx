import { getAnalysisForTestAttempt } from "@/lib/actions";
import TestAnalysis from "@/components/analysis/TestAnalysis";

// Define the type for the component's props
type Params = Promise<{ testSeriesId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const testSeriesId = params.testSeriesId;
  const testSeriesDetails = await getAnalysisForTestAttempt(testSeriesId);

  return <TestAnalysis testSeriesDetails={testSeriesDetails} />;
}
