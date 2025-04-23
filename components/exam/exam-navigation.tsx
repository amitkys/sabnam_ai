// src/components/exam/exam-navigation.tsx

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { useExamStore } from "@/lib/store/examStore";
import { Button } from "@/components/ui/button";

export function ExamNavigation({ className }: { className?: string }) {
  const { examType, subject, chapter, data } = useExamStore();

  // Find current indexes
  const currentExam = data.exams.find((exam) => exam.id === examType);
  const currentSubject = currentExam?.subjects.find((s) => s.id === subject);
  const currentChapterIndex = currentSubject?.chapters.findIndex(
    (c) => c.id === chapter,
  );

  // Get previous and next chapter
  const prevChapter =
    currentChapterIndex !== undefined && currentChapterIndex > 0
      ? currentSubject?.chapters[currentChapterIndex - 1]
      : null;

  const nextChapter =
    currentChapterIndex !== undefined &&
      currentChapterIndex < (currentSubject?.chapters.length || 0) - 1
      ? currentSubject?.chapters[currentChapterIndex + 1]
      : null;

  // If we don't have exam, subject and chapter, don't render navigation
  if (!examType || !subject || !chapter) {
    return null;
  }

  return (
    <div className={cn("flex justify-between items-center mt-6", className)}>
      {prevChapter ? (
        <Button
          asChild
          className="flex items-center gap-2 group"
          variant="outline"
        >
          <Link
            href={`/exams?type=${examType}&subject=${subject}&chapter=${prevChapter.id}`}
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Previous: {prevChapter.name}</span>
          </Link>
        </Button>
      ) : (
        <div />
      )}

      {nextChapter ? (
        <Button
          asChild
          className="flex items-center gap-2 group"
          variant="outline"
        >
          <Link
            href={`/exams?type=${examType}&subject=${subject}&chapter=${nextChapter.id}`}
          >
            <span>Next: {nextChapter.name}</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}
