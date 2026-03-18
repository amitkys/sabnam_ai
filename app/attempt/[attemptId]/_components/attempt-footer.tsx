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
import { DrawerStateless, DrawerStatelessContent, DrawerStatelessItem, DrawerStatelessTrigger } from "@/components/ui/dropdrawer-stateless";

/**
 * Action bar displayed at the bottom of the test page. 
 * Provides navigation (Next/Prev) and actions (Save, Mark for Review).
 */
export function AttemptFooter() {
  const params = useParams<{ attemptId: string }>();
  const { data } = useAttemptTest({ attemptId: params.attemptId });

  const activeQuestionIndex = useNewTestAttemptStore((s) => s.activeQuestionIndex);
  const setActiveQuestionIndex = useNewTestAttemptStore((s) => s.setActiveQuestionIndex);
  const toggleReview = useNewTestAttemptStore((s) => s.toggleReview);
  const isMarkedForReview = useNewTestAttemptStore((s) => s.isMarkedForReview);
  const answers = useNewTestAttemptStore((s) => s.answers);
  const markAsSynced = useNewTestAttemptStore((s) => s.markAsSynced);

  if (!data) return null;

  const currentQuestion = data.testPaper.questions[activeQuestionIndex];
  const totalQuestions = data.testPaper.questions.length;

  // Guard clause if index is out of bounds
  if (!currentQuestion) return null;

  /**
   * Saves the current answer to the server and advances to the next question.
   * Uses optimistic UI updates to prevent blocking navigation.
   */
  const handleSaveAndNext = async () => {
    // 1. Trigger Save (Optimistic)
    // The answer is already in the store (and marked pending) via the QuestionCard selection.
    // We just need to try pushing it to the server.
    const userAnswer = answers.get(currentQuestion.questionId);

    if (userAnswer) {
      // Fire and forget (almost)
      // We don't await this to block navigation. The user feels it's instant.
      saveStudentResponse(
        params.attemptId,
        currentQuestion.questionId,
        userAnswer
      ).then((result) => {
        if (result.success) {
          markAsSynced(currentQuestion.questionId);
        }
        // If error, it stays in pendingSync and the background hook picks it up.
      });
    }

    // 2. Move to next immediately
    if (activeQuestionIndex < totalQuestions - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };

  /** Move back one question, preventing out-of-bounds errors */
  const handlePrevious = () => {
    setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1));
  };

  /** Move forward one question, preventing out-of-bounds errors */
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
          <DrawerStateless>
            <DrawerStatelessTrigger asChild>
              <Button className="px-3">
                <MoreHorizontalIcon />
              </Button>
            </DrawerStatelessTrigger>
            <DrawerStatelessContent align="end">
              <DrawerStatelessItem onClick={() => toggleReview(currentQuestion.questionId)}>
                <ReviewButtonContent />
              </DrawerStatelessItem>
            </DrawerStatelessContent>
          </DrawerStateless>
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