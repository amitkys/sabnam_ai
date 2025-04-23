// src/components/exam/exam-subject-list.tsx

import type { Subject } from "@/lib/type/exam";

import Link from "next/link";
import { BookText } from "lucide-react";

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
      <CardHeader className="flex items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="uppercase">{examName}</CardTitle>
        </div>
        <CardDescription>Select a subject to continue</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subj: Subject) => (
            <Link
              key={subj.id}
              href={`/exams?type=${examType}&subject=${subj.id}`}
            >
              <Card className="cursor-pointer hover:bg-secondary transition-colors h-full">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2 text-foreground/75">
                    <BookText className="h-5 w-5" />
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
  );
}
