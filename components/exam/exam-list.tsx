// src/components/exam/exam-list.tsx

import type { Exam } from "@/lib/type/exam";

import Link from "next/link";
import { FileText } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useExamStore } from "@/lib/store/examStore";

export function ExamList() {
  const { data } = useExamStore();
  const exams = data.exams;

  return (
    <Card>
      <CardHeader className="flex items-center justify-center">
        <CardTitle className="text-xl lg:text-2xl">Explore Exams</CardTitle>
        <CardDescription>Select an exam to explore content</CardDescription>
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
  );
}
