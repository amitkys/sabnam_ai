import { getTestSeriesDetailsForUser } from "@/lib/actions";
import MockTestAnalysis from "@/components/custom/mockTestAnalysis";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import Link from "next/link";

// Define the type for the component's props
type Params = Promise<{ testSeriesId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const testSeriesId = params.testSeriesId;
  const testSeriesDetails = await getTestSeriesDetailsForUser(testSeriesId);
  return (
    <ContentLayout title="Test Analysis">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Sabnam</Link>
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