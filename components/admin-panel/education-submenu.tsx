"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, BookOpen, BookText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { boardExam } from "@/lib/board/data";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EducationSubmenuProps {
  boardId: string;
  standardId: string;
  isOpen: boolean;
}

export function EducationSubmenu({
  boardId,
  standardId,
  isOpen,
}: EducationSubmenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  const currentSubject = searchParams.get("subject");
  const currentChapter = searchParams.get("chapter");

  // Find the board and standard
  const board = boardExam.boards.find((b) => b.id === boardId);
  const standard = board?.standards.find((s) => s.id === standardId);

  if (!board || !standard) return null;

  const subjects = standard.subjects;

  // Initialize open state for subjects
  useEffect(() => {
    let initialOpenSubjects: Record<string, boolean> = {};

    if (currentSubject) {
      initialOpenSubjects = {
        ...initialOpenSubjects,
        [currentSubject]: true,
      };
    }
    setOpenSubjects(initialOpenSubjects);
  }, [currentSubject]);

  const toggleSubject = (subjectId: string) => {
    setOpenSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const isSubjectActive = (subjectId: string) => {
    return currentSubject === subjectId;
  };

  const isChapterActive = (subjectId: string, chapterId: string) => {
    return currentSubject === subjectId && currentChapter === chapterId;
  };

  return (
    <div className="pl-6 mt-1 space-y-1">
      {subjects.map((subject) => (
        <TooltipProvider key={subject.id} disableHoverableContent>
          <Collapsible
            open={openSubjects[subject.id] || isSubjectActive(subject.id)}
            onOpenChange={() => toggleSubject(subject.id)}
          >
            <Tooltip delayDuration={10}>
              <CollapsibleTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full justify-between h-8 text-sm"
                    variant={
                      isSubjectActive(subject.id) ? "secondary" : "ghost"
                    }
                  >
                    <div className="flex items-center">
                      <BookOpen
                        className={cn(isOpen === false ? "" : "mr-2")}
                        size={16}
                      />
                      <span
                        className={cn(
                          "max-w-[160px] truncate",
                          isOpen === false
                            ? "-translate-x-96 opacity-0"
                            : "translate-x-0 opacity-100",
                        )}
                      >
                        {subject.name}
                      </span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "transition-transform",
                        openSubjects[subject.id] || isSubjectActive(subject.id)
                          ? "rotate-90"
                          : "",
                        isOpen === false ? "opacity-0" : "opacity-100",
                      )}
                      size={16}
                    />
                  </Button>
                </TooltipTrigger>
              </CollapsibleTrigger>
              {isOpen === false && (
                <TooltipContent side="right">{subject.name}</TooltipContent>
              )}
            </Tooltip>

            <CollapsibleContent>
              <div className="pl-6 mt-1 space-y-1">
                {subject.chapters.map((chapter) => (
                  <TooltipProvider key={chapter.id} disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          className="w-full justify-start h-7 text-xs"
                          variant={
                            isChapterActive(subject.id, chapter.id)
                              ? "secondary"
                              : "ghost"
                          }
                        >
                          <Link
                            href={`/board?type=${boardId}&standard=${standardId}&subject=${subject.id}&chapter=${chapter.id}`}
                          >
                            <BookText
                              className={cn(isOpen === false ? "" : "mr-2")}
                              size={14}
                            />
                            <span
                              className={cn(
                                "max-w-[160px] truncate",
                                isOpen === false
                                  ? "-translate-x-96 opacity-0"
                                  : "translate-x-0 opacity-100",
                              )}
                            >
                              {chapter.name}
                            </span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {isOpen === false && (
                        <TooltipContent side="right">
                          {chapter.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TooltipProvider>
      ))}
    </div>
  );
}
