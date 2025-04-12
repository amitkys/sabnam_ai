"use client";

import type { FetchedTestSeriesData } from "@/lib/type";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useQuizStore } from "@/lib/store/useQuizStore";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/custom/spinner";
import { SaveQuestionResponse } from "@/lib/actions";
import { StartScreen } from "@/components/quiz/startScreen";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuestionCard } from "@/components/quiz/QuestionsCard";
import { QuestionNavigation } from "@/components/quiz/QuestionNavigation";
import { QuizActions } from "@/components/quiz/QuizActions";

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

    const currentQuestionId =
      testData.testAttempt.testSeries.questions[currentQuestion].id;
    const selectedAnswer = selectedAnswers[currentQuestionId];

    // For "solved" action, verify that an answer was selected
    if (action === "solved" && !selectedAnswer) {
      toast.warning("Please select an option");

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
    }

    // Move to next question if available
    if (
      currentQuestion <
      testData.testAttempt.testSeries.questions.length - 1
    ) {
      setCurrentQuestion(currentQuestion + 1);
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
    if (!testData?.testAttempt?.testSeries || !session?.user?.id) return;

    setIsSubmitting(true);

    // const submissionData: TestAttemptSubmission = {
    //   testSeriesId: testData.testAttempt.testSeries.id,
    //   userId: session.user.id,
    //   startedAt: startTime,
    //   completedAt: new Date().toISOString(),
    //   answers: Object.values(selectedAnswers).map((answer) => ({
    //     questionId: answer.questionId,
    //     optionId: answer.optionId,
    //     isCorrect: answer.answer === answer.selectedAnswer,
    //   })),
    // };

    try {
      // const testAttemptId = await CreateTestAttempt(submissionData);

      toast.success("Test submitted successfully");

      setIsSubmitting(false);

      await exitFullscreen();
      if (attemptId) {
        router.push(`/analysis/${attemptId}`);
      }
    } catch (error) {
      toast.error("Failed to submit test");
      setIsSubmitting(false);
    }
  };

  // Loading state check
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col space-y-2">
        <Spinner size="xl" variant="primary" />
        <p>Fetching Test..</p>
      </div>
    );
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
            isSubmitting={isSubmitting}
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
            isAnswerSelected={!!selectedAnswers[currentQuestionData?.id]}
            onLater={() => handleQuestionAction("later")}
            onSave={() => handleQuestionAction("solved")}
            onSkip={() => handleQuestionAction("skipped")}
          />
        </div>
      </div>
    </div>
  );
}
