// src/components/exam/exam-breadcrumb.tsx

import Link from "next/link";
import { GoHome } from "react-icons/go";
import { BookOpen, BookText, ChevronRight, FileText } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExamStore } from "@/lib/store/examStore";

export function ExamBreadcrumb() {
  const { examType, subject, chapter, examName, subjectName, chapterName } =
    useExamStore();

  // Determine the current active breadcrumb level
  const getCurrentLevel = () => {
    if (chapter) return "chapter";
    if (subject) return "subject";
    if (examType) return "exam";

    return "home";
  };

  const currentLevel = getCurrentLevel();

  return (
    <Breadcrumb className="ml-5 lg:ml-3 mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <TooltipProvider>
            <Tooltip delayDuration={10}>
              <TooltipTrigger asChild>
                {currentLevel === "home" ? (
                  <BreadcrumbPage className="flex items-center">
                    <GoHome className="text-lg text-primary font-bold" />
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href="/home">
                      <GoHome className="text-lg" />
                    </Link>
                  </BreadcrumbLink>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>

        <BreadcrumbItem>
          <TooltipProvider>
            <Tooltip delayDuration={10}>
              <TooltipTrigger asChild>
                {currentLevel === "home" && !examType ? (
                  <BreadcrumbPage className="flex items-center">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="ml-1 font-medium text-primary">Exams</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link className="flex items-center" href="/exam">
                      <FileText className="h-4 w-4" />
                      {currentLevel === "exam" && !examType && (
                        <span className="ml-1">Exams</span>
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>Exams</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </BreadcrumbItem>

        {examType && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <TooltipProvider>
                <Tooltip delayDuration={10}>
                  <TooltipTrigger asChild>
                    {currentLevel === "exam" ? (
                      <BreadcrumbPage className="flex items-center">
                        <span className="uppercase font-medium text-primary">
                          {examName}
                        </span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          className="flex items-center"
                          href={`/exam?type=${examType}`}
                        >
                          <span className="uppercase">{examName}</span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="uppercase">{examName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </BreadcrumbItem>
          </>
        )}

        {subject && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <TooltipProvider>
                <Tooltip delayDuration={10}>
                  <TooltipTrigger asChild>
                    {currentLevel === "subject" ? (
                      <BreadcrumbPage className="flex items-center">
                        <BookText className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-medium text-primary">
                          {subjectName}
                        </span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          className="flex items-center"
                          href={`/exam?type=${examType}&subject=${subject}`}
                        >
                          <BookText className="h-4 w-4 mr-1" />
                          <span>{subjectName}</span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{subjectName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </BreadcrumbItem>
          </>
        )}

        {chapter && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <TooltipProvider>
                <Tooltip delayDuration={10}>
                  <TooltipTrigger asChild>
                    <BreadcrumbPage className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1 text-primary" />
                      <span className="font-medium text-primary">
                        {chapterName}
                      </span>
                    </BreadcrumbPage>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{chapterName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
