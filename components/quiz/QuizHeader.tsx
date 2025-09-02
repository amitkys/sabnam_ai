import {
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  ArrowLeft,
  LogOut,
  Maximize,
  Minimize,
} from "lucide-react";

import { ModeToggle } from "../mode-toggle";

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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuizStore } from "@/lib/store/useQuizStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFullscreen } from "@/hooks/use-fullscreen";

interface QuizHeaderProps {
  duration: number;
  onExit: () => void;
  onSubmit: () => void;
}

export const QuizHeader = ({ duration, onExit, onSubmit }: QuizHeaderProps) => {
  const { isSubmitting, exactName, testData, questionStatus } = useQuizStore();
  const { enterFullscreen, exitFullscreen, isFullscreen } = useFullscreen();

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  };

  const totalQuestions = testData?.testSeries?.questions.length || 0;
  const solvedQuestions = Object.values(questionStatus).filter(
    (status) => status === "solved",
  ).length;

  // Calculate completion percentage for progress visualization
  const completionPercentage =
    totalQuestions > 0
      ? Math.round((solvedQuestions / totalQuestions) * 100)
      : 0;

  // Get appropriate icon based on completion
  const getCompletionIcon = () => {
    if (completionPercentage >= 80)
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (completionPercentage >= 60)
      return <Clock className="h-5 w-5 text-yellow-500" />;

    return <AlertTriangle className="h-5 w-5 text-orange-500" />;
  };

  // Get progress bar color class
  const getProgressColorClass = () => {
    if (completionPercentage >= 80) return "bg-green-500";
    if (completionPercentage >= 60) return "bg-yellow-500";

    return "bg-orange-500";
  };

  return (
    <div className="flex justify-between items-center gap-4">
      {/* <Timer initialTime={duration} /> */}
      <div className="flex-1 min-w-0 ml-2 mt-2">
        <p className="text-base font-bold truncate">{exactName}</p>
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <ModeToggle />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="gap-2 lg:w-64" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={20} strokeWidth={2.5} />
                  <span>Submit</span>
                </span>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3">
                {getCompletionIcon()}
                Submit Test
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Test Progress</span>
                        <span className="font-bold">
                          {completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getProgressColorClass()}`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Questions Answered</span>
                        <span className="font-semibold">
                          {solvedQuestions} / {totalQuestions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Continue test
              </AlertDialogCancel>
              <AlertDialogAction
                className="flex items-center gap-2"
                disabled={isSubmitting}
                onClick={onSubmit}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit test</span>
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <DropdownMenu>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="h-9 w-9 rounded-full focus-visible:outline-none whitespace-normal"
                      disabled={isSubmitting}
                      size="icon"
                      variant="outline"
                    >
                      <MoreHorizontal size={20} strokeWidth={2.5} />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end">
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <span className="flex items-center gap-2">
                    <LogOut size={16} />
                    <span>Exit</span>
                  </span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <span className="flex items-center gap-2">
                    <Minimize size={16} />
                    <span>Exit Fullscreen</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Maximize size={16} />
                    <span>Enter Fullscreen</span>
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-destructive" />
                Exit the test?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                You can continue it later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Continue test
              </AlertDialogCancel>
              <AlertDialogAction
                className="flex items-center gap-2"
                disabled={isSubmitting}
                onClick={onExit}
              >
                <LogOut size={16} />
                Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
