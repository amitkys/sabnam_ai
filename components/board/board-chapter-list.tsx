// src/components/education/chapter-list.tsx

import type { Chapter } from "@/lib/type/board";

import Link from "next/link";
import { ArrowLeft, BookText } from "lucide-react";

import { SelectSeparator } from "../ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/boardStore";

export function ChapterList() {
  const { boardType, standard, subject, subjectName, standardName, data } =
    useBoardStore();

  const chapters =
    data.boards
      .find((b) => b.id === boardType)
      ?.standards.find((s) => s.id === standard)
      ?.subjects.find((s) => s.id === subject)?.chapters || [];

  return (
    <Card className="bg-background">
      <CardHeader className="px-4 text-foreground/75">
        {/* Title row with back button */}
        <div className="flex items-center justify-between w-full mx-2">
          {/* Left - Back Button aligned with CardTitle */}
          <Link
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 group"
            href={`/board?type=${boardType}&standard=${standard}`}
          >
            <ArrowLeft className="h-4 md:h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>

          {/* Middle - Title only */}
          <CardTitle className="uppercase text-center flex-1">
            {subjectName}
          </CardTitle>

          {/* Right - Empty space for balance */}
          <div className="w-6 md:w-8" />
        </div>

        {/* Description centered below title */}
        <CardDescription className="text-center mt-1">
          Select a chapter to continue
        </CardDescription>
        <SelectSeparator />
      </CardHeader>

      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chap: Chapter) => (
            <Link
              key={chap.id}
              href={`/board?type=${boardType}&standard=${standard}&subject=${subject}&chapter=${chap.id}`}
            >
              <Card className="cursor-pointer hover:bg-secondary/70 transition-colors h-full">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2 text-foreground/75">
                    <BookText className="h-5 w-5" />
                    <CardTitle
                      className="text-lg truncate max-w-xs"
                      title={chap.name}
                    >
                      {chap.name}
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
