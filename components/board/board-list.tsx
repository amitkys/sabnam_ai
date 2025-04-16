// src/components/education/board-list.tsx

import type { Board } from "@/lib/type/board";

import Link from "next/link";
import { School } from "lucide-react";

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
    <Card>
      <CardHeader className="flex items-center justify-center">
        <CardTitle className="text-xl lg:text-2xl">Boards</CardTitle>
        <CardDescription>Select board to explore content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board: Board) => (
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
  );
}
