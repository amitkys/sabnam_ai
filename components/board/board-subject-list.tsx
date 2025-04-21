// src/components/education/subject-list.tsx

import type { Subject } from "@/lib/type/board";

import Link from "next/link";
import { BookOpen } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/boardStore";

export function SubjectList() {
  const { boardType, standard, standardName, data } = useBoardStore();

  const subjects =
    data.boards
      .find((b) => b.id === boardType)
      ?.standards.find((s) => s.id === standard)?.subjects || [];

  return (
    <Card>
      <CardHeader className="flex items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <CardTitle>{standardName}</CardTitle>
        </div>
        <CardDescription>Select a subject to continue</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subj: Subject) => (
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
  );
}
