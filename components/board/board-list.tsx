// src/components/education/board-list.tsx

import type { Board } from "@/lib/type/board";

import Link from "next/link";
import { ArrowLeft, School } from "lucide-react";

import { SelectSeparator } from "../ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/boardStore";

export function BoardList() {
  const { data } = useBoardStore();
  const boards = data.boards;

  return (
    <Card className="bg-background">
      <CardHeader className="px-4 text-foreground/75">
        {/* Title row with back button */}
        <div className="flex items-center justify-between w-full mx-2">
          {/* Left - Back Button aligned with CardTitle */}
          <Link
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 group"
            href="/home"
          >
            <ArrowLeft
              className="h-4 md:h-5 group-hover:-translate-x-1 transition-transform"
              strokeWidth={3}
            />
          </Link>
          {/* Middle - Title only */}
          <CardTitle className="uppercase text-center flex-1">Boards</CardTitle>
          {/* Right - Empty space for balance */}
          <div className="w-6 md:w-8" />
        </div>
        {/* Description centered below title */}
        <CardDescription className="text-center mt-1">
          Select board to explore content
        </CardDescription>
        <SelectSeparator />
      </CardHeader>
      <CardContent className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board: Board) => (
            <Link key={board.id} href={`/board?type=${board.id}`}>
              <Card className="cursor-pointer  hover:bg-secondary/70 transition-colors h-full">
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
  );
}
