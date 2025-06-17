// src/components/education/standard-list.tsx

import type { Standard } from "@/lib/type/board";

import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";

import { SelectSeparator } from "../ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/boardStore";

export function StandardList() {
  const { boardType, boardName, data } = useBoardStore();

  const standards =
    data.boards.find((b) => b.id === boardType)?.standards || [];

  return (
    <Card className="bg-background">
      <CardHeader className="px-4 text-foreground/75">
        {/* Title row with back button */}
        <div className="flex items-center justify-between w-full mx-2">
          {/* Left - Back Button aligned with CardTitle */}
          <Link
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 group"
            href="/board"
          >
            <ArrowLeft className="h-4 md:h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          {/* Middle - Title only */}
          <CardTitle className="uppercase text-center flex-1">
            {boardName}
          </CardTitle>
          {/* Right - Empty space for balance */}
          <div className="w-6 md:w-8" />
        </div>
        {/* Description centered below title */}
        <CardDescription className="text-center mt-1">
          Select a standard to continue
        </CardDescription>
        <SelectSeparator />
      </CardHeader>
      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standards.map((std: Standard) => (
            <Link
              key={std.id}
              href={`/board?type=${boardType}&standard=${std.id}`}
            >
              <Card className="cursor-pointer hover:bg-secondary/70 transition-colors h-full">
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
  );
}
