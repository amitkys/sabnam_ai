import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AttemptSummaryProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  timeTaken: number; // in seconds
  totalDuration: number; // in minutes
}

export function AttemptSummary({
  score,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  unanswered,
  timeTaken,
  totalDuration,
}: AttemptSummaryProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const accuracy = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Score</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {accuracy}% Accuracy
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{score}</div>
          <p className="text-xs text-muted-foreground">
            out of {totalQuestions * 4} (approx)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Taken</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(timeTaken)}</div>
          <p className="text-xs text-muted-foreground">
            Total time: {totalDuration}m
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mt-2">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" /> {correctAnswers} Correct
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="h-3 w-3" /> {incorrectAnswers} Wrong
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {unanswered} Unattempted
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <Badge>Completed</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Done</div>
          <p className="text-xs text-muted-foreground">
            Review your answers below
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
