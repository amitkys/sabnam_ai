// src/components/exam/exam-chapter-content.tsx

"use client";
import { AlertTriangle, BookOpen } from "lucide-react";
import useSWR from "swr";

import { Separator } from "../ui/separator";
import { TestSeriesCardSkeleton } from "../TestSeries/TestCard-skelton";

import { TestSeriesCard } from "@/components/TestSeries/TestSeriesCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useExamStore } from "@/lib/store/examStore";
import { fetcher } from "@/lib/utils";
import { IMainTestSeriesResponse } from "@/lib/type";

export function ChapterContent() {
  // Get both IDs and display names from the store
  const {
    examType,
    subject,
    chapter, // IDs for API requests
    chapterName,
    subjectName,
    examName, // Names for display
  } = useExamStore();

  // Define URL using IDs instead of names
  const url =
    examType && subject && chapter
      ? `/api/exam?exam=${encodeURIComponent(examType)}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`
      : null;

  const {
    data: testSeriesData,
    error,
    isLoading,
  } = useSWR<IMainTestSeriesResponse>(url, fetcher);

  // If required data is missing, render nothing or a message
  if (!examType || !subject || !chapter) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
          <p className="text-lg font-medium">Invalid navigation parameters</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-foreground/75">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <CardTitle>{chapterName}</CardTitle>
        </div>
        <CardDescription>
          {subjectName} | {examName?.toUpperCase()}
        </CardDescription>
        <Separator />
      </CardHeader>
      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <TestSeriesCardSkeleton key={index} />
              ))}
            </>
          )}
          {testSeriesData?.data.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No test series available
              </p>
              <p className="text-sm text-muted-foreground">
                Check back later for new tests
              </p>
            </div>
          )}

          {!isLoading && !error && testSeriesData && (
            <>
              {testSeriesData.data.map((testSeries) => (
                <TestSeriesCard key={testSeries.id} testSeries={testSeries} />
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
