"use client";

import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import { reduceHeader } from "@/utils/utils";
import { QuestionCardProps } from "./types";
import { OptionCard } from "@/components/analysis/OptionsCard";

export function QuestionCard({
  question,
  index,
  userAnswer,
  onExplainClick,
  isLastQuestion,
}: QuestionCardProps) {
  return (
    <div className="p-4 border border-border rounded-lg space-y-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
            {index + 1}
          </div>
          <h3 className="text-base font-semibold">Question</h3>
        </div>
        <div className="flex items-center gap-2">
          {userAnswer ? (
            <Badge
              variant={userAnswer.isCorrect ? "default" : "destructive"}
              className="h-6"
            >
              {userAnswer.isCorrect ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {userAnswer.isCorrect ? "Correct" : "Incorrect"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="h-6">
              <MinusCircle className="w-3 h-3 mr-1" />
              Unanswered
            </Badge>
          )}
        </div>
      </div>

      <div className="bg-muted/30 p-3 rounded-lg">
        <MarkdownRenderer
          content={reduceHeader(question.text, 1)}
          variant="question"
          className="prose-sm lg:prose-base"
        />
      </div>

      <div className="space-y-2">
        {question.options.map((option) => {
          const isCorrect = option.text === question.correctAnswer;
          const isUserSelected = userAnswer && option.text === userAnswer.userAnswer;

          return (
            <OptionCard
              key={option.id}
              option={option}
              isCorrect={isCorrect}
              isUserSelected={isUserSelected}
            />
          );
        })}
      </div>

      {!isLastQuestion && <Separator className="mt-6" />}
    </div>
  );
}
