"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GoHome } from "react-icons/go";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { subjectChapterMap } from "@/lib/subjects/subject";
import SubjectNotFound from "@/components/custom/subject-not-found";
import { ISubject } from "@/lib/type";

export default function Page() {
  const { subject } = useParams();

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
              <Link href="/bseb/10th">10th</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="capitalize">{subject}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content subjectName={subject} />
    </ContentLayout>
  );
}

const Content = ({ subjectName }: ISubject) => {
  const [loadingChapter, setLoadingChapter] = useState<string | null>(null);
  const router = useRouter();

  const chapters = subjectChapterMap[subjectName as string];

  // Handle invalid subject
  if (!chapters) {
    return <SubjectNotFound subjectName={subjectName} />;
  }

  // Handle chapter selection and redirect
  const handleChapterSelect = (chapterUrl: string) => {
    setLoadingChapter(chapterUrl);
    router.push(`/bseb/10th/${subjectName}/${chapterUrl}`);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-6">
      {/* Large Card */}
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center capitalize">
            {subjectName} Chapters
          </CardTitle>
        </CardHeader>
        {/* Chapter Buttons */}
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chapters.map((chapter, index) => (
            <Button
              key={index}
              className="w-full text-base lg:text-lg py-6 font-serif"
              disabled={loadingChapter === chapter.url}
              variant={"default"}
              onClick={() => handleChapterSelect(chapter.url)}
            >
              {loadingChapter === chapter.url && (
                <Loader size="small" variant="spin" />
              )}
              <span>{chapter.title}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
