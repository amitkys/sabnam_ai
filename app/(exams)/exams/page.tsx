// src/app/exam/page.tsx

"use client";

import { useSearchParams } from "next/navigation";

import ExamContent from "@/components/exam-content";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useExamStore } from "@/lib/store/examStore";
import { parseExamId } from "@/utils/parseExamId";

export default function ExamPage() {
  const searchParams = useSearchParams();
  const examTypeRaw = searchParams.get("type");
  const subject = searchParams.get("subject");
  const chapter = searchParams.get("chapter");

  // Parse the exam ID to handle cases like "cuet/scqp09"
  const { mainExam } = parseExamId(examTypeRaw);
  const examType = mainExam; // Use the main exam part for store navigation

  const { examName, subjectName, chapterName } = useExamStore();

  // Determine the title based on the current navigation state
  const getTitle = () => {
    if (chapter && subject && examType) {
      return chapterName || "Chapter";
    }

    if (subject && examType) {
      return subjectName || "Subject";
    }

    if (examType) {
      return examName || "Exam";
    }

    return "Exams";
  };

  return (
    <>
      <ContentLayout title={getTitle()}>
        <div className="absolute top-4 right-4 z-10" />
        <ExamContent chapter={chapter} examType={examType} subject={subject} />
      </ContentLayout>
    </>
  );
}
