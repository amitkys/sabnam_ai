import { Check, Expand, Shrink, X } from "lucide-react";

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
  const { isSubmitting, exactName } = useQuizStore();
  const { enterFullscreen, exitFullscreen, isFullscreen } = useFullscreen();

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  };

  return (
    <div className="flex justify-between items-center gap-4">
      {/* <Timer initialTime={duration} /> */}
      <div className="flex-1 min-w-0 ml-2 mt-2">
        <p className="text-base font-bold truncate">{exactName}</p>
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="text-muted-foreground px-1 hover:text-foreground/90 transition-colors disabled:text-muted-foreground/50"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Shrink size={20} /> : <Expand size={20} />}
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              <p>{isFullscreen ? "Minimize" : "Maximize"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ModeToggle />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="p-1 h-8 rounded-full w-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? "wait.." : <Check size={20} strokeWidth={4.5} />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit your test?</AlertDialogTitle>
              <AlertDialogDescription>
                If this is unfinished, you can continue later from your
                dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue test</AlertDialogCancel>
              <AlertDialogAction disabled={isSubmitting} onClick={onSubmit}>
                Submit test
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="p-1.5 h-8 rounded-full w-8"
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? "wait.." : <X size={20} strokeWidth={4.5} />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit the test?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress has been saved. You can continue this test later
                from your dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue test</AlertDialogCancel>
              <AlertDialogAction disabled={isSubmitting} onClick={onExit}>
                Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
