"use client";

import { useState, useEffect } from "react";
import { Maximize, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";

export function FullscreenSuggestDialog() {
  const [open, setOpen] = useState(false);
  const hasDeclinedFullscreen = useNewTestAttemptStore((state) => state.hasDeclinedFullscreen);
  const setHasDeclinedFullscreen = useNewTestAttemptStore((state) => state.setHasDeclinedFullscreen);
  const testStatus = useNewTestAttemptStore((state) => state.testStatus);

  useEffect(() => {
    // Function to check if we are in fullscreen mode
    const checkFullscreen = () => {
      if (hasDeclinedFullscreen || testStatus === "submitted") {
        setOpen(false);
        return;
      }

      if (typeof document !== "undefined" && !document.fullscreenElement) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    // We delay the initial check slightly because the user might have literally
    // just triggered fullscreen from the Preflight screen, and the DOM needs a moment.
    const initialTimer = setTimeout(checkFullscreen, 1000);

    // Listen continuously for the 'esc' key or user exiting fullscreen manually
    document.addEventListener("fullscreenchange", checkFullscreen);

    return () => {
      clearTimeout(initialTimer);
      document.removeEventListener("fullscreenchange", checkFullscreen);
    };
  }, [hasDeclinedFullscreen, testStatus]);

  const enterFullscreen = async () => {
    if (typeof document !== "undefined" && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setOpen(false);
      } catch (e) {
        console.warn("Fullscreen request failed", e);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        {/* We hide the default close button using the [&>button]:hidden trick to compel user choice */}

        <DialogHeader className="flex flex-col items-center text-center gap-2 pt-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary mb-2">
            <Maximize className="w-8 h-8" />
          </div>
          <DialogTitle className="text-xl">Resume Fullscreen</DialogTitle>
          <DialogDescription className="text-sm">
            You exited fullscreen mode. For the best testing experience and to avoid distractions, we highly recommend returning to fullscreen.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mr-auto ml-auto w-full gap-2 sm:gap-0 mt-4 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              setHasDeclinedFullscreen(true);
              setOpen(false);
            }}
            className="w-full sm:w-auto"
          >
            Stay in Tab
          </Button>
          <Button
            onClick={enterFullscreen}
            className="w-full sm:w-auto"
          >
            Enter Fullscreen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
