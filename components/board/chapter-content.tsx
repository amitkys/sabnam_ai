// src/components/education/chapter-content.tsx

import { BookText } from "lucide-react";

import { Separator } from "../ui/separator";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/boardStore";

export function ChapterContent() {
  const { chapterName, subjectName, standardName, boardName } = useBoardStore();

  return (
    <Card>
      <CardHeader>
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
        <div>Hello world</div>
      </CardContent>
    </Card>
  );
}
