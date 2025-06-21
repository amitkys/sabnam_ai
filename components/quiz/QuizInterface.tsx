"use client";

import type { FetchedTestSeriesData } from "@/lib/type";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@bprogress/next/app";
import { toast } from "sonner";
import Image from "next/image";

import { useQuizStore } from "@/lib/store/useQuizStore";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { Card } from "@/components/ui/card";
import { SaveQuestionResponse, SubmitTest } from "@/lib/actions";
import { StartScreen } from "@/components/quiz/startScreen";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuestionCard } from "@/components/quiz/QuestionsCard";
import { QuestionNavigation } from "@/components/quiz/QuestionNavigation";
import { QuizActions } from "@/components/quiz/QuizActions";
import { Loader } from "../ui/loader";

type ActionButtonType = "save" | "later" | "skip" | null;

export default function QuizInterface({
  TestSeriesData,
  attemptId,
}: {
  TestSeriesData: FetchedTestSeriesData;
  attemptId: string;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isSaving, setIsSaving] = useState(false);
  const [activeButton, setActiveButton] = useState<ActionButtonType>(null);

  const {
    testData,
    setTestData,
    currentQuestion,
    setCurrentQuestion,
    questionStatus,
    setQuestionStatus,
    selectedAnswers,
    setAnswer,
    showNumbers,
    toggleShowNumbers,
    hasStarted,
    startTest,
    isSubmitting,
    setIsSubmitting,
  } = useQuizStore();

  // Set test data
  useEffect(() => {
    if (TestSeriesData) {
      setTestData(TestSeriesData);
    }
  }, [TestSeriesData, setTestData]);

  // Handle test start
  const handleStart = async () => {
    try {
      await enterFullscreen();
      startTest();
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
      startTest();
    }
  };

  // Handle exiting the test
  const handleExit = async () => {
    await exitFullscreen();
    router.push("/");
  };

  // Handle question navigation
  const handleQuestionNavigation = (idx: number) => {
    toggleShowNumbers();
    setCurrentQuestion(idx);
  };

  // Handle question actions (save, later, skip)
  const handleQuestionAction = async (
    action: "solved" | "later" | "skipped",
  ) => {
    if (
      !testData?.testAttempt?.testSeries.questions[currentQuestion] ||
      !testData.testAttempt.id
    )
      return;

    // Set which button type was clicked
    let buttonType: ActionButtonType = null;

    if (action === "solved") buttonType = "save";
    else if (action === "later") buttonType = "later";
    else if (action === "skipped") buttonType = "skip";

    setActiveButton(buttonType);
    setIsSaving(true);

    const currentQuestionId =
      testData.testAttempt.testSeries.questions[currentQuestion].id;
    const selectedAnswer = selectedAnswers[currentQuestionId];

    // For "solved" action, verify that an answer was selected
    if (action === "solved" && !selectedAnswer) {
      toast.warning("Please select an option");
      setIsSaving(false);
      setActiveButton(null);

      return;
    }

    // Update the question status based on the button clicked
    setQuestionStatus(currentQuestionId, action);

    try {
      // Save to database via server action
      const result = await SaveQuestionResponse({
        testAttemptId: testData.testAttempt.id,
        questionId: currentQuestionId,
        optionId: selectedAnswer?.optionId || null,
        markAs: action,
        isCorrect: selectedAnswer
          ? selectedAnswer.selectedAnswer === selectedAnswer.answer
          : false,
      });

      if (!result.success) {
        toast.error("Failed to save response");
      }
    } catch (error) {
      console.error("Error saving question response:", error);
      toast.error("Failed to save response");
    } finally {
      // Move to next question if available
      if (
        currentQuestion <
        testData.testAttempt.testSeries.questions.length - 1
      ) {
        setCurrentQuestion(currentQuestion + 1);
      }

      // Reset loading state
      setIsSaving(false);
      setActiveButton(null);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (optionId: string, optionText: string) => {
    if (!testData?.testAttempt?.testSeries.questions) return;

    const currentQuestionData =
      testData.testAttempt.testSeries.questions[currentQuestion];

    setAnswer(
      currentQuestionData.id,
      optionId,
      optionText,
      currentQuestionData.answer,
    );
  };

  // Handle test submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!testData?.testAttempt?.testSeries || !session?.user?.id) return;


    try {
      await exitFullscreen();
      if (attemptId) {
        // used toast promise to show loading, success and error messages
        await toast.promise(
          async () => {
            const result = await SubmitTest({ testAttemptId: attemptId });

            if (!result.success) {
              throw new Error("Failed to submit test");
            } else {
              router.push(`/analysis/${attemptId}`);
            }
          },
          {
            loading: "Submitting test...",
            success: "Test submitted successfully",
            error: "Failed to submit test",
          },
        );
      }
    } catch (error) {
      toast.error("Failed to submit test");
    }
  };

  if (isSubmitting) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
      <Loader variant="spin" size="medium" />
      {/* <p className="text-lg font-medium text-foreground/75">Submitting test...</p> */}
      </div>
    </div>
  }

  // Start screen check
  if (!hasStarted) {
    return (
      <StartScreen
        testName={TestSeriesData.testAttempt?.testSeries.title || "Test"}
        onStart={handleStart}
      />
    );
  }

  if (!testData?.testAttempt?.testSeries) return null;

  const questions = testData.testAttempt.testSeries.questions;
  const currentQuestionData = questions[currentQuestion];
  const selectedAnswer = currentQuestionData
    ? selectedAnswers[currentQuestionData.id]?.selectedAnswer || ""
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground mb-48 sm:mb-0 transition-colors">
      <div className="flex-grow max-w-7xl mx-auto w-full">
        <div className="border border-border rounded-lg p-4 space-y-4 h-full flex flex-col">
          <QuizHeader
            duration={testData.testAttempt.testSeries.duration}
            onExit={handleExit}
            onSubmit={handleSubmit}
          />
          <div className="flex flex-col lg:flex-row gap-6 flex-grow">
            <div className="flex-1 overflow-auto">
              <Card className="bg-card text-card-foreground border border-border">
                <QuestionCard
                  currentNumber={currentQuestion + 1}
                  question={currentQuestionData}
                  selectedAnswer={selectedAnswer}
                  totalQuestions={questions.length}
                  onAnswerSelect={handleAnswerSelect}
                />
              </Card>
            </div>
            <QuestionNavigation
              currentQuestion={currentQuestion}
              questionStatus={questionStatus}
              questions={questions}
              showNumbers={showNumbers}
              toggleShowNumbers={toggleShowNumbers}
              onQuestionSelect={handleQuestionNavigation}
            />
          </div>
          <QuizActions
            activeButton={activeButton}
            isAnswerSelected={!!selectedAnswers[currentQuestionData?.id]}
            isSaving={isSaving}
            onLater={() => handleQuestionAction("later")}
            onSave={() => handleQuestionAction("solved")}
            onSkip={() => handleQuestionAction("skipped")}
          />
        </div>
      </div>
    </div>
  );
}
