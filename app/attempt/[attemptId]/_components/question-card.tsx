"use client";

import { Check, Clock } from "lucide-react";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { cn } from "@/lib/utils";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { MarkdownRenderer } from "@/components/newMarkdownRender";

// Define types based on what we expect from the API
interface QuestionOption {
  id: string;
  text: string;
}

function formatQuestionTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Renders the active question, displaying its content, any associated images,
 * constraints (positive/negative marks), and interactive MCQs for the user to select.
 */
export function QuestionCard() {
  const params = useParams<{ attemptId: string }>();
  const { data } = useAttemptTest({ attemptId: params.attemptId });

  // Connect to store
  const activeQuestionIndex = useNewTestAttemptStore(
    (s) => s.activeQuestionIndex,
  );
  const answers = useNewTestAttemptStore((s) => s.answers);
  const setAnswer = useNewTestAttemptStore((s) => s.setAnswer);
  const preferredLang = useNewTestAttemptStore((s) => s.language) || "en";
  const questionTimes = useNewTestAttemptStore((s) => s.questionTimes);

  if (!data) return null;

  const totalQuestions = data.testPaper.questions.length;
  // Fallback if stale sessionStorage tries to access an out-of-bounds question
  const safeIndex =
    activeQuestionIndex >= totalQuestions ? 0 : activeQuestionIndex;
  const currentQuestion = data.testPaper.questions[safeIndex];

  if (!currentQuestion) return null; // Safe guard if questions array is totally empty

  const { question, positiveMarks, negativeMarks, orderIndex } =
    currentQuestion;

  // @ts-ignore: Prisma JSON types are tricky
  const currentAnswer = answers.get(question.id);
  const questionTime = questionTimes.get(question.id) || 0;

  // Helper to safely extract string data from Prisma JSON content
  const getTextByLanguage = (content: any) => {
    if (typeof content === "string") return content;
    if (!content) return "";
    // Prefer the explicitly selected language
    if (content[preferredLang]) return content[preferredLang];

    // Fallback logic for nested JSON structures where an 'en' or 'hi' field might exist
    return content.en || content.hi || JSON.stringify(content);
  };

  // Safe cast options
  // @ts-ignore: Prisma JSON types are tricky
  const options = (question.options as unknown as QuestionOption[]) || [];

  /** Directly updates the Zustand store when the user selects a radio option */
  const handleSelect = (optionId: string) => {
    // @ts-ignore: Prisma JSON types are tricky
    setAnswer(question.id, optionId);
  };

  const formattedOrder = String(orderIndex).padStart(2, "0");
  const formattedTotal = String(totalQuestions).padStart(2, "0");

  return (
    <div className="">
      <Card className="px-2.5 border-none flex-1">
        <CardHeader className="px-2 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-sm text-foreground font-mono">
                Q. {formattedOrder}/{formattedTotal}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/80 text-xs font-mono font-medium text-muted-foreground border border-border/50 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{formatQuestionTime(questionTime)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="text-emerald-600 flex items-center gap-1">
                +{positiveMarks}{" "}
                <span className="text-xs opacity-70">Marks</span>
              </span>
              <span className="w-px h-4 bg-border" />
              <span className="text-rose-600 flex items-center gap-1">
                {negativeMarks} <span className="text-xs opacity-70">Neg.</span>
              </span>
            </div>
          </div>

          <div className="">
            <div className="font-semibold leading-relaxed">
              {/* @ts-ignore: Prisma JSON types */}
              <MarkdownRenderer
                content={getTextByLanguage(question.content)}
                variant="question"
              />
            </div>
            {/* @ts-ignore: Prisma JSON types */}
            {question.imageUrl && (
              <div className="mt-6 rounded-xl overflow-hidden border bg-white p-2 inline-block">
                <img
                  /* @ts-ignore: Prisma JSON types */
                  alt="Question Diagram"
                  className="max-h-80 object-contain rounded-lg"
                  src={question.imageUrl}
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <RadioGroup
            className="grid gap-3"
            value={currentAnswer || ""}
            onValueChange={handleSelect}
          >
            {options.map((opt) => {
              const isSelected = currentAnswer === opt.id;

              return (
                <Label
                  key={opt.id}
                  className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out",
                    "hover:border-primary/50 hover:bg-accent/30",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted bg-card",
                  )}
                  htmlFor={opt.id}
                >
                  <RadioGroupItem
                    className="sr-only"
                    id={opt.id}
                    value={opt.id}
                  />

                  {/* Option Label (A, B, C...) */}
                  <div
                    className={cn(
                      "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/10 text-muted-foreground group-hover:border-primary/20 group-hover:text-primary",
                    )}
                  >
                    {opt.id}
                  </div>

                  {/* Option Text */}
                  <div className="flex-1 text-base font-medium leading-normal wrap-break-word overflow-wrap-anywhere min-w-0">
                    <MarkdownRenderer
                      content={getTextByLanguage(opt.text)}
                      variant="option"
                    />
                  </div>

                  {/* Selection Indicator */}
                  <div
                    className={cn(
                      "shrink-0 text-primary transition-opacity",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  >
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
