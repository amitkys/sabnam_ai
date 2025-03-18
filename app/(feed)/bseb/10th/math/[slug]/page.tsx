"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GoHome } from "react-icons/go";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

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
      <Content slug={params.slug} />
    </ContentLayout>
  );
}

interface ContentProps {
  slug: string | string[] | undefined;
}

function Content({ slug }: ContentProps) {
  return (
    <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex items-center justify-center">
      {/* <Spinner variant="primary" size="xl" /> */}
      <div>Soon you will see test series for {slug}</div>
    </div>
  );
}
