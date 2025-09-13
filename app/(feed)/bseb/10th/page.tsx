"use client";
import React, { useState } from "react";
import Link from "next/link";
import { GoHome } from "react-icons/go";

import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Loader } from "@/components/ui/loader";

export default function Page() {
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
            <BreadcrumbPage>10th</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content />
    </ContentLayout>
  );
}

// data for subjects
const subjects = [
  { title: "Physics", url: "/bseb/10th/physics" },
  { title: "Chemistry", url: "/bseb/10th/chemistry" },
  { title: "Biology", url: "/bseb/10th/biology" },
  { title: "Math", url: "/bseb/10th/math" },
  { title: "Hindi", url: "/bseb/10th/hindi" },
  { title: "Sanskrit", url: "/bseb/10th/sanskrit" },
  { title: "Social Science", url: "/bseb/10th/social-science" },
];

const Content = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setLoading(false); // reset loader on new selection
  };

  const handleExploreClick = () => {
    setLoading(true);
  };

  const selectedSubjectUrl =
    subjects.find((sub) => sub.title === selectedSubject)?.url || "#";

  return (
    <div className="flex flex-col items-center justify-center mt-8 lg:mt-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Choose Subject
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {subjects.map((subject, index) => (
            <Button
              key={index}
              className="w-full text-base lg:text-lg py-6"
              variant={"default"}
              onClick={() => handleSubjectSelect(subject.title)}
            >
              {subject.title}
            </Button>
          ))}
        </CardContent>

        <CardFooter className="mt-6">
          {selectedSubject ? (
            <Button
              asChild
              className="w-full text-lg py-6 flex items-center justify-center gap-2"
              disabled={loading}
              size="lg"
              onClick={handleExploreClick}
            >
              <Link href={selectedSubjectUrl}>
                {loading && <Loader size="small" variant="spin" />}
                Explore {selectedSubject}
              </Link>
            </Button>
          ) : (
            <Button disabled className="w-full text-lg py-6" size="lg">
              Explore Subject
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
