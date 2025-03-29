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
import { TestSeriesResponse } from "@/lib/type";
import { fetcher } from "@/lib/utils";

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

  console.log(testSeriesData);

  return (
    <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex items-center justify-center">
      <div>Soon you will see test series for {chapterName}</div>
    </div>
  );
}
