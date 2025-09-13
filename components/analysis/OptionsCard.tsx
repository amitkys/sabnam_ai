"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/newMarkdownRender";

interface OptionCardProps {
  option: { id: string; text: string };
  isCorrect: boolean;
  isUserSelected?: boolean;
}

export function OptionCard({ option, isCorrect, isUserSelected }: OptionCardProps) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isCorrect
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
          : isUserSelected
            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
            : 'border-border bg-background'
        }`}
    >
      <div className="shrink-0 mt-0.5">
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center ${isCorrect
              ? "bg-green-500"
              : isUserSelected
                ? "bg-red-500"
                : "bg-muted border-2 border-muted-foreground"
            }`}
        >
          {isCorrect && <CheckCircle2 className="w-2 h-2 text-white" />}
          {isUserSelected && !isCorrect && <XCircle className="w-2 h-2 text-white" />}
        </div>
      </div>
      <div className="grow">
        <MarkdownRenderer
          content={option.text}
          variant="option"
          className="prose-sm lg:prose-base"
        />
      </div>
      {isCorrect && (
        <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/20">
          Correct
        </Badge>
      )}
      {isUserSelected && !isCorrect && (
        <Badge variant="outline" className="text-xs bg-red-100 dark:bg-red-900/20">
          Yours
        </Badge>
      )}
    </div>
  );
}
