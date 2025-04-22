"use client";
import { useEffect } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"; // Add this import if available, or use a similar icon
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "./ui/button";

import { useBoardStore } from "@/lib/store/boardStore";
import { BoardBreadcrumb } from "@/components/board/board-breadcrumb";
import { BoardList } from "@/components/board/board-list";
import { StandardList } from "@/components/board/board-standard-list";
import { SubjectList } from "@/components/board/board-subject-list";
import { ChapterList } from "@/components/board/board-chapter-list";
import { ChapterContent } from "@/components/board/chapter-content";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  const { setNavigation, data, boardName, standardName, subjectName } =
    useBoardStore();

  // Sync URL params with store state
  useEffect(() => {
    setNavigation({ boardType, standard, subject, chapter });
  }, [boardType, standard, subject, chapter, setNavigation]);

  // Validation function to check if params exist in data
  const validateParams = () => {
    // If no boardType provided, no need to validate
    if (!boardType) return { isValid: true };

    // Check if board exists
    const boardExists = data.boards.some((board) => board.id === boardType);

    if (!boardExists) {
      return { isValid: false, message: `Board "${boardType}" not found` };
    }

    // If no standard provided, validation passes at board level
    if (!standard) return { isValid: true };

    // Find the board
    const currentBoard = data.boards.find((board) => board.id === boardType);

    // Check if standard exists in this board
    const standardExists = currentBoard?.standards.some(
      (std) => std.id === standard,
    );

    if (!standardExists) {
      return {
        isValid: false,
        message: `Standard "${standard}" not found in ${boardName}`,
      };
    }

    // If no subject provided, validation passes at standard level
    if (!subject) return { isValid: true };

    // Find the standard
    const currentStandard = currentBoard?.standards.find(
      (std) => std.id === standard,
    );

    // Check if subject exists in this standard
    const subjectExists = currentStandard?.subjects.some(
      (sub) => sub.id === subject,
    );

    if (!subjectExists) {
      return {
        isValid: false,
        message: `Subject "${subject}" not found in ${standardName}`,
      };
    }

    // If no chapter provided, validation passes at subject level
    if (!chapter) return { isValid: true };

    // Find the subject
    const currentSubject = currentStandard?.subjects.find(
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
