import { ModeToggle } from "../mode-toggle";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/lib/store/useQuizStore";

interface QuizHeaderProps {
  duration: number;
  onExit: () => void;
  onSubmit: () => void;
}

export const QuizHeader = ({ duration, onExit, onSubmit }: QuizHeaderProps) => {
  const { isSubmitting, testTitle } = useQuizStore();

  return (
    <div className="flex justify-between items-center">
      {/* <Timer initialTime={duration} /> */}
      <p
        className="ml-2 mt-2 test-base font-bold max-w-[200px] truncate"
        title={testTitle.split(" ").slice(2).join(" ")}
      >
        {testTitle.split(" ").slice(2).join(" ").toLocaleUpperCase()}
      </p>
      <div className="flex space-x-2">
        <ModeToggle />

        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={isSubmitting} variant="default">
              {isSubmitting ? "Please wait.." : "Submit"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit your test?</DialogTitle>
              <DialogDescription>
                If this is unfinished, you can continue later from your
                dashboard.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary">Continue test</Button>
              <Button disabled={isSubmitting} onClick={onSubmit}>
                Submit test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={isSubmitting} variant="destructive">
              Exit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Exit the test?</DialogTitle>
              <DialogDescription>
                Your progress has been saved. You can continue this test later
                from your dashboard.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary">Continue test</Button>
              <Button disabled={isSubmitting} onClick={onExit}>
                Exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
