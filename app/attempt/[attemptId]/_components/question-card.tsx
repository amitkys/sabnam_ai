"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/newMarkdownRender";

// Define types based on what we expect from the API
interface QuestionOption {
  id: string;
  text: string;
}

// Helper type to extract the success data type from the server action
// We use NonNullable to ensure we get the data part
// type AttemptData = NonNullable<Awaited<ReturnType<typeof getAttemptAction>>["data"]>;
// Extract the single question type from the array
// type QuestionItem = AttemptData["testPaper"]["questions"][number];

// interface QuestionCardProps {
//   data: QuestionItem;
// }

export function QuestionCard() {
  const params = useParams<{ attemptId: string }>();
  const { data } = useAttemptTest({ attemptId: params.attemptId });

  // Connect to store
  const activeQuestionIndex = useNewTestAttemptStore((s) => s.activeQuestionIndex);
  const setActiveQuestionIndex = useNewTestAttemptStore((s) => s.setActiveQuestionIndex);
  const answers = useNewTestAttemptStore((s) => s.answers);
  const setAnswer = useNewTestAttemptStore((s) => s.setAnswer);
  const toggleReview = useNewTestAttemptStore((s) => s.toggleReview);
  const isMarkedForReview = useNewTestAttemptStore((s) => s.isMarkedForReview);

  if (!data) return null;

  const currentQuestion = data.testPaper.questions[activeQuestionIndex];
  const totalQuestions = data.testPaper.questions.length;
  const { question, positiveMarks, negativeMarks, orderIndex } = currentQuestion;

  // @ts-ignore: Prisma JSON types are tricky
  const currentAnswer = answers.get(question.id);

  // Helper to get localized content (default to 'en')
  const getQuestionText = (content: any) => {
    if (typeof content === "string") return content;
    // Fallback logic for JSON content
    return content?.en || content?.hi || JSON.stringify(content);
  };

  // Safe cast options
  // @ts-ignore: Prisma JSON types are tricky
  const options = (question.options as unknown as QuestionOption[]) || [];

  const handleSelect = (optionId: string) => {
    // @ts-ignore: Prisma JSON types are tricky
    setAnswer(question.id, optionId);
  };

  return (
    <div className="">
      <Card className="px-2.5 border-none flex-1">
        <CardHeader className="px-2 md:px-6">
          <div className="flex items-center justify-between">
            <p className="text-muted">
              Q.{orderIndex}
            </p>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="text-emerald-600 flex items-center gap-1">
                +{positiveMarks} <span className="text-xs opacity-70">Marks</span>
              </span>
              <span className="w-px h-4 bg-border"></span>
              <span className="text-rose-600 flex items-center gap-1">
                {negativeMarks} <span className="text-xs opacity-70">Neg.</span>
              </span>
            </div>
          </div>

          <div className="">
            <div className="font-semibold leading-relaxed">
              {/* @ts-ignore: Prisma JSON types */}
              <MarkdownRenderer content={getQuestionText(question.content)} variant="question" />
            </div>
            {/* @ts-ignore: Prisma JSON types */}
            {question.imageUrl && (
              <div className="mt-6 rounded-xl overflow-hidden border bg-white p-2 inline-block">
                <img
                  /* @ts-ignore: Prisma JSON types */
                  src={question.imageUrl}
                  alt="Question Diagram"
                  className="max-h-80 object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <RadioGroup
            value={currentAnswer || ""}
            onValueChange={handleSelect}
            className="grid gap-3"
          >
            {options.map((opt) => {
              const isSelected = currentAnswer === opt.id;
              return (
                <Label
                  key={opt.id}
                  htmlFor={opt.id}
                  className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out",
                    "hover:border-primary/50 hover:bg-accent/30",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted bg-card"
                  )}
                >
                  <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />

                  {/* Option Label (A, B, C...) */}
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/10 text-muted-foreground group-hover:border-primary/20 group-hover:text-primary"
                  )}>
                    {opt.id}
                  </div>

                  {/* Option Text */}
                  <div className="flex-1 text-base font-medium leading-normal break-words overflow-wrap-anywhere min-w-0">
                    <MarkdownRenderer content={opt.text} variant="option" />
                  </div>

                  {/* Selection Indicator */}
                  <div className={cn(
                    "flex-shrink-0 text-primary transition-opacity",
                    isSelected ? "opacity-100" : "opacity-0"
                  )}>
                    <Check className="w-6 h-6" />
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

    </div>
  );
}
