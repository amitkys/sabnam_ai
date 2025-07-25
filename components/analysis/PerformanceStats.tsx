"use client";

import { Award, Target, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PerformanceStatsProps {
  correctAnswers: number;
  totalMarks: number;
  accuracy: number;
  answeredQuestions: number;
  totalQuestions: number;
  timeTaken: number | null;
}

export function PerformanceStats({
  correctAnswers,
  totalMarks,
  accuracy,
  answeredQuestions,
  totalQuestions,
  timeTaken,
}: PerformanceStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">{correctAnswers}/{totalMarks}</p>
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
  );
}
