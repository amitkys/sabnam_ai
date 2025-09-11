"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, List, XCircle } from "lucide-react";

import { TestSeriesDetails } from "./types";
import { QuestionCard } from "./QuestionCard";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [filter, setFilter] = useState("all");

  const counts = {
    all: testSeriesDetails.questions.length,
    correct: 0,
    incorrect: 0,
    unanswered: 0,
  };

  testSeriesDetails.questions.forEach((question) => {
    const userAnswer = latestAttempt?.answers.find(
      (a) => a.questionId === question.id,
    );

    if (!userAnswer || userAnswer.userAnswer === undefined) {
      counts.unanswered++;
    } else if (userAnswer.isCorrect) {
      counts.correct++;
    } else {
      counts.incorrect++;
    }
  });

  const filteredQuestions = testSeriesDetails.questions.filter((question) => {
    const userAnswer = latestAttempt?.answers.find(
      (a) => a.questionId === question.id,
    );

    switch (filter) {
      case "correct":
        return userAnswer?.isCorrect === true;
      case "incorrect":
        return userAnswer?.isCorrect === false;
      case "unanswered":
        return !userAnswer || userAnswer.userAnswer === undefined;
      case "all":
      default:
        return true;
    }
  });

  // Place this outside your component or inside, using useMemo
  const filterOptions = [
    {
      value: "all",
      label: "All",
      icon: <List className="h-4 w-4" />,
      count: counts.all,
    },
    {
      value: "correct",
      label: "Correct",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      count: counts.correct,
    },
    {
      value: "incorrect",
      label: "Incorrect",
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      count: counts.incorrect,
    },
    {
      value: "unanswered",
      label: "Unanswered",
      icon: <HelpCircle className="h-4 w-4 text-gray-500" />,
      count: counts.unanswered,
    },
  ];

  // Find the currently selected option to display in the trigger
  const selectedOption = filterOptions.find(
    (option) => option.value === filter,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">Question</CardTitle>
          <CardDescription>Details analysis</CardDescription>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[150px] md:w-[200px]">
            {selectedOption ? (
              <div className="flex w-full items-center gap-2">
                {selectedOption.icon}
                <span className="truncate">{selectedOption.label}</span>
              </div>
            ) : (
              <SelectValue placeholder="Filter questions" />
            )}
          </SelectTrigger>
          <SelectContent className="text-dual-muted">
            {filterOptions.map((option) => (
              <SelectItem
                key={option.value}
                className="cursor-pointer"
                value={option.value}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {option.icon}
                    <span className="w-24 text-left">{option.label}</span>
                  </div>
                  <span className=" text-muted-foreground tabular-nums">
                    {option.count}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-1.5 md:p-4 lg:p-6">
        {filteredQuestions.length > 0 ? (
          <div className="space-y-6">
            {filteredQuestions.map((question, index) => {
              const userAnswer = latestAttempt?.answers.find(
                (a) => a.questionId === question.id,
              );

              return (
                <QuestionCard
                  key={question.id}
                  index={index}
                  isLastQuestion={
                    index === testSeriesDetails.questions.length - 1
                  }
                  question={question}
                  userAnswer={userAnswer}
                  onExplainClick={onExplainClick}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center font-bold text-muted-foreground">
            No {filter !== "all" ? filter : ""} questions found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
