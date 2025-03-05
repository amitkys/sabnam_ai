"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { fetcher } from "@/lib/utils";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Spinner } from "@/components/custom/spinner";
// Type definition for the TestSeriesResponse
interface TestSeriesResponse {
  data: {
    id: string;
    title: string;
    duration: number;
  }[];
}


export default function Page() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const clas = searchParams.get("clas");
  const subject = searchParams.get("subject");

  const url = `/past10year?topic=${topic}&clas=${clas}&subject=${subject}`;
  return (
    <ContentLayout title="Previous Year">
      <Breadcrumb className="ml-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Sabnam</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={url}>Past 10 Year</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ContentPage />
    </ContentLayout>
  );

}



// TestSeriesCard component
const TestSeriesCard = ({
  testSeries,
}: {
  testSeries: TestSeriesResponse["data"][0];
}) => (
  <Card className="w-full mx-auto">
    <CardHeader className="relative">
      <Badge className="absolute top-2 right-2" variant="secondary">
        Free
      </Badge>
      <CardTitle className="text-lg">{testSeries.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        Duration: {testSeries.duration} minutes
      </p>
    </CardContent>
    <CardFooter>
      <Link passHref href={`/test/${testSeries.id}`}>
        <Button className="max-w-7xl">Start Test</Button>
      </Link>
    </CardFooter>
  </Card>
);

// Main Page component
function ContentPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const clas = searchParams.get("clas");
  const subject = searchParams.get("subject");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const testSeriesRef = useRef<HTMLDivElement>(null);

  const years = Array.from({ length: 13 }, (_, i) => 2024 - i);


  const {
    data: testSeriesData,
    error,
    isLoading,
  } = useSWR<TestSeriesResponse>(
    shouldFetch && selectedYear
      ? `/api/user?topic=${topic}&subject=${subject}&class=${clas}&year=${selectedYear}`
      : null,
    fetcher,
  );

  useEffect(() => {
    if (testSeriesData?.data && testSeriesData.data.length > 0) {
      toast({ title: "Test Found" });
    }

    testSeriesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testSeriesData]);

  const handleFindTest = () => {
    if (selectedYear) {
      setShouldFetch(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-24">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Choose year for {subject} {topic} - {clas}
      </h2>
      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-center">Select Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {years.map((year) => (
              <Button
                key={year}
                className="w-full text-lg py-6"
                variant={selectedYear === year ? "default" : "outline"}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full">
            <Button
              className="w-full text-lg py-6"
              disabled={!selectedYear || isLoading}
              onClick={handleFindTest}
            >
              {isLoading ? (
                <>
                  Please wait <Spinner variant={"primary"} />
                </>
              ) : (
                "Find Test"
              )}
            </Button>

            {testSeriesData?.data.length == 0 && (
              <p className="text-red-500 text-center mt-2">Test Not Found</p>
            )}
          </div>
        </CardFooter>
      </Card>

      {shouldFetch && (
        <div ref={testSeriesRef} className="mt-8">
          {isLoading && (
            <div className="flex justify-center  items-center flex-col space-y-2">
              <Spinner variant="primary" size="xl" />
              <span className="ml-2 text-xl">Loading test series...</span>
            </div>
          )}
          {error && (
            <div className="text-center text-red-500">
              Error loading test series data. Please try again.
            </div>
          )}
          {testSeriesData && testSeriesData.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testSeriesData.data.map((testSeries) => (
                <TestSeriesCard key={testSeries.id} testSeries={testSeries} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
