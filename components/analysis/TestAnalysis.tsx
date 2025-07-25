"use client";

import { useState } from "react";
import Link from "next/link";
import { GoHome } from "react-icons/go";
import {
  FirstTimeTooltip,
  FirstTimeTooltipProvider,
} from "@/components/ui/customeToolTip";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ChartConfig } from "@/components/ui/chart";
import ExplainDrawer from "@/components/explain-drawer";

import { TestSeriesDetails } from "./types";
import { PerformanceStats } from "./PerformanceStats";
import { PerformanceSummary } from "./PerformanceSummary";
import { PerformanceChart } from "./PerformanceChart";
import { QuestionAnalysis } from "./QuestionAnalysis";

export default function MockTestAnalysis({
  testSeriesDetails,
}: {
  testSeriesDetails: TestSeriesDetails;
}) {
  return (
    <FirstTimeTooltipProvider>
      <ContentLayout title="Test Analysis">
        <Breadcrumb className="ml-5 lg:ml-3">
          <BreadcrumbList>
            <FirstTimeTooltip content="Go to Home" tooltipId="analysis">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">
                    <GoHome className="text-lg" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </FirstTimeTooltip>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Test Analysis</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content testSeriesDetails={testSeriesDetails} />
      </ContentLayout>
    </FirstTimeTooltipProvider>
  );
}

function Content({ testSeriesDetails }: { testSeriesDetails: TestSeriesDetails }) {
  const [isExplainDrawerOpen, setIsExplainDrawerOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<
    TestSeriesDetails["questions"][number] | null
  >(null);
  const [currentUserAnswer, setCurrentUserAnswer] = useState(null);

  const latestAttempt = testSeriesDetails.userAttempts[testSeriesDetails.userAttempts.length - 1];
  const totalQuestions = testSeriesDetails.questions.length;
  const answeredQuestions = latestAttempt?.answers.length || 0;
  const correctAnswers = latestAttempt?.answers.filter((a) => a.isCorrect).length || 0;
  const incorrectAnswers = answeredQuestions - correctAnswers;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const percentageCorrect = (correctAnswers / totalQuestions) * 100;
  const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

  const chartData = [
    { name: "Correct", value: correctAnswers, fill: "var(--color-correct)" },
    { name: "Incorrect", value: incorrectAnswers, fill: "var(--color-incorrect)" },
    { name: "Unanswered", value: unansweredQuestions, fill: "var(--color-unanswered)" },
  ];

  const chartConfig = {
    value: { label: "Questions" },
    correct: { label: "Correct", color: "hsl(var(--primary))" },
    incorrect: { label: "Incorrect", color: "hsl(var(--destructive))" },
    unanswered: { label: "Unanswered", color: "hsl(var(--muted-foreground))" },
  } satisfies ChartConfig;

  const handleExplainClick = (question: any, userAnswer: any) => {
    setCurrentQuestion(question);
    setCurrentUserAnswer(userAnswer);
    setIsExplainDrawerOpen(true);
  };

  const timeTaken = latestAttempt?.startedAt && latestAttempt?.completedAt
    ? Math.round((new Date(latestAttempt.completedAt).getTime() - new Date(latestAttempt.startedAt).getTime()) / (1000 * 60))
    : null;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          {testSeriesDetails.title
            .split(" ")
            .slice(2)
            .join(" ")
            .replace("series", "Test Series")}
        </h1>
        <p className="text-muted-foreground">
          Detailed analysis of your test performance
        </p>
      </div>

      <PerformanceStats
        correctAnswers={correctAnswers}
        totalMarks={testSeriesDetails.totalMarks}
        accuracy={accuracy}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
        timeTaken={timeTaken}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <PerformanceSummary
          percentageCorrect={percentageCorrect}
          chartData={chartData}
          totalQuestions={totalQuestions}
          latestAttempt={latestAttempt}
        />
        <PerformanceChart chartData={chartData} chartConfig={chartConfig} />
      </div>

      <QuestionAnalysis
        testSeriesDetails={testSeriesDetails}
        latestAttempt={latestAttempt}
        onExplainClick={handleExplainClick}
      />

      <ExplainDrawer
        correctAnswer={currentQuestion?.correctAnswer || ""}
        isOpen={isExplainDrawerOpen}
        options={currentQuestion?.options || []}
        question={currentQuestion}
        userAnswer={currentUserAnswer}
        onClose={() => setIsExplainDrawerOpen(false)}
      />
    </div>
  );
}
