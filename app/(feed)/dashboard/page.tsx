"use client";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import { TestSummaryResponse } from "@/lib/type";
import { DashboardUI } from "@/components/custom/dashboardUI";
import Loading from "./loading";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";

// fethcer function for Promise<Testsummary>
const fetcher = (url: string): Promise<TestSummaryResponse> =>
  fetch(url).then((res) => res.json());

export default function Page() {
  return (
    <ContentLayout title="Account">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Sabnam</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ContentPage />
    </ContentLayout>
  );

}

function ContentPage() {
  // user session
  const { data: session, status } = useSession();
  // conditioanlly fetched data when user mounted
  const {
    data: TestsummaryData,
    error,
    isLoading,
  } = useSWR<TestSummaryResponse>(
    status === "authenticated" && session?.user?.id
      ? `/api/testSeriesSummary/${session.user.id}`
      : null,
    fetcher,
  );

  if (error) {
    return <p>Failed to load data</p>;
  }

  const finalLoading = status === "authenticated" && isLoading;

  if (finalLoading) return <Loading />;

  return (
    <>
      {session?.user && TestsummaryData ? (
        <DashboardUI TestSummaryData={TestsummaryData} user={session.user} />
      ) : null}
    </>
  );
}
