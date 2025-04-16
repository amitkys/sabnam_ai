"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GoHome } from "react-icons/go";
import {
  BookOpen,
  GraduationCap,
  School,
  BookText,
  ChevronRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface EducationContentProps {
  boardType: string | null;
  standard: string | null;
  subject: string | null;
  chapter: string | null;
  data: any;
}

export default function EducationContent({
  boardType,
  standard,
  subject,
  chapter,
  data,
}: EducationContentProps) {
  const [activeTab, setActiveTab] = useState<string>("content");
  const [content, setContent] = useState<string | null>(null);
  const [boardName, setBoardName] = useState<string | null>(null);
  const [standardName, setStandardName] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string | null>(null);
  const [chapterName, setChapterName] = useState<string | null>(null);

  // Get the available options based on current selections
  const boards = data.boards;

  // Update content when selections change
  useEffect(() => {
    if (boardType) {
      const board = boards.find((b: any) => b.id === boardType);

      if (!board) return;
      setBoardName(board.name);

      if (standard) {
        const std = board.standards.find((s: any) => s.id === standard);

        if (!std) return;
        setStandardName(std.name);

        if (subject) {
          const subj = std.subjects.find((s: any) => s.id === subject);

          if (!subj) return;
          setSubjectName(subj.name);

          if (chapter) {
            const chap = subj.chapters.find((c: any) => c.id === chapter);

            if (!chap) return;
            setChapterName(chap.name);
            setContent(chap.content);
          }
        }
      }
    }
  }, [boardType, standard, subject, chapter, boards]);

  // Determine the current active breadcrumb level
  const getCurrentLevel = () => {
    if (chapter) return "chapter";
    if (subject) return "subject";
    if (standard) return "standard";
    if (boardType) return "board";

    return "home";
  };

  const currentLevel = getCurrentLevel();

  // Render breadcrumbs based on the current navigation state
  const renderBreadcrumbs = () => (
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
                          <span>{subjectName}</span>{" "}
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

  // Show boards selection if no board is selected
  if (!boardType) {
    return (
      <div>
        {renderBreadcrumbs()}
        <Card>
          <CardHeader className="flex items-center justify-center">
            <CardTitle className="text-xl lg:text-2xl">Boards</CardTitle>
            <CardDescription>Select board to explore content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
              {boards.map((board: any) => (
                <Link key={board.id} href={`/board?type=${board.id}`}>
                  <Card className="cursor-pointer hover:bg-secondary transition-colors h-full">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-2 text-foreground/75">
                        <School className="h-5 w-5" />
                        <CardTitle className="text-lg uppercase">
                          {board.name}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {board.standards.length} standards available
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show standard selection if board is selected but no standard
  if (boardType && !standard) {
    return (
      <div>
        {renderBreadcrumbs()}
        <Card>
          <CardHeader className="flex items-center justify-center">
            <div className="flex items-center justify-center gap-2">
              <School className="h-5 w-5" />
              <CardTitle className="uppercase">{boardName}</CardTitle>
            </div>
            <CardDescription>Select a standard to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards
                .find((b: any) => b.id === boardType)
                ?.standards.map((std: any) => (
                  <Link
                    key={std.id}
                    href={`/board?type=${boardType}&standard=${std.id}`}
                  >
                    <Card className="cursor-pointer hover:bg-secondary transition-colors h-full">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2 text-foreground/75">
                          <GraduationCap className="h-5 w-5" />
                          <CardTitle className="text-lg">{std.name}</CardTitle>
                        </div>
                        <CardDescription>
                          {std.subjects.length} subjects available
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show subject selection if board and standard are selected but no subject
  if (boardType && standard && !subject) {
    const subjects =
      boards
        .find((b: any) => b.id === boardType)
        ?.standards.find((s: any) => s.id === standard)?.subjects || [];

    return (
      <div>
        {renderBreadcrumbs()}
        <Card>
          <CardHeader className="flex items-center justify-center">
            <div className="flex items-center justify-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <CardTitle>{standardName}</CardTitle>
            </div>
            <CardDescription>Select a subject to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subj: any) => (
                <Link
                  key={subj.id}
                  href={`/board?type=${boardType}&standard=${standard}&subject=${subj.id}`}
                >
                  <Card className="cursor-pointer hover:bg-secondary transition-colors h-full">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-2 text-foreground/75">
                        <BookOpen className="h-5 w-5" />
                        <CardTitle className="text-lg">{subj.name}</CardTitle>
                      </div>
                      <CardDescription>
                        {subj.chapters.length} chapters available
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show chapter selection if board, standard, and subject are selected but no chapter
  if (boardType && standard && subject && !chapter) {
    const chapters =
      boards
        .find((b: any) => b.id === boardType)
        ?.standards.find((s: any) => s.id === standard)
        ?.subjects.find((s: any) => s.id === subject)?.chapters || [];

    return (
      <div>
        {renderBreadcrumbs()}
        <Card>
          <CardHeader className="flex items-center justify-center">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5" />
              <CardTitle>{subjectName}</CardTitle>
            </div>
            <CardDescription>Select a chapter to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chap: any) => (
                <Link
                  key={chap.id}
                  href={`/board?type=${boardType}&standard=${standard}&subject=${subject}&chapter=${chap.id}`}
                >
                  <Card className="cursor-pointer hover:bg-secondary transition-colors h-full">
                    <CardHeader className="p-4 text-foreground/75 ">
                      <div className="flex items-center gap-2">
                        <BookText className="h-5 w-5" />
                        <CardTitle className="text-base">{chap.name}</CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show chapter content if all selections are made
  return (
    <div>
      {renderBreadcrumbs()}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookText className="h-5 w-5" />
            <CardTitle>{chapterName}</CardTitle>
          </div>
          <CardDescription>
            {subjectName} | {standardName} | {boardName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="objectives">Learning Objectives</TabsTrigger>
              <TabsTrigger value="practice">Practice Questions</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-0" value="content">
              <ScrollArea className="h-[60vh] rounded-md border p-4">
                <div className="prose dark:prose-invert max-w-none">
                  <h2>Chapter Content</h2>
                  <p>{content}</p>
                  <p>
                    This section would contain detailed explanations of the key
                    concepts related to {chapterName} in {subjectName}.
                  </p>
                  <h3>Key Concepts</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <h3>Formulas and Definitions</h3>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                  </p>
                  <h3>Examples</h3>
                  <p>
                    Practical examples and problems would be presented here to
                    help students understand the application of concepts.
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent className="mt-0" value="objectives">
              <ScrollArea className="h-[60vh] rounded-md border p-4">
                <div className="prose dark:prose-invert max-w-none">
                  <h2>Learning Objectives</h2>
                  <p>After studying this chapter, you should be able to:</p>
                  <ul>
                    <li>Understand the key concepts of {chapterName}</li>
                    <li>Apply theoretical knowledge to solve problems</li>
                    <li>Analyze and interpret related scenarios</li>
                    <li>Evaluate different approaches to problem-solving</li>
                    <li>Create your own examples and solutions</li>
                  </ul>
                  <h3>Knowledge Outcomes</h3>
                  <p>
                    By the end of this chapter, students will have a
                    comprehensive understanding of the fundamental principles
                    and concepts related to {chapterName}.
                  </p>
                  <h3>Skill Outcomes</h3>
                  <p>
                    Students will develop the ability to apply theoretical
                    knowledge to practical situations and solve complex problems
                    related to {chapterName}.
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent className="mt-0" value="practice">
              <ScrollArea className="h-[60vh] rounded-md border p-4">
                <div className="prose dark:prose-invert max-w-none">
                  <h2>Practice Questions</h2>
                  <p>
                    Test your understanding of {chapterName} with these practice
                    questions:
                  </p>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium">Question 1</h3>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua?
                      </p>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            className="h-4 w-4"
                            id="q1a"
                            name="q1"
                            type="radio"
                          />
                          <label htmlFor="q1a">Option A</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            className="h-4 w-4"
                            id="q1b"
                            name="q1"
                            type="radio"
                          />
                          <label htmlFor="q1b">Option B</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            className="h-4 w-4"
                            id="q1c"
                            name="q1"
                            type="radio"
                          />
                          <label htmlFor="q1c">Option C</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            className="h-4 w-4"
                            id="q1d"
                            name="q1"
                            type="radio"
                          />
                          <label htmlFor="q1d">Option D</label>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium">Question 2</h3>
                      <p>
                        Ut enim ad minim veniam, quis nostrud exercitation
                        ullamco laboris nisi ut aliquip ex ea commodo consequat?
                      </p>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            className="h-4 w-4"
                            id="q2a"
                            name="q2"
                            type="radio"
                          />
                          <label htmlFor="q2a">Option A</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            className="h-4 w-4"
                            id="q2b"
                            name="q2"
                            type="radio"
                          />
                          <label htmlFor="q2b">Option B</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            className="h-4 w-4"
                            id="q2c"
                            name="q2"
                            type="radio"
                          />
                          <label htmlFor="q2c">Option C</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            className="h-4 w-4"
                            id="q2d"
                            name="q2"
                            type="radio"
                          />
                          <label htmlFor="q2d">Option D</label>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium">Question 3</h3>
                      <p>
                        Duis aute irure dolor in reprehenderit in voluptate
                        velit esse cillum dolore eu fugiat nulla pariatur?
                      </p>
                      <textarea
                        className="w-full mt-2 p-2 border rounded-md"
                        placeholder="Write your answer here..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button>Submit Answers</Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
