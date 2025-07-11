"use client";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";

import { SelectSeparator } from "../ui/select";
import { TestSeriesCardSkeleton } from "../TestSeries/TestCard-skelton";

import { TestSeriesCard } from "@/components/TestSeries/TestSeriesCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/boardStore";
import { fetcher } from "@/lib/utils";
import { IMainTestSeriesResponse } from "@/lib/type";

export function ChapterContent() {
  // Get both IDs and display names from the store
  const {
    boardType,
    standard,
    subject,
    chapter, // IDs for API requests
    chapterName,
    subjectName,
    standardName,
    boardName, // Names for display
  } = useBoardStore();

  // Define URL using IDs instead of names
  const url =
    boardType && standard && subject && chapter
      ? `/api/board?board=${encodeURIComponent(boardType)}&standard=${encodeURIComponent(standard)}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`
      : null;

  const {
    data: testSeriesData,
    error,
    isLoading,
  } = useSWR<IMainTestSeriesResponse>(url, fetcher);

  // If required data is missing, render nothing or a message
  if (!boardType || !standard || !subject || !chapter) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
          <p className="text-lg font-medium">Invalid navigation parameters</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex flex-col space-y-3 items-center justify-center">
        <div className="text-red-500">{error.message}</div>
        <Link className="hover:underline" href={"/board"}>
          Try again
        </Link>
      </div>
    );
  }

  return (
    <Card className="bg-background">
      <CardHeader className="px-4 text-foreground/75">
        {/* Title row with back button */}
        <div className="flex items-center justify-between w-full mx-2">
          {/* Left - Back Button aligned with CardTitle */}
          <Link
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 group"
            href={`/board?type=${boardType}&standard=${standard}&subject=${subject}`}
          >
            <ArrowLeft className="h-4 md:h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          {/* Middle - Title only */}
          <CardTitle className="uppercase text-center flex-1">
            {chapterName}
          </CardTitle>
          {/* Right - Empty space for balance */}
          <div className="w-6 md:w-8" />
        </div>
        {/* Description centered below title */}
        <CardDescription className="text-center mt-1">
          {subjectName} | {standardName} | {boardName?.toUpperCase()}
        </CardDescription>
        <SelectSeparator />
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
