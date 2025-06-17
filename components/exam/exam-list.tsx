import type { Exam } from "@/lib/type/exam";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from '@bprogress/next/app';
import { FileText, Search, Plus, ArrowLeft } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

import { SelectSeparator } from "../ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useExamStore } from "@/lib/store/examStore";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function ExamList() {
  const { data, toggleFavorite } = useExamStore();
  const exams = data.exams;

  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelectExam = (examId: string) => {
    setOpen(false);
    router.push(`/exams?type=${examId}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent, examId: string) => {
    e.preventDefault(); // Prevent the link navigation
    toggleFavorite(examId);
  };

  return (
    <>
      <Card className="bg-background">
        <CardHeader className="px-4 text-foreground/75">
          {/* Title row with back button */}
          <div className="flex items-center justify-between w-full mx-2">
            {/* Left - Back Button aligned with CardTitle */}
            <Link
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 group"
              href="/home"
            >
              <ArrowLeft className="h-4 md:h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            {/* Middle - Title only */}
            <CardTitle className="uppercase text-center flex-1">
              Explore Exams
            </CardTitle>
            {/* Right - Empty space for balance */}
            <div className="w-6 md:w-8" />
          </div>

          {/* Description centered below title */}
          <CardDescription className="text-center mt-1">
            Select an exam to explore content
          </CardDescription>
          <SelectSeparator className="my-2" />

          {/* Search and Request Row */}
          <div className="flex flex-row items-center justify-end flex-wrap gap-2 mt-2">
            {/* Search Button */}
            {/* <div className="w-auto">
              <Button
                className="justify-start text-muted-foreground"
                variant="outline"
                onClick={() => setOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Search exams...</span>
                <kbd className="ml-auto hidden sm:inline-flex pointer-events-none items-center gap-1 rounded border bg-muted px-1.5 text-xs text-muted-foreground">
                  <span className="text-xs">Ctrl +</span>K
                </kbd>
              </Button>
            </div> */}

            {/* Request Exam Button */}
            {/* <div className="w-auto">
              <Button variant="outline" onClick={() => router.push("/req")}>
                <Plus className="h-4 w-4" />
                Request test series
              </Button>
            </div> */}
          </div>
        </CardHeader>

        <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams
              .sort((a, b) => (b.isFavourite ? 1 : 0) - (a.isFavourite ? 1 : 0))
              .map((exam: Exam) => (
                <Link key={exam.id} href={`/exams?type=${exam.id}`}>
                  <Card className="cursor-pointer hover:bg-secondary/70  transition-colors h-full">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between text-foreground/75">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <CardTitle
                            className="text-lg uppercase truncate max-w-xs"
                            title={`${exam.name}`}
                          >
                            {exam.name}
                          </CardTitle>
                        </div>
                        {/* <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Star
                                className="h-5 w-5 cursor-pointer"
                                fill={
                                  exam.isFavourite ? "currentColor" : "none"
                                }
                                onClick={(e) =>
                                  handleToggleFavorite(e, exam.id)
                                }
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              {exam.isFavourite
                                ? "Remove from favorites"
                                : "Add to favorites"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider> */}
                      </div>
                      <CardDescription>
                        {exam.subjects.length} subjects available
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
          </div>
        </CardContent>
      </Card>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle />
        <CommandInput placeholder="Search exams..." />
        <CommandList>
          <CommandEmpty>No exams found.</CommandEmpty>
          <CommandGroup heading="Available Exams">
            {exams.map((exam: Exam) => (
              <CommandItem
                key={exam.id}
                className="cursor-pointer"
                onSelect={() => handleSelectExam(exam.id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                {exam.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
