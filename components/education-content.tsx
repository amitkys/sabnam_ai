// src/components/education-content.tsx

import { useEffect } from "react";

import { useBoardStore } from "@/lib/store/boardStore";
import { BoardBreadcrumb } from "@/components/board/board-breadcrumb";
import { BoardList } from "@/components/board/board-list";
import { StandardList } from "@/components/board/board-standard-list";
import { SubjectList } from "@/components/board/board-subject-list";
import { ChapterList } from "@/components/board/board-chapter-list";
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
        <BoardBreadcrumb />
        <BoardList />
      </div>
    );
  }

  if (boardType && !standard) {
    return (
      <div>
        <BoardBreadcrumb />
        <StandardList />
      </div>
    );
  }

  if (boardType && standard && !subject) {
    return (
      <div>
        <BoardBreadcrumb />
        <SubjectList />
      </div>
    );
  }

  if (boardType && standard && subject && !chapter) {
    return (
      <div>
        <BoardBreadcrumb />
        <ChapterList />
      </div>
    );
  }

  // Show chapter content if all selections are made
  return (
    <div>
      <BoardBreadcrumb />
      <ChapterContent />
    </div>
  );
}
