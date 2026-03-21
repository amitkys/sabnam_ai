"use client";

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
import { useState } from "react";
import { useCancelTest } from "@/hooks/query/mutation/use-cancel-test";

interface ExitConfirmationDialogProps {
  attemptId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExitConfirmationDialog({
  attemptId,
  open,
  onOpenChange,
}: ExitConfirmationDialogProps) {
  const [isExiting, setIsExiting] = useState(false);
  const { mutateAsync: cancelTest } = useCancelTest({ attemptId });

  const handleConfirmExit = async () => {
    setIsExiting(true);
    onOpenChange(false); // Close the dialog

    try {
      const result = await cancelTest();

      if (result?.success) {
        // Close the tab instead of redirecting
        window.close();

        // Fallback just in case window.close() is blocked by the browser
        if (typeof window !== "undefined" && !window.closed) {
          window.location.href = "/apptest";
        }
      } else {
        setIsExiting(false);
      }
    } catch (error) {
      console.error("Error during exit:", error);
      setIsExiting(false);
    }
  };

  return (
    <>
      {isExiting && <FullPageLoader text="" />}

      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit? Your progress will be saved and you
              can resume later.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmExit}>
              Exit Test
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
