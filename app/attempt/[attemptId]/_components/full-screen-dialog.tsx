"use client";

import { useState, useEffect } from "react";
import { Maximize } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useFullscreen } from "@/hooks/use-fullscreen";

export function FullscreenSuggestDialog() {
  const [open, setOpen] = useState(false);
  const { enterFullscreen, isFullscreen } = useFullscreen();
  const hasDeclinedFullscreen = useNewTestAttemptStore(
    (state) => state.hasDeclinedFullscreen,
  );
  const setHasDeclinedFullscreen = useNewTestAttemptStore(
    (state) => state.setHasDeclinedFullscreen,
  );
  const testStatus = useNewTestAttemptStore((state) => state.testStatus);

  useEffect(() => {
    // Function to check if we are in fullscreen mode
    const checkFullscreen = () => {
      if (hasDeclinedFullscreen || testStatus === "submitted") {
        setOpen(false);

        return;
      }

      if (!isFullscreen) {
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
  }, [hasDeclinedFullscreen, isFullscreen, testStatus]);

  const handleEnterFullscreen = async () => {
    try {
      const didEnterFullscreen = await enterFullscreen();

      if (didEnterFullscreen) {
        setOpen(false);
      }
    } catch (e) {
      console.warn("Fullscreen request failed", e);
    }
  };

  if (!open) return null;

  return (
    <div className="w-full mb-2 animate-in fade-in slide-in-from-top-2 duration-300 flex-none">
      <Alert className="w-full shadow-md pr-3" variant="blue">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full">
          <div>
            <AlertTitle>Fullscreen Recommended</AlertTitle>
          </div>
          <div className="flex shrink-0 gap-2 items-center">
            <Button
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
              size="sm"
              variant="outline"
              onClick={() => {
                setHasDeclinedFullscreen(true);
                setOpen(false);
              }}
            >
              Stay in Tab
            </Button>
            <Button
              className="bg-white text-blue-900 hover:bg-white/90 font-semibold shadow-xs"
              size="sm"
              onClick={handleEnterFullscreen}
            >
              Enter Fullscreen
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}
