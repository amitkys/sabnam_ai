import type { Exam } from "@/lib/type/exam";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Search, Plus } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

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
  const { data } = useExamStore();
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

  const handleRequestExam = () => {
    router.push("/req");
  };

  const handleSelectExam = (examId: string) => {
    setOpen(false);
    router.push(`/exams?type=${examId}`);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          {/* Search Button */}
          <div className="w-auto">
            <Button
              className="justify-start text-muted-foreground"
              variant="outline"
              onClick={() => setOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Search exams...</span>
              <kbd className="ml-auto hidden sm:inline-flex pointer-events-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                <span className="text-xs">ctrl +</span>K
              </kbd>
            </Button>
          </div>

          {/* Heading */}
          <div className="flex flex-col items-center text-center grow">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">
              Explore Exams
            </CardTitle>
            <CardDescription className="text-sm sm:text-base hidden lg:block">
              Select an exam to explore content
            </CardDescription>
          </div>

          {/* Request Exam Button */}
          <div className="w-auto">
            <Button onClick={handleRequestExam}>
              <Plus className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">
                Request for Exam Test
              </span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam: Exam) => (
              <Link key={exam.id} href={`/exams?type=${exam.id}`}>
                <Card className="cursor-pointer hover:bg-secondary transition-colors h-full">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2 text-foreground/75">
                      <FileText className="h-5 w-5" />
                      <CardTitle className="text-lg uppercase">
                        {exam.name}
                      </CardTitle>
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
