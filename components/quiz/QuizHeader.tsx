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
import { Timer } from "./Timer";

interface QuizHeaderProps {
  duration: number;
  onExit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const QuizHeader = ({ 
  duration, 
  onExit, 
  onSubmit, 
  isSubmitting 
}: QuizHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <Timer initialTime={duration} />
      <div className="flex space-x-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isSubmitting} variant="default">
              {isSubmitting ? "Please wait.." : "Submit"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to submit?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Once submitted, you won&apos;t be able to change your
                answers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSubmit}>
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Exit</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to exit?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your progress will be lost if you exit now.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onExit}>
                Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};