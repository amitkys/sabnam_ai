// src/components/education/chapter-list.tsx

import type { Chapter } from "@/lib/type/board";

import Link from "next/link";
import { BookText } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/boardStore";

export function ChapterList() {
  const { boardType, standard, subject, subjectName, data } = useBoardStore();

  const chapters =
    data.boards
      .find((b) => b.id === boardType)
      ?.standards.find((s) => s.id === standard)
      ?.subjects.find((s) => s.id === subject)?.chapters || [];

  return (
    <Card>
      <CardHeader className="flex items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <CardTitle>{subjectName}</CardTitle>
        </div>
        <CardDescription>Select a chapter to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chap: Chapter) => (
            <Link
              key={chap.id}
              href={`/board?type=${boardType}&standard=${standard}&subject=${subject}&chapter=${chap.id}`}
            >
              <Card className="cursor-pointer hover:bg-secondary transition-colors h-full">
                <CardHeader className="p-4 text-foreground/75">
                  <div className="flex items-center gap-2">
                    <BookText className="h-5 w-5" />
                    <CardTitle className="text-base">{chap.name}</CardTitle>
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
