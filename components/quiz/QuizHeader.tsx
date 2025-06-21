import { ModeToggle } from "../mode-toggle";

import { Timer } from "./Timer";

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
import { useQuizStore } from "@/lib/store/useQuizStore"
interface QuizHeaderProps {
  duration: number;
  onExit: () => void;
  onSubmit: () => void;
}

export const QuizHeader = ({
  duration,
  onExit,
  onSubmit,
}: QuizHeaderProps) => {
  const { isSubmitting } = useQuizStore();
  return (
    <div className="flex justify-end items-center">
      {/* <Timer initialTime={duration} /> */}
      <div className="flex space-x-2">
        <ModeToggle />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isSubmitting} variant="default">
              {isSubmitting ? "Please wait.." : "Submit"}
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
              <AlertDialogAction onClick={onSubmit} disabled={isSubmitting}>
                Submit test
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={isSubmitting} variant="destructive">
            Exit
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
            <AlertDialogAction onClick={onExit} disabled={isSubmitting}>
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </div >
  );
};
