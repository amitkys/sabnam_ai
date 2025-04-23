// src/components/exam/exam-chapter-list.tsx

import type { Chapter } from "@/lib/type/exam";

import Link from "next/link";
import { BookOpen } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useExamStore } from "@/lib/store/examStore";

export function ChapterList() {
  const { examType, subject, examName, subjectName, data } = useExamStore();

  const currentExam = data.exams.find((e) => e.id === examType);
  const currentSubject = currentExam?.subjects.find((s) => s.id === subject);
  const chapters = currentSubject?.chapters || [];

  return (
    <Card>
      <CardHeader className="flex items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <CardTitle>{subjectName}</CardTitle>
        </div>
        <CardDescription>
          {examName?.toUpperCase()} | Select a chapter to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chap: Chapter) => (
            <Link
              key={chap.id}
              href={`/exams?type=${examType}&subject=${subject}&chapter=${chap.id}`}
            >
              <Card className="cursor-pointer hover:bg-secondary transition-colors h-full">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2 text-foreground/75">
                    <BookOpen className="h-5 w-5" />
                    <CardTitle className="text-lg">{chap.name}</CardTitle>
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
