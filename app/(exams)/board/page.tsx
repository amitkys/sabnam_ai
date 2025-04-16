"use client";

import { useSearchParams } from "next/navigation";

import EducationContent from "@/components/education-content";
import { educationalData } from "@/lib/data";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function BoardPage() {
  const searchParams = useSearchParams();
  const boardType = searchParams.get("type");
  const standard = searchParams.get("standard");
  const subject = searchParams.get("subject");
  const chapter = searchParams.get("chapter");

  // Determine the title based on the current navigation state
  const getTitle = () => {
    if (chapter && subject && standard && boardType) {
      const board = educationalData.boards.find((b) => b.id === boardType);
      const std = board?.standards.find((s) => s.id === standard);
      const subj = std?.subjects.find((s) => s.id === subject);
      const chap = subj?.chapters.find((c) => c.id === chapter);

      return chap?.name || "Chapter";
    }

    if (subject && standard && boardType) {
      const board = educationalData.boards.find((b) => b.id === boardType);
      const std = board?.standards.find((s) => s.id === standard);
      const subj = std?.subjects.find((s) => s.id === subject);

      return subj?.name || "Subject";
    }

    if (standard && boardType) {
      const board = educationalData.boards.find((b) => b.id === boardType);
      const std = board?.standards.find((s) => s.id === standard);

      return std?.name || "Standard";
    }

    if (boardType) {
      const board = educationalData.boards.find((b) => b.id === boardType);

      return board?.name || "Board";
    }

    return "Educational Boards";
  };

  return (
    <ContentLayout title={getTitle()}>
      <div className="absolute top-4 right-4 z-10" />
      <EducationContent
        boardType={boardType}
        chapter={chapter}
        data={educationalData}
        standard={standard}
        subject={subject}
      />
    </ContentLayout>
  );
}
