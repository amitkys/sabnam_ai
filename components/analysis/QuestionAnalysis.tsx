"use client";

import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TestSeriesDetails } from "./types";
import { QuestionCard } from "./QuestionCard";

interface QuestionAnalysisProps {
  testSeriesDetails: TestSeriesDetails;
  latestAttempt: TestSeriesDetails["userAttempts"][number] | undefined;
  onExplainClick: (question: any, userAnswer: any) => void;
}

export function QuestionAnalysis({
  testSeriesDetails,
  latestAttempt,
  onExplainClick,
}: QuestionAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Question-wise Analysis
        </CardTitle>
        <CardDescription>
          Detailed breakdown of each question and your responses
        </CardDescription>
      </CardHeader>
      <CardContent className="p-1.5 md:p-4 lg:p-6">
        <div className="space-y-6">
          {testSeriesDetails.questions.map((question, index) => {
            const userAnswer = latestAttempt?.answers.find(
              (a) => a.questionId === question.id,
            );

            return (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                userAnswer={userAnswer}
                onExplainClick={onExplainClick}
                isLastQuestion={index === testSeriesDetails.questions.length - 1}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
