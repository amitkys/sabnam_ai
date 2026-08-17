"use client";

import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useSubmitTest } from "@/hooks/query/mutation/use-submit-test";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { flushAttemptAnswers } from "@/lib/attempt-client-sync";

export function SubmitConfirmationDialog({
  attemptId,
  open,
  onOpenChange,
}: {
  attemptId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data } = useAttemptTest({ attemptId });
  const answers = useNewTestAttemptStore((s) => s.answers);
  const setTestStatus = useNewTestAttemptStore((s) => s.setTestStatus);

  const { mutate, isPending, isSuccess, isError } = useSubmitTest({
    attemptId,
    beforeSubmit: () => flushAttemptAnswers(attemptId),
    onSubmitted: () => {
      setTestStatus("submitted");
      onOpenChange(false);
    },
  });

  if (!data) return null;


  const totalQuestions = data.testPaper.questions.length;
  // Compute answered questions by checking which ones actually have a selected option
  const answeredQuestions = answers.size;
  const unansweredQuestions = totalQuestions - answeredQuestions;

  const handleConfirm = () => {
    mutate();
  };

  if (isSuccess && !isError) {
    return <FullPageLoader text="Redirecting to result page..." />
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
          <AlertDialogDescription>
            Once you submit, you will not be able to return to the test. Please
            review your attempt summary below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-md text-foreground">
            <span className="font-medium">Total Questions</span>
            <span className="text-lg font-bold">{totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md">
            <span className="font-medium">Questions Answered</span>
            <span className="text-lg font-bold">{answeredQuestions}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md">
            <span className="font-medium">Unanswered Questions</span>
            <span className="text-lg font-bold">{unansweredQuestions}</span>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            disabled={isPending}
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="min-w-32"
            disabled={isPending}
            isLoading={isPending}
            onClick={handleConfirm}
          >
            Submit Test
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
