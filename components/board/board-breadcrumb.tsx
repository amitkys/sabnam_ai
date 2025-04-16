// src/components/education/education-breadcrumb.tsx

import Link from "next/link";
import { GoHome } from "react-icons/go";
import { BookOpen, BookText, ChevronRight, School } from "lucide-react";

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
import { useBoardStore } from "@/lib/store/boardStore";

export function EducationBreadcrumb() {
  const {
    boardType,
    standard,
    subject,
    chapter,
    boardName,
    standardName,
    subjectName,
    chapterName,
  } = useBoardStore();

  // Determine the current active breadcrumb level
  const getCurrentLevel = () => {
    if (chapter) return "chapter";
    if (subject) return "subject";
    if (standard) return "standard";
    if (boardType) return "board";

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
                {currentLevel === "home" && !boardType ? (
                  <BreadcrumbPage className="flex items-center">
                    <School className="h-4 w-4 text-primary" />
                    <span className="ml-1 font-medium text-primary">
                      Boards
                    </span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link className="flex items-center" href="/board">
                      <School className="h-4 w-4" />
                      {currentLevel === "board" && !boardType && (
                        <span className="ml-1">Boards</span>
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>Boards</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </BreadcrumbItem>

        {boardType && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <TooltipProvider>
                <Tooltip delayDuration={10}>
                  <TooltipTrigger asChild>
                    {currentLevel === "board" ? (
                      <BreadcrumbPage className="flex items-center">
                        <span className="uppercase font-medium text-primary">
                          {boardName}
                        </span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          className="flex items-center"
                          href={`/board?type=${boardType}`}
                        >
                          <span className="uppercase">{boardName}</span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="uppercase">{boardName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </BreadcrumbItem>
          </>
        )}

        {/* Additional breadcrumb items for standard, subject, chapter... */}
        {standard && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <TooltipProvider>
                <Tooltip delayDuration={10}>
                  <TooltipTrigger asChild>
                    {currentLevel === "standard" ? (
                      <BreadcrumbPage className="flex items-center">
                        <span className="font-medium text-primary">
                          {standardName
                            ? standardName.split(" ").slice(1).join(" ")
                            : ""}
                        </span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          className="flex items-center"
                          href={`/board?type=${boardType}&standard=${standard}`}
                        >
                          <span>
                            {standardName
                              ? standardName.split(" ").slice(1).join(" ")
                              : ""}
                          </span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{standardName}</p>
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
                          href={`/board?type=${boardType}&standard=${standard}&subject=${subject}`}
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
