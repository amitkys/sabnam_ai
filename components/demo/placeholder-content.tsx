import Link from "next/link";
import { GoHome } from "react-icons/go";

import { Spinner } from "@/components/custom/spinner";
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
  return (
    <ContentLayout title="Account">
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
            <BreadcrumbPage>10th</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content />
    </ContentLayout>
  );
}

function Content() {
  return (
    <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex items-center justify-center">
      <Spinner size="xl" variant="primary" />
    </div>
  );
}
