"use client";
import { useParams, usePathname } from "next/navigation";
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
import { TestSeriesCard } from "@/components/TestSeries/TestSeriesCard";
import { TestSeriesCardSkeleton } from "@/components/TestSeries/TestCard-skelton";
import { IMainTestSeriesResponse } from "@/lib/type";

export default function Page() {
  const params = useParams();
  const pathName = usePathname();
  const pathSegments = pathName.split("/").filter(Boolean);

  const [board, className, subject, chapterSlug] = pathSegments;

  return (
    <ContentLayout title="BSEB">
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
            <BreadcrumbLink asChild>
              <Link href={`/${board}/${className}`}>
                {formatSegment(className)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${board}/${className}/${subject}`}>
                {formatSegment(subject)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{formatSegment(chapterSlug)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content chapterName={params.slug} subjectName={subject} />
    </ContentLayout>
  );
}

function formatSegment(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface ContentProps {
  chapterName: string | string[] | undefined;
  subjectName: string | string[] | undefined;
}

function Content({ chapterName, subjectName }: ContentProps) {
  const {
    data: testSeriesData,
    error,
    isLoading,
  } = useSWR<IMainTestSeriesResponse>(
    `/apq/math?claas=10th&subject=${subjectName}&chapter=${chapterName}`,
    fetcher,
  );

  if (testSeriesData?.data.length == 0) {
    return (
      <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex items-center justify-center">
        <span className="ml-3 text-base">
          Question Set is not uploaded for this Subject
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Show 3 skeleton cards while loading */}
          {Array.from({ length: 6 }).map((_, index) => (
            <TestSeriesCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex items-center justify-center">
        <span className="ml-3 text-base">{error.message}</span>
      </div>
    );
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
