"use client";

import type { TestAttemptQuestionFetched } from "@/lib/type";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@bprogress/next/app";
import { toast } from "sonner";
import { CheckCircle2, Maximize, X } from "lucide-react";

import { Loader } from "../ui/loader";
import { Button } from "../ui/button";

import { useQuizStore } from "@/lib/store/useQuizStore";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveQuestionResponse, SubmitTest } from "@/lib/actions";
import { StartScreen } from "@/components/quiz/startScreen";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuestionCard } from "@/components/quiz/QuestionsCard";
import { QuestionNavigation } from "@/components/quiz/QuestionNavigation";
import { QuizActions } from "@/components/quiz/QuizActions";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { OfflineDisplay } from "@/components/quiz/OfflineDisplay";
import { useIsMobile } from "@/hooks/use-mobile";

type ActionButtonType = "save" | "later" | "skip" | null;

export default function QuizInterface({
  TestSeriesData,
  attemptId,
}: {
  TestSeriesData: TestAttemptQuestionFetched;
  attemptId: string;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { enterFullscreen, exitFullscreen, isFullscreen } = useFullscreen();
  const [isSaving, setIsSaving] = useState(false);
  const [activeButton, setActiveButton] = useState<ActionButtonType>(null);
  const [showFullscreenAlert, setShowFullscreenAlert] = useState(true);
  const isOnline = useOnlineStatus();
  const isMobile = useIsMobile();

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
    startTime,
    isSubmitting,
    setIsSubmitting,
    selectedLanguage,
    testTitle,
    exactName,
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
      if (!isFullscreen) {
        await enterFullscreen();
      }
      startTest(attemptId); // Pass attemptId to track current attempt
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
      startTest(attemptId); // Pass attemptId even if fullscreen fails
    }
  };

  // Handle exiting the test
  const handleExit = async () => {
    if (isFullscreen) {
      await exitFullscreen();
    }
    window.location.href = "/home";
  };

  // Handle question navigation
  const handleQuestionNavigation = (idx: number) => {
    setCurrentQuestion(idx);
    if (isMobile && showNumbers) {
      toggleShowNumbers();
    }
  };

  // Handle question actions (save, later, skip)
  const handleQuestionAction = async (
    action: "solved" | "later" | "skipped",
  ) => {
    if (!testData?.testSeries?.questions[currentQuestion] || !testData.id)
      return;

    // Set which button type was clicked
    let buttonType: ActionButtonType = null;

    if (action === "solved") buttonType = "save";
    else if (action === "later") buttonType = "later";
    else if (action === "skipped") buttonType = "skip";

    setActiveButton(buttonType);
    setIsSaving(true);

    const currentQuestionId = testData.testSeries.questions[currentQuestion].id;
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
        testAttemptId: testData.id,
        questionId: currentQuestionId,
        selectedOptionIndex: selectedAnswer?.selectedOptionIndex ?? null,
        markAs: action,
      });

      if (!result.success) {
        toast.error("Failed to save response");
      }
    } catch (error) {
      console.error("Error saving question response:", error);
      toast.error("Failed to save response");
    } finally {
      // Move to next question if available
      if (currentQuestion < testData.testSeries.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }

      // Reset loading state
      setIsSaving(false);
      setActiveButton(null);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (optionIndex: number) => {
    if (!testData?.testSeries?.questions) return;

    const currentQuestionData = testData.testSeries.questions[currentQuestion];

    if (currentQuestionData && currentQuestionData.options[optionIndex]) {
      setAnswer(
        currentQuestionData.id,
        optionIndex,
        currentQuestionData.options[optionIndex],
      );
    }
  };

  // Handle test submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!testData?.testSeries || !session?.user?.id) return;

    try {
      if (isFullscreen) {
        await exitFullscreen();
      }
      if (attemptId) {
        // used toast promise to show loading, success and error messages
        await toast.promise(
          async () => {
            const result = await SubmitTest({
              testAttemptId: attemptId,
              totalMarks: testData.testSeries.questions.length,
              createdAt: startTime,
            });

            if (!result.success) {
              throw new Error("Failed to submit test");
            } else {
              window.location.href = `/analysis/${attemptId}`;
            }
          },
          {
            error: "Failed to submit test",
          },
        );
      }
    } catch (error) {
      toast.error("Failed to submit test");
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-2xl shadow-lg text-dual-muted">
          <CardHeader className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Test Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-3">
            <Loader size="medium" variant="spin" />
            <p className="text-sm ">Calculating your result, please wait...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Start screen check - use multilingual title
  if (!hasStarted) {
    return (
      <StartScreen
        attemptId={testData?.id}
        availableLanguage={testData?.testSeries.availableLanguage}
        onStart={handleStart}
      />
    );
  }

  if (!testData?.testSeries) return null;

  const questions = testData.testSeries.questions;
  const currentQuestionData = questions[currentQuestion];

  // Get the selected answer data for the current question
  const selectedAnswerData = currentQuestionData
    ? selectedAnswers[currentQuestionData.id]
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground mb-48 sm:mb-0 transition-colors no-scrollbar">
      <div className="flex-grow max-w-7xl mx-auto w-full">
        <div className="border border-border rounded-lg p-4 space-y-4 h-full flex flex-col">
          {!isFullscreen && showFullscreenAlert && (
            <Alert
              className="flex flex-col sm:flex-row sm:items-center gap-3"
              variant="info"
            >
              {/* Left side: title + description */}
              <div className="flex-1 min-w-0">
                <AlertTitle>Better Experience Recommended!</AlertTitle>
                {/* <AlertDescription>
                  Switch to fullscreen mode for a better viewing experience
                </AlertDescription> */}
              </div>

              {/* Right side: actions */}
              <div className="flex gap-2 sm:flex-shrink-0">
                <Button
                  className="flex-1 sm:flex-none"
                  size="sm"
                  onClick={enterFullscreen}
                >
                  <Maximize className="h-4 w-4 mr-1" />
                  Enter Fullscreen
                </Button>
                <Button
                  className="flex-1 sm:flex-none"
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowFullscreenAlert(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          )}
          <QuizHeader
            duration={testData.testSeries.duration}
            onExit={handleExit}
            onSubmit={handleSubmit}
          />
          <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <Card className="bg-card text-card-foreground border border-border flex-1 flex flex-col min-h-0">
                <QuestionCard
                  currentNumber={currentQuestion + 1}
                  question={currentQuestionData}
                  selectedLanguage={selectedLanguage}
                  selectedOptionIndex={selectedAnswerData?.selectedOptionIndex}
                  totalQuestions={questions.length}
                  onAnswerSelect={handleAnswerSelect}
                />
              </Card>
            </div>
            <QuestionNavigation
              currentQuestion={currentQuestion}
              questionStatus={questionStatus}
              questions={questions}
              selectedLanguage={selectedLanguage}
              showNumbers={showNumbers}
              toggleShowNumbers={toggleShowNumbers}
              onQuestionSelect={handleQuestionNavigation}
            />
          </div>
          <QuizActions
            activeButton={activeButton}
            hasNextQuestion={currentQuestion < questions.length - 1}
            hasPreviousQuestion={currentQuestion > 0}
            isOnline={isOnline}
            isSaving={isSaving}
            onLater={() => handleQuestionAction("later")}
            onNextQuestion={() => handleQuestionNavigation(currentQuestion + 1)}
            onPrevQuestion={() => handleQuestionNavigation(currentQuestion - 1)}
            onSave={() => handleQuestionAction("solved")}
            onSkip={() => handleQuestionAction("skipped")}
          />
        </div>
      </div>
      {!isOnline && <OfflineDisplay />}
    </div>
  );
}
