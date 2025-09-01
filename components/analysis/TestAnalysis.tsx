"use client";

import { useState } from "react";
import Link from "next/link";
import { GoHome } from "react-icons/go";
import { Share2 } from "lucide-react";

import { TestSeriesDetails } from "./types";
import { PerformanceStats } from "./PerformanceStats";
import { PerformanceSummary } from "./PerformanceSummary";
import { PerformanceChart } from "./PerformanceChart";
import { QuestionAnalysis } from "./QuestionAnalysis";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExplainDrawer from "@/components/explain-drawer";
import { ScrollToTopButton } from "@/components/custom/scroll-to-top-button";

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

function Content({
  testSeriesDetails,
}: {
  testSeriesDetails: TestSeriesDetails;
}) {
  const [isExplainDrawerOpen, setIsExplainDrawerOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<
    TestSeriesDetails["questions"][number] | null
  >(null);
  const [currentUserAnswer, setCurrentUserAnswer] = useState(null);

  const latestAttempt =
    testSeriesDetails.userAttempts[testSeriesDetails.userAttempts.length - 1];
  const totalQuestions = testSeriesDetails.questions.length;
  const answeredQuestions = latestAttempt?.answers.length || 0;
  const correctAnswers =
    latestAttempt?.answers.filter((a) => a.isCorrect).length || 0;
  const incorrectAnswers = answeredQuestions - correctAnswers;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const percentageCorrect = (correctAnswers / totalQuestions) * 100;
  const accuracy =
    answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

  // Generate share URL
  const shareUrl = `sabnam.amitkys.in/analysis/${latestAttempt?.attemptId}`;

  const chartData = [
    { name: "Correct", value: correctAnswers, fill: "var(--color-correct)" },
    {
      name: "Incorrect",
      value: incorrectAnswers,
      fill: "var(--color-incorrect)",
    },
    {
      name: "Unanswered",
      value: unansweredQuestions,
      fill: "var(--color-unanswered)",
    },
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");

      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const timeTaken =
    latestAttempt?.startedAt && latestAttempt?.completedAt
      ? Math.round(
        (new Date(latestAttempt.completedAt).getTime() -
          new Date(latestAttempt.startedAt).getTime()) /
        (1000 * 60),
      )
      : null;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
      <ScrollToTopButton />
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight truncate flex-1 min-w-0">
            {testSeriesDetails.exactName}
          </h1>
          <Button
            className="flex items-center gap-2 font-semibold text-secondary-foreground"
            size="sm"
            variant={"secondary"}
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <PerformanceStats
        accuracy={accuracy}
        answeredQuestions={answeredQuestions}
        correctAnswers={correctAnswers}
        timeTaken={timeTaken}
        totalMarks={testSeriesDetails.totalMarks}
        totalQuestions={totalQuestions}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <PerformanceSummary
          chartData={chartData}
          latestAttempt={latestAttempt}
          percentageCorrect={percentageCorrect}
          totalQuestions={totalQuestions}
        />
        <PerformanceChart chartConfig={chartConfig} chartData={chartData} />
      </div>

      <QuestionAnalysis
        latestAttempt={latestAttempt}
        testSeriesDetails={testSeriesDetails}
        onExplainClick={handleExplainClick}
      />

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Test Analysis</DialogTitle>
            <DialogDescription>
              Copy the link below and share it with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              className="flex-[0.7]"
              value={shareUrl}
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              className="flex-[0.3] min-w-[80px]"
              size="sm"
              onClick={handleCopyLink}
            >
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
