"use client";

import { Button } from "@/components/ui/button";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";
import { saveStudentResponse } from "@/lib/action/attempt-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBookmark,
  IconChevronDown,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { MoreHorizontalIcon } from "lucide-react";

export function AttemptFooter() {
  const params = useParams<{ attemptId: string }>();
  const { data } = useAttemptTest({ attemptId: params.attemptId });

  const activeQuestionIndex = useNewTestAttemptStore((s) => s.activeQuestionIndex);
  const setActiveQuestionIndex = useNewTestAttemptStore((s) => s.setActiveQuestionIndex);
  const toggleReview = useNewTestAttemptStore((s) => s.toggleReview);
  const isMarkedForReview = useNewTestAttemptStore((s) => s.isMarkedForReview);
  const answers = useNewTestAttemptStore((s) => s.answers);

  if (!data) return null;

  const currentQuestion = data.testPaper.questions[activeQuestionIndex];
  const totalQuestions = data.testPaper.questions.length;

  // Guard clause if index is out of bounds
  if (!currentQuestion) return null;

  const handleSaveAndNext = async () => {
    const userAnswer = answers.get(currentQuestion.questionId);

    if (userAnswer) {
      const result = await saveStudentResponse(
        params.attemptId,
        currentQuestion.questionId,
        userAnswer
      );

      if (result.error) {
        console.error(result.error);
        alert("Failed to save answer: " + result.error);
        return;
      }
    }

    // Move to next if not last
    if (activeQuestionIndex < totalQuestions - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1));
  };

  const handleNext = () => {
    setActiveQuestionIndex(Math.min(totalQuestions - 1, activeQuestionIndex + 1));
  };

  const isReview = isMarkedForReview(currentQuestion.questionId);

  const ReviewButtonContent = () => (
    <div className="flex items-center gap-2">
      <IconBookmark size={16} className={isReview ? "fill-current" : ""} />
      <span>{isReview ? "Unmark Review" : "Mark for Review"}</span>
    </div>
  );

  return (
    <div className="w-full bg-background border-t p-4 md:px-8 lg:px-24">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 md:hidden w-full">
        {/* Row 1: Save & Next with Dropdown */}
        <ButtonGroup className="w-full">
          <Button onClick={handleSaveAndNext} className="flex-1">
            <IconDeviceFloppy size={18} className="mr-2" />
            Save & Next
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="px-3">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleReview(currentQuestion.questionId)}>
                <ReviewButtonContent />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>

        {/* Row 2: Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={activeQuestionIndex === 0}
            className="w-full"
          >
            <IconArrowLeft size={18} className="mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={activeQuestionIndex === totalQuestions - 1}
            className="w-full"
          >
            Next
            <IconArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-center gap-12 w-full">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={activeQuestionIndex === 0}
        >
          <IconArrowLeft size={18} className="mr-2" />
          Previous
        </Button>

        {/* Center Group */}
        <ButtonGroup>
          <Button onClick={handleSaveAndNext} className="px-8">
            <IconDeviceFloppy size={18} className="mr-2" />
            Save & Next
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => toggleReview(currentQuestion.questionId)}>
                <ReviewButtonContent />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={activeQuestionIndex === totalQuestions - 1}
        >
          Next
          <IconArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
