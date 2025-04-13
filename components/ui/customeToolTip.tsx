"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      sideOffset={sideOffset}
      {...props}
    />
  </TooltipPrimitive.Portal>
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Context to track which tooltips have been shown
const FirstTimeTooltipContext = React.createContext<{
  shownTooltips: Record<string, boolean>;
  markTooltipAsShown: (id: string) => void;
}>({
  shownTooltips: {},
  markTooltipAsShown: () => { },
});

export const FirstTimeTooltipProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [shownTooltips, setShownTooltips] = React.useState<
    Record<string, boolean>
  >({});

  const markTooltipAsShown = (id: string) => {
    setShownTooltips((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <FirstTimeTooltipContext.Provider
      value={{ shownTooltips, markTooltipAsShown }}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </FirstTimeTooltipContext.Provider>
  );
};

interface FirstTimeTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  tooltipId: string;
  delayBeforeAutoClose?: number;
  firstTimeClassName?: string;
  alwaysShow?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

export const FirstTimeTooltip = ({
  children,
  content,
  tooltipId,
  delayBeforeAutoClose = 3000,
  firstTimeClassName = "bg-blue-500", // Custom class for first-time display
  alwaysShow = false, // For testing, force show tooltip always
  side = "top",
  sideOffset = 4,
  ...props
}: FirstTimeTooltipProps &
  Omit<
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    "content" | "side" | "sideOffset"
  >) => {
  const { shownTooltips, markTooltipAsShown } = React.useContext(
    FirstTimeTooltipContext,
  );
  const [open, setOpen] = React.useState(false);
  const [isFirstTime, setIsFirstTime] = React.useState(true);

  React.useEffect(() => {
    const hasBeenShown = shownTooltips[tooltipId];

    if (!hasBeenShown || alwaysShow) {
      // First time or forced always show
      setOpen(true);

      if (!hasBeenShown) {
        markTooltipAsShown(tooltipId);
      }

      if (!alwaysShow) {
        const timer = setTimeout(() => {
          setOpen(false);
          setIsFirstTime(false);
        }, delayBeforeAutoClose);

        return () => clearTimeout(timer);
      }
    } else {
      setIsFirstTime(false);
    }
  }, [
    tooltipId,
    delayBeforeAutoClose,
    shownTooltips,
    markTooltipAsShown,
    alwaysShow,
  ]);

  return (
    <Tooltip open={open} onOpenChange={(value) => setOpen(value)}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className={cn(isFirstTime && firstTimeClassName, props.className)}
        side={side}
        sideOffset={sideOffset}
        {...props}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

// Export the original components as well
export { Tooltip, TooltipTrigger, TooltipContent };

// Example usage
const ExampleUsage = () => {
  return (
    <FirstTimeTooltipProvider>
      <div className="flex flex-col gap-4 items-center justify-center p-8">
        <FirstTimeTooltip
          content="Click to save your work"
          tooltipId="save-button"
        >
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Save
          </button>
        </FirstTimeTooltip>

        <FirstTimeTooltip
          content="Need assistance?"
          delayBeforeAutoClose={5000}
          firstTimeClassName="bg-green-500"
          side="right"
          tooltipId="help-button"
        >
          <button className="p-2 rounded-full bg-gray-200">?</button>
        </FirstTimeTooltip>
      </div>
    </FirstTimeTooltipProvider>
  );
};
