import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuizActionsProps {
  onSave: () => void;
  onLater: () => void;
  onSkip: () => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  isAnswerSelected?: boolean;
  isSaving: boolean;
  isOnline: boolean;
  activeButton: "save" | "later" | "skip" | null;
  hasPreviousQuestion: boolean;
  hasNextQuestion: boolean;
}

export const QuizActions = ({
  onSave,
  onLater,
  onSkip,
  onPrevQuestion,
  onNextQuestion,
  isAnswerSelected = false,
  isSaving = false,
  isOnline = true,
  activeButton = null,
  hasPreviousQuestion,
  hasNextQuestion,
}: QuizActionsProps) => {
  const isDisabled = !isOnline || isSaving;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-10">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Navigation - Only visible on mobile, above Save & Next */}
        <div className="flex justify-between w-full mb-3 sm:hidden">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onPrevQuestion}
                  disabled={!hasPreviousQuestion || isDisabled}
                  aria-label="Previous Question"
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Previous Question</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onNextQuestion}
                  disabled={!hasNextQuestion || isDisabled}
                  aria-label="Next Question"
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next Question</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Secondary Actions Container - Smaller on desktop */}
          <div className="flex gap-2 order-2 sm:order-1 sm:flex-[0.7]">
            {/* Skip */}
            <Button
              className="flex-1 h-10"
              disabled={isDisabled}
              variant="outline"
              onClick={onSkip}
            >
              {isSaving && activeButton === "skip" ? (
                <span className="flex items-center">
                  <Loader className="mr-2" size="small" variant="spin" />
                  Loading...
                </span>
              ) : (
                "Skip"
              )}
            </Button>

            {/* Preview Later */}
            <Button
              className="flex-1 h-10"
              disabled={isDisabled}
              variant="outline"
              onClick={onLater}
            >
              {isSaving && activeButton === "later" ? (
                <span className="flex items-center">
                  <Loader className="mr-2" size="small" variant="spin" />
                  Loading...
                </span>
              ) : (
                "Preview later"
              )}
            </Button>
          </div>

          {/* Save & Next with Navigation */}
          <div className="flex gap-2 order-1 sm:order-2 sm:flex-1">
            {/* Save & Next - Primary action */}
            <Button
              className="flex-1 h-10"
              disabled={isDisabled}
              variant="default"
              onClick={onSave}
            >
              {isSaving && activeButton === "save" ? (
                <span className="flex items-center">
                  <Loader className="mr-2" size="small" variant="spin" />
                  Loading next question...
                </span>
              ) : (
                "Save & next"
              )}
            </Button>

            {/* Desktop Navigation - Only visible on desktop, right side of Save & Next */}
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onPrevQuestion}
                    disabled={!hasPreviousQuestion || isDisabled}
                    aria-label="Previous Question"
                    className="hidden sm:flex h-10 w-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous Question</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onNextQuestion}
                    disabled={!hasNextQuestion || isDisabled}
                    aria-label="Next Question"
                    className="hidden sm:flex h-10 w-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next Question</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};