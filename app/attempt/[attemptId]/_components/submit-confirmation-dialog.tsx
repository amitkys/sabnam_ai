"use client";

import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useSubmitTest } from "@/lib/action/mutation/use-submit-test";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function SubmitConfirmationDialog({
  attemptId,
  open,
  onOpenChange,
}: {
  attemptId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data } = useAttemptTest({ attemptId });
  const answers = useNewTestAttemptStore((s) => s.answers);
  const setTestStatus = useNewTestAttemptStore((s) => s.setTestStatus);

  const { mutate, isPending } = useSubmitTest({ attemptId });

  if (!data) return null;

  const totalQuestions = data.testPaper.questions.length;
  // Compute answered questions by checking which ones actually have a selected option
  const answeredQuestions = answers.size;
  const unansweredQuestions = totalQuestions - answeredQuestions;

  const handleConfirm = () => {
    mutate(undefined, {
      onSuccess: (res) => {
        if (res && res.success) {
          setTestStatus("submitted");
          // Close the dialog first, then refresh after the exit animation
          // to prevent the page remount from resetting dialog state (double flash).
          onOpenChange(false);
          setTimeout(() => {
            router.refresh();
          }, 300);
          // Optional: redirect to results
          // router.push(`/attempt/${attemptId}/result`);
        } else {
          // Keep dialog open or close it based on preference if it errors
        }
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
          <AlertDialogDescription>
            Once you submit, you will not be able to return to the test. Please review your attempt summary below.
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
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            isLoading={isPending}
            className="min-w-32"
          >
            Submit Test
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
