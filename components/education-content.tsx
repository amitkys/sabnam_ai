// src/components/education-content.tsx

import { useEffect } from "react";

import { useBoardStore } from "@/lib/store/boardStore";
import { EducationBreadcrumb } from "@/components/board/board-breadcrumb";
import { BoardList } from "@/components/board/board-list";
import { StandardList } from "@/components/board/standard-list";
import { SubjectList } from "@/components/board/subject-list";
import { ChapterList } from "@/components/board/chapter-list";
import { ChapterContent } from "@/components/board/chapter-content";

interface EducationContentProps {
  boardType: string | null;
  standard: string | null;
  subject: string | null;
  chapter: string | null;
}

export default function EducationContent({
  boardType,
  standard,
  subject,
  chapter,
}: EducationContentProps) {
  const { setNavigation } = useBoardStore();

  // Sync URL params with store state
  useEffect(() => {
    setNavigation({ boardType, standard, subject, chapter });
  }, [boardType, standard, subject, chapter, setNavigation]);

  // Render appropriate view based on navigation state
  if (!boardType) {
    return (
      <div>
        <EducationBreadcrumb />
        <BoardList />
      </div>
    );
  }

  if (boardType && !standard) {
    return (
      <div>
        <EducationBreadcrumb />
        <StandardList />
      </div>
    );
  }

  if (boardType && standard && !subject) {
    return (
      <div>
        <EducationBreadcrumb />
        <SubjectList />
      </div>
    );
  }

  if (boardType && standard && subject && !chapter) {
    return (
      <div>
        <EducationBreadcrumb />
        <ChapterList />
      </div>
    );
  }

  // Show chapter content if all selections are made
  return (
    <div>
      <EducationBreadcrumb />
      <ChapterContent />
    </div>
  );
}
