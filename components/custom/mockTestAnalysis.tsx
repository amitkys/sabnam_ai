"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { format } from "date-fns";
import Link from "next/link";
import { GoHome } from "react-icons/go";
import {
  Zap,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Calendar,
  Award,
  BarChart3
} from "lucide-react";

import { Separator } from "../ui/separator";
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import ExplainDrawer from "@/components/explain-drawer";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TestSeriesDetails {
  title: string;
  questions: {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
  }[];
  userAttempts: {
    attemptId: string;
    startedAt: Date;
    completedAt: Date | null;
    score: number | null;
    answers: {
      questionId: string;
      userAnswer: string | undefined;
      isCorrect: boolean;
    }[];
  }[];
  totalMarks: number;
}

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
  // State for the explain drawer
  const [isExplainDrawerOpen, setIsExplainDrawerOpen] = useState(false);
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
  const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

  const chartData = [
    {
      name: "Correct",
      value: correctAnswers,
      color: "hsl(var(--primary))",
      icon: CheckCircle2
    },
    {
      name: "Incorrect",
      value: incorrectAnswers,
      color: "hsl(var(--destructive))",
      icon: XCircle
    },
    {
      name: "Unanswered",
      value: unansweredQuestions,
      color: "hsl(var(--muted-foreground))",
      icon: MinusCircle
    },
  ];

  // Handle explain button click
  const handleExplainClick = (question: any, userAnswer: any) => {
    setCurrentQuestion(question);
    setCurrentUserAnswer(userAnswer);
    setIsExplainDrawerOpen(true);
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} questions ({((data.value / totalQuestions) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate time taken
  const timeTaken = latestAttempt?.startedAt && latestAttempt?.completedAt
    ? Math.round((new Date(latestAttempt.completedAt).getTime() - new Date(latestAttempt.startedAt).getTime()) / (1000 * 60))
    : null;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
      {/* Header Section */}
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

      {/* Stats Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{correctAnswers}/{testSeriesDetails.totalMarks}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{accuracy.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attempted</p>
                <p className="text-2xl font-bold">{answeredQuestions}/{totalQuestions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Taken</p>
                <p className="text-2xl font-bold">{timeTaken ? `${timeTaken}m` : 'N/A'}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Summary
            </CardTitle>
            <CardDescription>
              Overview of your test performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {percentageCorrect.toFixed(1)}%
                </span>
              </div>
              <Progress value={percentageCorrect} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-3">
              {chartData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: item.color }} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{item.value}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({((item.value / totalQuestions) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {latestAttempt && (
              <>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Started</p>
                      <p className="text-muted-foreground">
                        {format(new Date(latestAttempt.startedAt), "PPpp")}
                      </p>
                    </div>
                  </div>
                  {latestAttempt.completedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Completed</p>
                        <p className="text-muted-foreground">
                          {format(new Date(latestAttempt.completedAt), "PPpp")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Breakdown
            </CardTitle>
            <CardDescription>
              Visual representation of your test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Analysis */}
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
        <CardContent>
          <div className="space-y-6">
            {testSeriesDetails.questions.map((question, index) => {
              const userAnswer = latestAttempt?.answers.find(
                (a) => a.questionId === question.id,
              );

              return (
                <div
                  key={question.id}
                  className="p-4 border border-border rounded-lg space-y-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-base font-semibold">
                        Question {index + 1}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExplainClick(question, userAnswer)}
                          className="h-8"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Explain
                        </Button> */}
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
                      content={question.text}
                      variant="question"
                      className="prose-sm lg:prose-base"
                    />
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const isCorrect = option.text === question.correctAnswer;
                      const isUserSelected = userAnswer && option.text === userAnswer.userAnswer;

                      return (
                        <div
                          key={option.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isCorrect
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                            : isUserSelected
                              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                              : 'border-border bg-background'
                            }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
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
                          <div className="flex-grow">
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
                              Your Answer
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {index < testSeriesDetails.questions.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Explain Drawer */}
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