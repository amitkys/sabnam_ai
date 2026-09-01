import { EllipsisVertical, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { ExitConfirmationDialog } from "./exit-confirmation-dialog";
import { SubmitConfirmationDialog } from "./submit-confirmation-dialog";
import { SyncStatusBadge } from "./sync-status-badge";

import { useFullscreen } from "@/hooks/use-fullscreen";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatRemainingTime(seconds: number | null, fallbackMinutes?: number) {
  if (seconds === null) {
    if (!fallbackMinutes) return "--:--";
    const mins = fallbackMinutes;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
    }

    return `${String(m).padStart(2, "0")}:00`;
  }

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Top navigation bar during a test attempt.
 * Houses the test title, timer, and primary actions (Submit, Exit, Settings).
 */
export function Header({ attemptId }: { attemptId: string }) {
  const { setTheme } = useTheme();
  const { toggleFullscreen, isFullscreen } = useFullscreen();
  const { data } = useAttemptTest({ attemptId });
  const timeRemaining = useNewTestAttemptStore((s) => s.timeRemaining);

  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

  const handleSubmit = () => {
    setIsSubmitDialogOpen(true);
  };

  const handleExit = () => {
    setIsExitDialogOpen(true);
  };

  return (
    <>
      <ExitConfirmationDialog
        attemptId={attemptId}
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
      />
      <SubmitConfirmationDialog
        attemptId={attemptId}
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
      />
      <Card className="relative flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center justify-between gap-3 md:w-auto">
          {/* title and sync status badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <h5 className="text-lg font-semibold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {data?.testPaper.title}
            </h5>
            <SyncStatusBadge />
          </div>
          {/* small screen timer  */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold md:hidden",
              timeRemaining !== null && timeRemaining <= 60
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse font-bold"
                : timeRemaining !== null && timeRemaining <= 300
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold"
                  : "bg-muted/70 text-foreground border border-border/50",
            )}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatRemainingTime(timeRemaining, data?.testPaper.duration)}
            </span>
          </div>
        </div>
        {/* large screen timer  */}
        <div
          className={cn(
            "hidden md:absolute md:left-1/2 md:top-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2 items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-semibold tracking-wider transition-colors shadow-xs",
            timeRemaining !== null && timeRemaining <= 60
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse font-bold"
              : timeRemaining !== null && timeRemaining <= 300
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold"
                : "bg-muted/60 text-foreground border border-border/60",
          )}
        >
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          <span>
            {formatRemainingTime(timeRemaining, data?.testPaper.duration)}
          </span>
        </div>
        {/* test controler button  */}
        <div className="flex items-center w-full md:w-auto">
          <Button
            className="flex-1 md:w-auto rounded-r-none border-r-0"
            size={"sm"}
            variant="outline"
            onClick={handleExit}
          >
            Exit
          </Button>
          <Button
            className="flex-1 md:w-auto rounded-l-none"
            size={"sm"}
            onClick={handleSubmit}
          >
            Submit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button className="ml-2" size={"icon-sm"} variant="secondary">
                  <EllipsisVertical />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleFullscreen}>
                {isFullscreen ? "Exit Fullscreen" : "Full Screen"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </>
  );
}
