"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Spinner } from "@/components/custom/spinner";

export default function Page() {
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
            <BreadcrumbPage>Math-chapters</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content />
    </ContentLayout>
  );
}
// Chapters for Math
const mathChapters = [
  { title: "वास्तविक संख्याएं", url: "real-numbers" },
  { title: "बहुपद", url: "polynomials" },
  {
    title: "दो चर वाले रैखिक समीकरण",
    url: "linear-equations-in-two-variables",
  },
  { title: "द्विघात समीकरण", url: "quadratic-equations" },
  { title: "समांतर श्रेढ़ियाँ", url: "arithmetic-progressions" },
  { title: "त्रिभुज", url: "triangles" },
  { title: "निर्देशांक ज्यामिति", url: "coordinate-geometry" },
  { title: "त्रिकोणमिति का परिचय", url: "introduction-to-trigonometry" },
  {
    title: "त्रिकोणमिति के कुछ अनुप्रयोग",
    url: "some-applications-of-trigonometry",
  },
  { title: "वृत्त", url: "circles" },
  { title: "रचनाएँ", url: "constructions" },
  { title: "वृत्तों से संबंधित क्षेत्रफल", url: "areas-related-to-circles" },
  { title: "पृष्ठीय क्षेत्रफल और आयतन", url: "surface-areas-and-volumes" },
  { title: "सांख्यिकी", url: "statistics" },
  { title: "प्रायिकता", url: "probability" },
];

const Content = () => {
  const [loadingChapter, setLoadingChapter] = useState<string | null>(null);
  const router = useRouter();

  // Handle chapter selection and redirect
  const handleChapterSelect = (chapterUrl: string) => {
    setLoadingChapter(chapterUrl);
    router.push(`/bseb/10th/math/${chapterUrl}`);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-6">
      {/* Large Card */}
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Math Chapters
          </CardTitle>
        </CardHeader>
        {/* Chapter Buttons */}
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mathChapters.map((chapter, index) => (
            <Button
              key={index}
              className="w-full text-base lg:text-lg py-6 font-serif"
              disabled={loadingChapter === chapter.url}
              variant={loadingChapter === chapter.url ? "default" : "outline"}
              onClick={() => handleChapterSelect(chapter.url)}
            >
              <span>{chapter.title}</span>
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
