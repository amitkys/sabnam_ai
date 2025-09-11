"use client";

import { format } from "date-fns";
import { Calendar, CheckCircle2, BarChart3 } from "lucide-react";

import { TestSeriesDetails } from "./types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface PerformanceSummaryProps {
  percentageCorrect: number;
  chartData: Array<{ name: string; value: number; fill: string }>;
  totalQuestions: number;
  latestAttempt: TestSeriesDetails["userAttempts"][number] | undefined;
}

export function PerformanceSummary({
  percentageCorrect,
  chartData,
  totalQuestions,
  latestAttempt,
}: PerformanceSummaryProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {percentageCorrect.toFixed(1)}%
            </span>
          </div>
          <Progress className="h-2" value={percentageCorrect} />
        </div>

        <Separator />

        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{item.value}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({((item.value / totalQuestions) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
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
  );
}
