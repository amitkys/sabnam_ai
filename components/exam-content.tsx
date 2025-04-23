"use client";
import { useEffect } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "./ui/button";

import { useExamStore } from "@/lib/store/examStore";
import { ExamBreadcrumb } from "@/components/exam/exam-breadcrumb";
import { ExamList } from "@/components/exam/exam-list";
import { SubjectList } from "@/components/exam/exam-subject-list";
import { ChapterList } from "@/components/exam/exam-chapter-list";
import { ChapterContent } from "@/components/exam/exam-chapter-content";
import { ExamNavigation } from "@/components/exam/exam-navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getExamDisplayName } from "@/utils/parseExamId";

interface ExamContentProps {
  examType: string | null;
  subject: string | null;
  chapter: string | null;
}

export default function ExamContent({
  examType,
  subject,
  chapter,
}: ExamContentProps) {
  const { setNavigation, data, examName, subjectName } = useExamStore();

  // Sync URL params with store state
  useEffect(() => {
    setNavigation({ examType, subject, chapter });
  }, [examType, subject, chapter, setNavigation]);

  // Validation function to check if params exist in data
  const validateParams = () => {
    // If no examType provided, no need to validate
    if (!examType) return { isValid: true };

    // Check if exam exists
    const examExists = data.exams.some((exam) => exam.id === examType);

    if (!examExists) {
      return {
        isValid: false,
        message: `Exam "${getExamDisplayName(examType)}" not found`,
      };
    }

    // If no subject provided, validation passes at exam level
    if (!subject) return { isValid: true };

    // Find the exam
    const currentExam = data.exams.find((exam) => exam.id === examType);

    // Check if subject exists in this exam
    const subjectExists = currentExam?.subjects.some(
      (sub) => sub.id === subject,
    );

    if (!subjectExists) {
      return {
        isValid: false,
        message: `Subject "${subject}" not found in ${examName}`,
      };
    }

    // If no chapter provided, validation passes at subject level
    if (!chapter) return { isValid: true };

    // Find the subject
    const currentSubject = currentExam?.subjects.find(
      (sub) => sub.id === subject,
    );

    // Check if chapter exists in this subject
    const chapterExists = currentSubject?.chapters.some(
      (chap) => chap.id === chapter,
    );

    if (!chapterExists) {
      return {
        isValid: false,
        message: `Chapter "${chapter}" not found in ${subjectName}`,
      };
    }

    // All validations passed
    return { isValid: true };
  };

  const validation = validateParams();

  // If validation fails, show error message
  if (!validation.isValid) {
    return (
      <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex flex-col items-center justify-center space-y-6 p-4 text-foreground/75">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="max-w-md text-foreground/75">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Invalid URL Parameters
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2 text-sm text-foreground/75">
              {validation.message}
            </AlertDescription>
          </Alert>
        </motion.div>

        <Button asChild className="mt-6 group transition-all">
          <Link className="flex items-center gap-2" href="/home">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Homepage
          </Link>
        </Button>
      </div>
    );
  }

  // Render appropriate view based on navigation state
  if (!examType) {
    return (
      <div>
        <ExamBreadcrumb />
        <ExamList />
      </div>
    );
  }

  if (examType && !subject) {
    return (
      <div>
        <ExamBreadcrumb />
        <SubjectList />
      </div>
    );
  }

  if (examType && subject && !chapter) {
    return (
      <div>
        <ExamBreadcrumb />
        <ChapterList />
      </div>
    );
  }

  // Show chapter content if all selections are made
  return (
    <div>
      <ExamBreadcrumb />
      <ChapterContent />
      <ExamNavigation />
    </div>
  );
}
