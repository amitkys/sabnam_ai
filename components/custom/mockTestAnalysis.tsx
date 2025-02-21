"use client";

import { ResponsivePie } from "@nivo/pie";
import { format } from "date-fns";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "katex/dist/katex.min.css"; // Import KaTeX styles

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
      userAnswer: string;
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
  const latestAttempt =
    testSeriesDetails.userAttempts[testSeriesDetails.userAttempts.length - 1];
  const totalQuestions = testSeriesDetails.questions.length;
  const answeredQuestions = latestAttempt?.answers.length || 0;
  const correctAnswers =
    latestAttempt?.answers.filter((a) => a.isCorrect).length || 0;
  const incorrectAnswers = answeredQuestions - correctAnswers;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const percentageCorrect = (correctAnswers / totalQuestions) * 100;

  const chartData = [
    { id: "Corr.", label: "Correct", value: correctAnswers },
    { id: "Incor.", label: "Incorrect", value: incorrectAnswers },
    { id: "Unans", label: "Unanswered", value: unansweredQuestions },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6 bg-background text-foreground mt-2 rounded-lg">
      <h1 className="text-3xl font-bold">
        {testSeriesDetails.title} - Analysis
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Marks:</span>
              <span className="text-2xl font-bold">
                {testSeriesDetails.totalMarks}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Your Score:</span>
              <span>
                {latestAttempt?.score || 0} / {testSeriesDetails.totalMarks}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Questions Answered:</span>
              <span>
                {answeredQuestions} / {totalQuestions}
              </span>
            </div>
            <Progress className="h-2" value={percentageCorrect} />
            <p className="text-sm text-muted-foreground text-center">
              {percentageCorrect.toFixed(1)}% Correct
            </p>
            {latestAttempt && (
              <>
                <div className="text-sm">
                  <strong>Started:</strong>{" "}
                  {format(new Date(latestAttempt.startedAt), "PPpp")}
                </div>
                {latestAttempt.completedAt && (
                  <div className="text-sm">
                    <strong>Completed:</strong>{" "}
                    {format(new Date(latestAttempt.completedAt), "PPpp")}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsivePie
                activeOuterRadiusOffset={8}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                arcLinkLabelsColor={{ from: "color" }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="hsl(var(--foreground))"
                arcLinkLabelsThickness={2}
                borderColor={{
                  from: "color",
                  modifiers: [["darker", 0.2]],
                }}
                borderWidth={1}
                colors={({ id }) => {
                  if (id === "Corr.") return "hsl(var(--primary))";
                  if (id === "Incor.") return "hsl(var(--destructive))";

                  return "hsl(var(--muted))";
                }}
                cornerRadius={3}
                data={chartData}
                innerRadius={0.5}
                legends={[
                  {
                    anchor: "bottom",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: "hsl(var(--foreground))",
                    itemDirection: "left-to-right",
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: "circle",
                  },
                ]}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                padAngle={0.7}
                theme={{
                  labels: {
                    text: {
                      fontSize: 14,
                      fill: "hsl(var(--foreground))",
                    },
                  },
                  legends: {
                    text: {
                      fontSize: 12,
                      fill: "hsl(var(--foreground))",
                    },
                  },
                  tooltip: {
                    container: {
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                      borderRadius: 4,
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.25)",
                      padding: "8px 12px",
                    },
                  },
                }}
                tooltip={({ datum }) => (
                  <div style={{ 
                    padding: '6px 10px',
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <strong>{datum.label}:</strong> {datum.value} ({((datum.value / totalQuestions) * 100).toFixed(1)}%)
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6">
              {testSeriesDetails.questions.map((question, index) => {
                const userAnswer = latestAttempt?.answers.find(
                  (a) => a.questionId === question.id,
                );

                return (
                  <div key={question.id} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">Question {index + 1}</h3>
                      {userAnswer ? (
                        <Badge
                          variant={
                            userAnswer.isCorrect ? "default" : "destructive"
                          }
                        >
                          {userAnswer.isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Unanswered</Badge>
                      )}
                    </div>
                    <div className="prose dark:prose-invert prose-strong:text-foreground dark:prose-strong:text-foreground text-foreground max-w-none">
                      <Markdown
                        rehypePlugins={[rehypeKatex]}
                        remarkPlugins={[remarkMath]}
                      >
                        {question.text}
                      </Markdown>
                    </div>
                    <ul className="space-y-1">
                      {question.options.map((option) => (
                        <li
                          key={option.id}
                          className="flex items-center space-x-2"
                        >
                          <span
                            className={`w-4 h-4 rounded-full inline-block ${
                              option.text === question.correctAnswer
                                ? "bg-primary"
                                : userAnswer &&
                                    option.text === userAnswer.userAnswer
                                  ? "bg-destructive"
                                  : "bg-muted"
                            }`}
                          />
                          <span
                            className={
                              option.text === question.correctAnswer
                                ? "font-medium"
                                : ""
                            }
                          >
                            <div className="prose dark:prose-invert prose-strong:text-foreground dark:prose-strong:text-foreground text-foreground max-w-none">
                              <Markdown
                                rehypePlugins={[rehypeKatex]}
                                remarkPlugins={[remarkMath]}
                              >
                                {option.text}
                              </Markdown>
                            </div>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}