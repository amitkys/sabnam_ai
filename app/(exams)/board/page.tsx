// src/app/board/page.tsx

"use client";

import { useSearchParams } from "next/navigation";

import EducationContent from "@/components/education-content";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useEducationStore } from "@/lib/store/boardStore";

export default function BoardPage() {
  const searchParams = useSearchParams();
  const boardType = searchParams.get("type");
  const standard = searchParams.get("standard");
  const subject = searchParams.get("subject");
  const chapter = searchParams.get("chapter");

  const { boardName, standardName, subjectName, chapterName } =
    useEducationStore();

  // Determine the title based on the current navigation state
  const getTitle = () => {
    if (chapter && subject && standard && boardType) {
      return chapterName || "Chapter";
    }

    if (subject && standard && boardType) {
      return subjectName || "Subject";
    }

    if (standard && boardType) {
      return standardName || "Standard";
    }

    if (boardType) {
      return boardName || "Board";
    }

    return "Educational Boards";
  };

  return (
    <ContentLayout title={getTitle()}>
      <div className="absolute top-4 right-4 z-10" />
      <EducationContent
        boardType={boardType}
        chapter={chapter}
        standard={standard}
        subject={subject}
      />
    </ContentLayout>
  );
}
