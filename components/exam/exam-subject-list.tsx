import type { Subject } from "@/lib/type/exam";

import Link from "next/link";
import { ArrowLeft, BookText } from "lucide-react";

import { SelectSeparator } from "../ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useExamStore } from "@/lib/store/examStore";

export function SubjectList() {
  const { examType, examName, data } = useExamStore();

  const subjects = data.exams.find((e) => e.id === examType)?.subjects || [];

  return (
    <Card>
      <CardHeader className="px-4 text-foreground/75">
        {/* Title row with back button */}
        <div className="flex items-center justify-between w-full mx-2">
          {/* Left - Back Button aligned with CardTitle */}
          <Link
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 group"
            href="/exams"
          >
            <ArrowLeft className="h-4 md:h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>

          {/* Middle - Title only */}
          <CardTitle className="uppercase text-center flex-1">
            {examName}
          </CardTitle>

          {/* Right - Empty space for balance */}
          <div className="w-6 md:w-8" />
        </div>

        {/* Description centered below title */}
        <CardDescription className="text-center mt-1">
          Select a subject to continue
        </CardDescription>
        <SelectSeparator />
      </CardHeader>

      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subj: Subject) => (
            <Link
              key={subj.id}
              href={`/exams?type=${examType}&subject=${subj.id}${subj.name === "Complete Test Series" ? "&chapter=series" : ""}`}
            >
              <Card
                className={`cursor-pointer hover:bg-secondary transition-colors h-full ${subj.name === "Complete Test Series"
                    ? "bg-primary/5 hover:bg-primary/10"
                    : ""
                  }`}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2 text-foreground/75">
                    <BookText
                      className={`h-5 w-5 text-foreground/75 ${subj.name === "Complete Test Series" ? "text-green-600" : ""}`}
                    />
                    <CardTitle
                      className={`text-lg truncate max-w-xs ${subj.name === "Complete Test Series" ? "text-green-600" : ""}`}
                    >
                      {subj.name}
                    </CardTitle>
                  </div>
                  <CardDescription
                    className={
                      subj.name === "Complete Test Series"
                        ? "text-green-600"
                        : ""
                    }
                  >
                    {subj.name === "Complete Test Series"
                      ? "Explore all tests"
                      : `${subj.chapters.length} chapters available`}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
