"use client";

import React, { useState } from "react";
import { IResultData, IResultQuestion } from "@/hooks/get/use-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ResultQuestionListProps {
  data: IResultData;
}

export const ResultQuestionList: React.FC<ResultQuestionListProps> = ({ data }) => {
  const [filter, setFilter] = useState<"ALL" | "CORRECT" | "INCORRECT" | "SKIPPED">("ALL");

  const filteredQuestions = data.questions.filter((q) => {
    if (filter === "ALL") return true;
    if (filter === "CORRECT") return q.studentResponse && q.studentResponse.isCorrect;
    if (filter === "INCORRECT") return q.studentResponse && !q.studentResponse.isCorrect;
    if (filter === "SKIPPED") return !q.studentResponse;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          onClick={() => setFilter("ALL")}
        >
          All ({data.questions.length})
        </Button>
        <Button
          variant={filter === "CORRECT" ? "default" : "outline"}
          onClick={() => setFilter("CORRECT")}
        >
          Correct ({data.questions.filter((q) => q.studentResponse?.isCorrect).length})
        </Button>
        <Button
          variant={filter === "INCORRECT" ? "default" : "outline"}
          onClick={() => setFilter("INCORRECT")}
        >
          Incorrect ({data.questions.filter((q) => q.studentResponse && !q.studentResponse.isCorrect).length})
        </Button>
        <Button
          variant={filter === "SKIPPED" ? "default" : "outline"}
          onClick={() => setFilter("SKIPPED")}
        >
          Skipped ({data.questions.filter((q) => !q.studentResponse).length})
        </Button>
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <QuestionReviewCard key={q.id} index={idx + 1} q={q} language={data.attempt.language} />
        ))}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No questions found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};

const QuestionReviewCard = ({ index, q, language }: { index: number, q: IResultQuestion, language: string }) => {
  const contentStr = q.question.content?.[language] || q.question.content?.["en"] || "No content available";
  const solutionStr = q.question.solution?.[language] || q.question.solution?.["en"] || null;
  
  const options = Array.isArray(q.question.options) ? q.question.options : [];
  
  const isSkipped = !q.studentResponse;
  const isCorrect = q.studentResponse?.isCorrect;
  const userAnswer = q.studentResponse?.userAnswer;

  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let badgeText = "Skipped";
  
  if (!isSkipped) {
    if (isCorrect) {
      badgeVariant = "default";
      badgeText = "Correct";
    } else {
      badgeVariant = "destructive";
      badgeText = "Incorrect";
    }
  }

  return (
    <Card className={`border-l-4 ${isSkipped ? "border-l-gray-400" : isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-semibold">
          Question {q.orderIndex}
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant={badgeVariant}>{badgeText}</Badge>
          <Badge variant="outline">
            {isCorrect ? `+${q.positiveMarks}` : !isSkipped ? `-${q.negativeMarks}` : "0"} Marks
          </Badge>
          {!isSkipped && (
            <Badge variant="secondary">
              {q.studentResponse?.timeTaken || 0}s
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose dark:prose-invert max-w-none text-sm">
          {/* Using dangerouslySetInnerHTML as placeholder for markdown rendering */}
          <div dangerouslySetInnerHTML={{ __html: contentStr }} />
        </div>

        {options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
            {options.map((opt: any) => {
              const label = opt.label?.[language] || opt.label?.["en"] || opt.label;
              const val = opt.value;
              
              let bgClass = "bg-muted";
              let borderClass = "border-transparent";

              const isOptionCorrect = val === q.question.correctValue;
              const isOptionSelected = val === userAnswer;

              if (isOptionCorrect) {
                bgClass = "bg-green-100 dark:bg-green-900/30";
                borderClass = "border-green-500";
              } else if (isOptionSelected && !isOptionCorrect) {
                bgClass = "bg-red-100 dark:bg-red-900/30";
                borderClass = "border-red-500";
              }

              return (
                <div key={val} className={`p-3 border rounded-md text-sm flex gap-3 ${bgClass} ${borderClass}`}>
                  <span className="font-semibold">{val}.</span>
                  <div dangerouslySetInnerHTML={{ __html: label }} />
                </div>
              );
            })}
          </div>
        )}

        {solutionStr && (
          <div className="mt-4 p-4 bg-muted/50 rounded-md border text-sm">
            <h4 className="font-semibold mb-2">Explanation:</h4>
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: solutionStr }} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
