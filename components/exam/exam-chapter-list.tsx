import type { Chapter } from "@/lib/type/exam";

import Link from "next/link";
import { ArrowLeft, BookOpen, Layers } from "lucide-react"; // Import Layers icon

import { SelectSeparator } from "../ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useExamStore } from "@/lib/store/examStore";

export function ChapterList() {
  const { examType, subject, examName, subjectName, data } = useExamStore();

  const currentExam = data.exams.find((e) => e.id === examType);
  const currentSubject = currentExam?.subjects.find((s) => s.id === subject);
  const chapters = currentSubject?.chapters || [];

  return (
    <Card className="bg-background">
      <CardHeader className="px-4 text-foreground/75">
        {/* Title row with back button */}
        <div className="flex items-center justify-between w-full mx-2">
          {/* Left - Back Button aligned with CardTitle */}
          <Link
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 group"
            href={`/exams?type=${examType}`}
          >
            <ArrowLeft
              className="h-4 md:h-5 group-hover:-translate-x-1 transition-transform"
              strokeWidth={3}
            />
          </Link>

          {/* Middle - Title only */}
          <CardTitle className="uppercase text-center flex-1">
            {subjectName}
          </CardTitle>

          {/* Right - Empty space for balance */}
          <div className="w-6 md:w-8" />
        </div>

        {/* Description centered below title */}
        <CardDescription className="text-center mt-1">
          Select a chapter to continue
        </CardDescription>
        <SelectSeparator />
      </CardHeader>

      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chap: Chapter) => {
            // Determine if this is the complete test series based on name
            const isCompleteSeries = chap.name === "Complete Test Series";

            return (
              <Link
                key={chap.id}
                // Adjust the href for the complete test series
                href={`/exams?type=${examType}&subject=${subject}&chapter=${isCompleteSeries ? "series" : chap.id}`}
              >
                <Card
                  className={`cursor-pointer hover:bg-secondary/70 transition-colors h-full ${isCompleteSeries ? "bg-primary/5 hover:bg-primary/10" : ""
                    }`}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2 text-foreground/75">
                      {/* Use a different icon for the complete test series */}
                      {isCompleteSeries ? (
                        <Layers className="h-5 w-5 text-green-600" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                      <CardTitle
                        className={`text-lg truncate max-w-xs ${isCompleteSeries ? "text-green-600" : ""}`}
                        title={`${chap.name}`}
                      >
                        {chap.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
