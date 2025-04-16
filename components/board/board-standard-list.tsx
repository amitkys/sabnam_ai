// src/components/education/standard-list.tsx

import type { Standard } from "@/lib/type/board";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

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
    <Card>
      <CardHeader className="flex items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="uppercase">{boardName}</CardTitle>
        </div>
        <CardDescription>Select a standard to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standards.map((std: Standard) => (
            <Link
              key={std.id}
              href={`/board?type=${boardType}&standard=${std.id}`}
            >
              <Card className="cursor-pointer hover:bg-secondary transition-colors h-full">
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
