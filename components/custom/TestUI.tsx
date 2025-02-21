/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type {
  Answer,
  FetchedTestSeriesData,
  TestAttemptSubmission,
} from "@/lib/type";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useRouter } from "next/navigation";

import { useFullscreen } from "@/hooks/use-fullscreen";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateTestAttempt } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import "katex/dist/katex.min.css"; // Import KaTeX styles

const StartScreen = ({
  onStart,
  testName,
}: {
  onStart: () => void;
  testName: string;
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>{testName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Before you begin:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>The test will open in fullscreen mode</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Do not exit fullscreen during the test</li>
              <li>Have all required materials ready</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onStart}>
            Start Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Utility function to format seconds into HH:MM:SS string format
const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// Memoized Timer component to prevent unnecessary re-renders
// Handles countdown timer logic with cleanup on unmount
const Timer = memo(({ initialTime }: { initialTime: number }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(intervalId);

          return 0;
        }

        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [initialTime]);

  return (
    <div className="text-center border rounded-md py-1 px-3 dark:border-gray-700">
      timer: {formatTime(timeLeft)}
    </div>
  );
});

Timer.displayName = "Timer";

// Memoized question card component to display current question and options
// Handles user selection and answer tracking
const QuestionCard = memo(function QuestionCard(props: {
  question: any;
  currentNumber: number;
  selectedAnswer: string;
  onAnswerSelect: (optionId: string, optionText: string) => void;
}) {
  const { question, currentNumber, selectedAnswer, onAnswerSelect } = props;

  return (
    <Card className="bg-transparent border p-6 dark:border-gray-700">
      <h2 className={`text-lg mb-4 font-bold`}>
        <Markdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
          {`${currentNumber}. ${question.text}`}
        </Markdown>
      </h2>

      <RadioGroup
        className="space-y-3"
        value={selectedAnswer}
        onValueChange={(value) => {
          const option = question.options.find(
            (o: { text: string }) => o.text === value,
          );

          if (option) {
            onAnswerSelect(option.id, value);
          }
        }}
      >
        {question.options.map((option: any, idx: number) => (
          <Label
            key={option.id}
            className="w-full cursor-pointer"
            htmlFor={`option-${idx}`}
          >
            <div
              className={cn(
                "flex items-center space-x-2 rounded-lg border border-border p-4",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors duration-200",
              )}
            >
              <RadioGroupItem id={`option-${idx}`} value={option.text} />

              <span className="flex-grow">
                <Markdown
                  rehypePlugins={[rehypeKatex]}
                  remarkPlugins={[remarkMath]}
                >
                  {option.text}
                </Markdown>
              </span>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </Card>
  );
});

QuestionCard.displayName = "QuestionCard";

// Main quiz interface component
export default function QuizInterface({
  TestSeriesData,
}: {
  TestSeriesData: FetchedTestSeriesData;
}) {
  // 1. First, group all useState hooks
  const [data] = useState<FetchedTestSeriesData>(TestSeriesData);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showNumbers, setShowNumbers] = useState(false);
  const [questionStatus, setQuestionStatus] = useState<
    Record<number, "solved" | "later" | "skipped">
  >({});
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, Answer>
  >({});
  const timeLeft = data.testseries.duration;
  const [startTime] = useState<Date>(new Date());
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Add router and session hooks
  const router = useRouter();
  const { data: session, status } = useSession();

  // 3. Add fullscreen hook
  const { enterFullscreen, exitFullscreen } = useFullscreen();

  // 4. Define all useCallback hooks
  const handleStart = useCallback(async () => {
    try {
      await enterFullscreen();
      setHasStarted(true);
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
      setHasStarted(true);
    }
  }, [enterFullscreen]);

  const handleExit = useCallback(async () => {
    await exitFullscreen();
    router.push("/");
  }, [exitFullscreen, router]);

  const handleQuestionAction = useCallback(
    (action: "solved" | "later" | "skipped") => {
      if (
        action === "solved" &&
        !selectedAnswers[data.questions[currentQuestion].id]
      ) {
        toast({
          title: "No answer selected",
          description: "Select an answer, otherwise press Skip button",
          variant: "destructive",
        });

        return;
      }

      setQuestionStatus((prev) => ({
        ...prev,
        [currentQuestion]: action,
      }));

      setCurrentQuestion((prev) =>
        Math.min(prev + 1, data.questions.length - 1),
      );
    },
    [currentQuestion, data.questions, selectedAnswers],
  );

  const handleQuestionNavigation = useCallback((idx: number) => {
    setShowNumbers(false);
    setCurrentQuestion(idx);
  }, []);

  const getStatusColor = useCallback(
    (status?: "solved" | "later" | "skipped") => {
      switch (status) {
        case "solved":
          return "ring-2 ring-green-600 dark:ring-green-400  dark:bg-green-900/30";
        case "later":
          return "ring-2 ring-blue-600 dark:ring-blue-400  dark:bg-blue-900/30";
        case "skipped":
          return "ring-2 ring-red-600 dark:ring-red-400  dark:bg-red-900/30";
        default:
          return "";
      }
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const submissionData: TestAttemptSubmission = {
      testSeriesId: data.testseries.id,
      userId: session?.user?.id || "",
      startedAt: startTime.toISOString(),
      completedAt: new Date().toISOString(),
      answers: Object.values(selectedAnswers).map((answer) => ({
        questionId: answer.questionId,
        optionId: answer.optionId,
        isCorrect: answer.answer === answer.selectedAnswer,
      })),
    };

    const testAttempId = await CreateTestAttempt(submissionData);

    setIsSubmitting(false);
    await exitFullscreen();

    if (testAttempId) {
      router.push(`/analysis/${testAttempId}`);
      toast({
        title: "Test Submitted",
        description: "Test सफलतापूर्वक दर्ज कर लिया गया 🎉",
      });
    }
  }, [data.testseries.id, session?.user?.id, startTime, selectedAnswers, exitFullscreen, router]);

  const handleAnswerSelect = useCallback(
    (questionId: string, optionId: string, optionText: string) => {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: {
          questionId,
          optionId,
          answer: data.questions.find((q) => q.id === questionId)?.answer || "",
          selectedAnswer: optionText,
        },
      }));
    },
    [data.questions],
  );

  // 4. All useMemo hooks
  const formattedTime = useMemo(() => formatTime(timeLeft), [timeLeft]);

  const questionNumbersGrid = useMemo(
    () => (
      <div
        className={cn(
          "grid grid-cols-5 lg:grid-cols-5 gap-4 lg:gap-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 p-1",
          !showNumbers && "lg:grid hidden",
        )}
      >
        {data.questions.map((_, idx) => {
          const status = questionStatus[idx];
          const isCurrent = idx === currentQuestion;

          return (
            <Button
              key={idx}
              className={cn(
                "w-8 h-8 lg:w-9 lg:h-9 rounded-full kk",
                "border border-border",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                getStatusColor(status),
                isCurrent && !status && "ring-2 ring-white", // White ring only if current AND no status
              )}
              variant="outline"
              onClick={() => handleQuestionNavigation(idx)}
            >
              {idx + 1}
            </Button>
          );
        })}
      </div>
    ),
    [
      data.questions,
      currentQuestion,
      showNumbers,
      questionStatus,
      getStatusColor,
      handleQuestionNavigation,
    ],
  );

  // Loading state check
  if (status === "loading") {
    return <div>please wait</div>;
  }

  // Start screen check
  if (!hasStarted) {
    return (
      <StartScreen
        testName={TestSeriesData.testseries.title}
        onStart={handleStart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground mb-48 sm:mb-0 transition-colors">
      <div className="flex-grow max-w-7xl mx-auto w-full">
        <div className="border border-border rounded-lg p-4 space-y-4 h-full flex flex-col">
          {/* Timer and Exit */}
          <div className="flex justify-between items-center">
            <Timer initialTime={data.testseries.duration} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Exit</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to exit?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Your progress will be lost if you exit now.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleExit}>
                    Exit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 flex-grow">
            {/* Question Card */}
            <div className="flex-1 overflow-auto">
              <Card className="bg-card text-card-foreground border border-border">
                <QuestionCard
                  currentNumber={currentQuestion + 1}
                  question={data.questions[currentQuestion]}
                  selectedAnswer={
                    selectedAnswers[data.questions[currentQuestion].id]
                      ?.selectedAnswer || ""
                  }
                  onAnswerSelect={(optionId, optionText) =>
                    handleAnswerSelect(
                      data.questions[currentQuestion].id,
                      optionId,
                      optionText,
                    )
                  }
                />
              </Card>
            </div>

            {/* Question Numbers and Legend */}
            <div className="w-full lg:w-auto">
              <div className="lg:w-[280px]">
                {/* Mobile Toggle */}
                <button
                  className="w-full flex items-center justify-between lg:hidden mb-2 p-2 border border-border rounded"
                  onClick={() => setShowNumbers(!showNumbers)}
                >
                  <span>Question Numbers</span>
                  {showNumbers ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {/* Legend with icons and improved styling */}
                <div
                  className={cn(
                    "space-y-1 mb-10 p-3 rounded-lg bg-muted",
                    !showNumbers && "lg:block hidden",
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        fillRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      Solved questions
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        fillRule="evenodd"
                      />
                    </svg>
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Questions for later
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        fillRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                      Skipped questions
                    </span>
                  </div>
                </div>

                {questionNumbersGrid}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Save & Next */}
                <Button
                  className="flex-1 order-1 sm:order-3"
                  variant="secondary"
                  onClick={() => handleQuestionAction("solved")}
                >
                  Save & next
                </Button>

                {/* Preview Later */}
                <Button
                  className="flex-1 order-2 sm:order-2"
                  variant="outline"
                  onClick={() => handleQuestionAction("later")}
                >
                  Preview later
                </Button>

                {/* Skip */}
                <Button
                  className="flex-1 order-3 sm:order-1"
                  variant="outline"
                  onClick={() => handleQuestionAction("skipped")}
                >
                  Skip
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="flex-1 order-4 sm:order-4" // Order 4 on both small and larger screens
                      disabled={isSubmitting}
                      variant="default"
                    >
                      {isSubmitting ? "Please wait.." : "Submit"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to submit?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Once submitted, you won&apos;t be able to change your
                        answers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmit}>
                        Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
