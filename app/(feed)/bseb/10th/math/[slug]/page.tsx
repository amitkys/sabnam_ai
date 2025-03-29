"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GoHome } from "react-icons/go";
import useSWR from "swr";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { fetcher } from "@/lib/utils";
import { Spinner } from "@/components/custom/spinner";
import { TestSeriesCard } from "@/components/ui/TestSeriesCard";

export interface TestSeriesResponse {
  data: {
    id: string;
    title: string;
    duration: number;
    hasAttempted: boolean;
    lastScore: number | null;
    isCompleted: boolean;
    totalQuestions: number;
  }[];
}

export default function Page() {
  const params = useParams();

  return (
    <ContentLayout title="">
      <Breadcrumb className="ml-5 lg:ml-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                {" "}
                <GoHome className="text-lg" />{" "}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/bseb/10th">10th</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/bseb/10th/math">Math-chapters</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{params.slug}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content chapterName={params.slug} />
    </ContentLayout>
  );
}

interface ContentProps {
  chapterName: string | string[] | undefined;
}

function Content({ chapterName }: ContentProps) {
  const {
    data: testSeriesData,
    error,
    isLoading,
  } = useSWR<TestSeriesResponse>(
    `/api/math?claas=10th&subject=math&chapter=${chapterName}`,
    fetcher,
  );

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex items-center justify-center">
        <Spinner size={"lg"} variant={"primary"} />
        <span className="ml-3 text-base">Loading Test</span>
      </div>
    );
  }
  if (error) {
    <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex items-center justify-center">
      <span className="ml-3 text-base">Something went wrong</span>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-24">
      {testSeriesData && testSeriesData.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testSeriesData.data.map((testSeries) => (
            <TestSeriesCard key={testSeries.id} testSeries={testSeries} />
          ))}
        </div>
      )}
    </div>
  );
}
