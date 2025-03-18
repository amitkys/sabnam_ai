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

// Static data for subjects
const subjects = [
  {
    title: "Physics",
    url: "/bseb/10th/physics", // Updated URL
  },
  {
    title: "Chemistry",
    url: "/bseb/10th/chemistry", // Updated URL
  },
  {
    title: "Biology",
    url: "/bseb/10th/biology", // Updated URL
  },
  {
    title: "Math",
    url: "/bseb/10th/math", // Updated URL
  },
  {
    title: "Hindi",
    url: "/bseb/10th/hindi", // Updated URL
  },
  {
    title: "Sanskrit",
    url: "/bseb/10th/sanskrit", // Updated URL
  },
  {
    title: "Social Science",
    url: "/bseb/10th/social-science", // Updated URL
  },
];

const Content = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Handle subject selection
  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
  };

  // Get the URL for the selected subject
  const selectedSubjectUrl =
    subjects.find((sub) => sub.title === selectedSubject)?.url || "#";

  return (
    <div className="flex flex-col items-center justify-center mt-8 lg:mt-12">
      {/* Large Card */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Choose Subject
          </CardTitle>
        </CardHeader>

        {/* Small Buttons for Subjects */}
        <CardContent className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {subjects.map((subject, index) => (
            <Button
              key={index}
              className="w-full text-base lg:text-lg py-6"
              variant={
                selectedSubject === subject.title ? "default" : "outline"
              }
              onClick={() => handleSubjectSelect(subject.title)}
            >
              {subject.title}
            </Button>
          ))}
        </CardContent>

        {/* Full-width Button */}
        <CardFooter className="mt-6">
          {selectedSubject ? (
            <Button asChild className="w-full text-lg py-6" size={"lg"}>
              <Link href={selectedSubjectUrl}>Explore {selectedSubject}</Link>
            </Button>
          ) : (
            <Button disabled className="w-full text-lg py-6" size={"lg"}>
              Explore Subject
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
