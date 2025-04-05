"use client";
import React, { useState } from "react";
import Link from "next/link";
import { GoHome } from "react-icons/go";
import { useRouter } from "next/navigation";

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
import { Spinner } from "@/components/custom/spinner";

export default function Page() {
  return (
    <ContentLayout title="Physics">
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
            <BreadcrumbPage>Physics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content />
    </ContentLayout>
  );
}

// Chapters for Physics (NCERT 10th)
const physicsChapters = [
  { title: "धारा विद्युत", url: "electricity" },
  {
    title: "विद्युत धारा के चुम्बकीय प्रभाव",
    url: "magnetic-effects-of-electric-current",
  },
  { title: "प्रकाश का परावर्तन", url: "reflection-of-light" },
  { title: "प्रकाश का अपवर्तन", url: "refraction-of-light" },
  {
    title: "मानव नेत्र और रंगबिरंगा संसार",
    url: "human-eye-and-colorful-world",
  },
  { title: "ऊर्जा के स्रोत", url: "sources-of-energy" },
];

const Content = () => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [loadingChapter, setLoadingChapter] = useState<string | null>(null);
  const router = useRouter();

  // Handle chapter selection
  const handleChapterSelect = (chapterUrl: string) => {
    setSelectedChapter(chapterUrl);
    setLoadingChapter(chapterUrl);
    router.push(`/bseb/10th/physics/${chapterUrl}`);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-6">
      {/* Large Card */}
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Physics Chapters
          </CardTitle>
        </CardHeader>

        {/* Chapter Buttons */}
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {physicsChapters.map((chapter, index) => (
            <Button
              key={index}
              className="w-full text-base lg:text-lg py-6 font-serif"
              disabled={selectedChapter === chapter.url}
              variant={selectedChapter === chapter.url ? "default" : "outline"}
              onClick={() => handleChapterSelect(chapter.url)}
            >
              {chapter.title}
              {loadingChapter === chapter.url && (
                <Spinner className="" size={"default"} variant={"muted"} />
              )}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
