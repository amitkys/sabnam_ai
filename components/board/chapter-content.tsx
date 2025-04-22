// src/components/education/chapter-content.tsx

import { BookText } from "lucide-react";
import useSWR from "swr";

import { Separator } from "../ui/separator";
import { TestSeriesCardSkeleton } from "../TestSeries/TestCard-skelton";

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
  const { chapterName, subjectName, standardName, boardName } = useBoardStore();
  const {
    data: testSeriesData,
    error,
    isLoading,
  } = useSWR<IMainTestSeriesResponse>(
    `/api/math?board=${boardName}&standard=${standardName}&subject=${subjectName}&chapter=${chapterName}`,
    fetcher,
  );

  return (
    <Card>
      <CardHeader className="text-foreground/75">
        <div className="flex items-center gap-2">
          <BookText className="h-5 w-5" />
          <CardTitle>{chapterName}</CardTitle>
        </div>
        <CardDescription>
          {subjectName} | {standardName} | {boardName?.toUpperCase()}
        </CardDescription>
        <Separator />
      </CardHeader>

      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        {/* Show 3 skeleton cards while loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Show 3 skeleton cards while loading */}
          {Array.from({ length: 6 }).map((_, index) => (
            <TestSeriesCardSkeleton key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
