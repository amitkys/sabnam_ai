import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DrawerStateless,
  DrawerStatelessContent,
  DrawerStatelessItem,
  DrawerStatelessSub,
  DrawerStatelessSubContent,
  DrawerStatelessSubTrigger,
  DrawerStatelessTrigger,
} from "@/components/ui/dropdrawer-stateless";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { EllipsisVertical } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ExitConfirmationDialog } from "./exit-confirmation-dialog";
import { SubmitConfirmationDialog } from "./submit-confirmation-dialog";

/**
 * Top navigation bar during a test attempt.
 * Houses the test title, timer, and primary actions (Submit, Exit, Settings).
 */
export function Header({ attemptId }: { attemptId: string }) {
  const { setTheme } = useTheme();
  const { toggleFullscreen, isFullscreen } = useFullscreen();
  const { data } = useAttemptTest({ attemptId });

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
        <div className="flex w-full items-center justify-between md:w-auto">
          {/* title  */}
          <h5 className="text-h5 font-semibold">{data?.testPaper.title}</h5>
          {/* small screen timer  */}
          <p className="text-muted md:hidden">{data?.testPaper.duration} min</p>
        </div>
        {/* lare screen timer  */}
        <p className="hidden text-muted-foreground md:absolute md:left-1/2 md:top-1/2 md:block md:-translate-x-1/2 md:-translate-y-1/2">
          {data?.testPaper.duration} min
        </p>
        {/* test controler button  */}
        <div className="flex items-center w-full md:w-auto">
          <Button
            size={"sm"}
            variant="outline"
            className="flex-1 md:w-auto rounded-r-none border-r-0"
            onClick={handleExit}
          >
            Exit
          </Button>
          <Button
            size={"sm"}
            className="flex-1 md:w-auto rounded-l-none"
            onClick={handleSubmit}
          >
            Submit
          </Button>
          <DrawerStateless>
            <DrawerStatelessTrigger asChild>
              <Button className="ml-2" variant="secondary" size={"icon-sm"}>
                <EllipsisVertical />
              </Button>
            </DrawerStatelessTrigger>
            <DrawerStatelessContent>
              <DrawerStatelessItem onClick={toggleFullscreen}>
                {isFullscreen ? "Exit Fullscreen" : "Full Screen"}
              </DrawerStatelessItem>
              <DrawerStatelessSub>
                <DrawerStatelessSubTrigger>
                  Appearance
                </DrawerStatelessSubTrigger>
                <DrawerStatelessSubContent>
                  <DrawerStatelessItem onClick={() => setTheme("light")}>
                    Light
                  </DrawerStatelessItem>
                  <DrawerStatelessItem onClick={() => setTheme("dark")}>
                    Dark
                  </DrawerStatelessItem>
                </DrawerStatelessSubContent>
              </DrawerStatelessSub>
            </DrawerStatelessContent>
          </DrawerStateless>
        </div>
      </Card>
    </>
  );
}