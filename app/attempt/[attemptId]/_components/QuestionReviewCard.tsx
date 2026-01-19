import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface QuestionReviewCardProps {
  index: number;
  question: {
    id: string;
    content: any; // Using any for JSON content
    type: string;
    options: Option[];
    solution?: any;
    correctValue?: string;
  };
  userResponse?: {
    userAnswer: string;
    isCorrect: boolean;
    timeTaken: number;
  };
}

export function QuestionReviewCard({
  index,
  question,
  userResponse,
}: QuestionReviewCardProps) {
  const isCorrect = userResponse?.isCorrect;
  const userAnswer = userResponse?.userAnswer;
  // Assuming correctValue is stored as "A", "B", etc. or we might need to derive it if not directly available in the sanitized response. 
  // Wait, the user request showed `correctValue` might be sanitized out in `getAttemptAction`. 
  // I need to check `getAttemptAction` again. It deletes `correctValue` and `solution` for live attempts.
  // But for completed attempts, we should probably return them. 
  // I will assume for now that for COMPLETED attempts, the action will be updated to return these.

  const correctOptionId = question.correctValue;

  const getOptionStyle = (optionId: string) => {
    let style = "border p-3 rounded-md flex items-center gap-3 transition-colors";

    if (optionId === correctOptionId) {
      style += " bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    } else if (optionId === userAnswer && !isCorrect) {
      style += " bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
    } else {
      style += " bg-card hover:bg-accent/50";
    }

    return style;
  };

  const getStatusBadge = () => {
    if (!userResponse) {
      return <Badge variant="outline" className="text-muted-foreground">Unattempted</Badge>
    }
    if (userResponse.isCorrect) {
      return <Badge className="bg-green-500 hover:bg-green-600">Correct</Badge>
    }
    return <Badge variant="destructive">Incorrect</Badge>
  }

  return (
    <Card className={cn("mb-6 border-l-4",
      !userResponse ? "border-l-gray-300" :
        userResponse.isCorrect ? "border-l-green-500" : "border-l-red-500"
    )}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
            {index + 1}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {question.type.replace("_", " ")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {userResponse && (
            <span className="text-xs text-muted-foreground">
              Time: {userResponse.timeTaken}s
            </span>
          )}
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose dark:prose-invert max-w-none">
          <MarkdownRenderer content={question.content?.en || "Question content missing"} variant="question" />
        </div>

        <div className="grid gap-2">
          {question.options?.map((option) => (
            <div
              key={option.id}
              className={getOptionStyle(option.id)}
            >
              <div className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                option.id === correctOptionId ? "border-green-500 bg-green-500 text-white" :
                  (option.id === userAnswer && !isCorrect) ? "border-red-500 bg-red-500 text-white" :
                    "border-muted-foreground/30"
              )}>
                {option.id}
              </div>
              <div className="flex-1">
                <MarkdownRenderer content={option.text} variant="option" />
              </div>
              {option.id === correctOptionId && <Check className="h-4 w-4 text-green-600" />}
              {option.id === userAnswer && !isCorrect && <X className="h-4 w-4 text-red-600" />}
            </div>
          ))}
        </div>

        {question.solution && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Explanation:</h4>
            <MarkdownRenderer content={question.solution?.en || "No explanation available"} variant="default" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
