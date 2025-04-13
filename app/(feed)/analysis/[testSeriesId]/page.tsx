import Link from "next/link";
import { GoHome } from "react-icons/go";

import { getAnalysisForTestAttempt } from "@/lib/actions";
import MockTestAnalysis from "@/components/custom/mockTestAnalysis";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Define the type for the component's props
type Params = Promise<{ testSeriesId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const testSeriesId = params.testSeriesId;
  const testSeriesDetails = await getAnalysisForTestAttempt(testSeriesId);

  return (
    <ContentLayout title="Test Analysis">
      <Breadcrumb className="ml-5 lg:ml-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <GoHome className="text-lg" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Test Analysis</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <MockTestAnalysis testSeriesDetails={testSeriesDetails} />
    </ContentLayout>
  );
}
