"use client";

import type { FetchedTestSeriesData, TestAttemptSubmission } from "@/lib/type";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useQuizStore } from "@/lib/store/useQuizStore";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/custom/spinner";
import { CreateTestAttempt } from "@/lib/actions";
import { StartScreen } from "@/components/quiz/startScreen";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuestionCard } from "@/components/quiz/QuestionsCard";
import { QuestionNavigation } from "@/components/quiz/QuestionNavigation";
import { QuizActions } from "@/components/quiz/QuizActions";

export default function QuizInterface({
  TestSeriesData,
}: {
  TestSeriesData: FetchedTestSeriesData;
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
    startTime,
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
  const handleQuestionAction = (action: "solved" | "later" | "skipped") => {
    if (
      action === "solved" &&
      !selectedAnswers[testData?.questions[currentQuestion].id || ""]
    ) {
      toast.warning("Please select an option");

      return;
    }

    setQuestionStatus(currentQuestion, action);
    setCurrentQuestion(
      Math.min(currentQuestion + 1, (testData?.questions.length || 1) - 1),
    );
  };

  // Handle answer selection
  const handleAnswerSelect = (optionId: string, optionText: string) => {
    if (!testData) return;

    const currentQuestionData = testData.questions[currentQuestion];

    setAnswer(
      currentQuestionData.id,
      optionId,
      optionText,
      currentQuestionData.answer,
    );
  };

  // Handle test submission
  const handleSubmit = async () => {
    if (!testData || !session?.user?.id) return;

    setIsSubmitting(true);

    const submissionData: TestAttemptSubmission = {
      testSeriesId: testData.testseries.id,
      userId: session.user.id,
      startedAt: startTime,
      completedAt: new Date().toISOString(),
      answers: Object.values(selectedAnswers).map((answer) => ({
        questionId: answer.questionId,
        optionId: answer.optionId,
        isCorrect: answer.answer === answer.selectedAnswer,
      })),
    };

    try {
      const testAttemptId = await CreateTestAttempt(submissionData);

      toast.success("Test submitted successfully");

      // Clear persisted state after submission
      const storageKey = `quiz-state-${testData.testseries.id}`;

      localStorage.removeItem(storageKey);
      setIsSubmitting(false);

      await exitFullscreen();
      if (testAttemptId) {
        router.push(`/analysis/${testAttemptId}`);
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
        testName={TestSeriesData.testseries.title}
        onStart={handleStart}
      />
    );
  }

  if (!testData) return null;

  return (
    <div className="min-h-screen bg-background text-foreground mb-48 sm:mb-0 transition-colors">
      <div className="flex-grow max-w-7xl mx-auto w-full">
        <div className="border border-border rounded-lg p-4 space-y-4 h-full flex flex-col">
          <QuizHeader
            duration={testData.testseries.duration}
            isSubmitting={isSubmitting}
            onExit={handleExit}
            onSubmit={handleSubmit}
          />
          <div className="flex flex-col lg:flex-row gap-6 flex-grow">
            <div className="flex-1 overflow-auto">
              <Card className="bg-card text-card-foreground border border-border">
                <QuestionCard
                  currentNumber={currentQuestion + 1}
                  question={testData.questions[currentQuestion]}
                  selectedAnswer={
                    selectedAnswers[testData.questions[currentQuestion].id]
                      ?.selectedAnswer || ""
                  }
                  totalQuestions={testData.questions.length}
                  onAnswerSelect={handleAnswerSelect}
                />
              </Card>
            </div>
            <QuestionNavigation
              currentQuestion={currentQuestion}
              questionStatus={questionStatus}
              questions={testData.questions}
              showNumbers={showNumbers}
              toggleShowNumbers={toggleShowNumbers}
              onQuestionSelect={handleQuestionNavigation}
            />
          </div>
          <QuizActions
            onLater={() => handleQuestionAction("later")}
            onSave={() => handleQuestionAction("solved")}
            onSkip={() => handleQuestionAction("skipped")}
          />
        </div>
      </div>
    </div>
  );
}
