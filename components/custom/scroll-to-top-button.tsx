"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const sidebar = useStore(useSidebar, (x) => x);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const shouldBeVisible = window.pageYOffset > 300;

      if (shouldBeVisible && !isVisible) {
        // Becoming visible
        setIsVisible(true);
        setIsExpanded(true);
      } else if (!shouldBeVisible && isVisible) {
        // Becoming hidden
        setIsVisible(false);
        setIsExpanded(false); // Reset expanded state
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [isVisible]);

  useEffect(() => {
    if (sidebar) {
      const { getOpenState } = sidebar;
      const isLargeScreen = window.innerWidth >= 1024;

      if (isLargeScreen) {
        setSidebarWidth(getOpenState() ? 288 : 90);
      } else {
        setSidebarWidth(0);
      }
    }
  }, [sidebar, sidebar?.getOpenState()]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isExpanded) {
      timeoutId = setTimeout(() => {
        setIsExpanded(false);
      }, 3000); // 2 seconds
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isExpanded]);

  const buttonStyle = {
    transition: "all 0.3s ease-in-out",
    left: `calc(50% + ${sidebarWidth / 2}px)`,
  };

  return (
    <div className="fixed bottom-4 -translate-x-1/2 z-50" style={buttonStyle}>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              className={cn(
                "rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden",
                isVisible ? "opacity-75" : "opacity-0",
                isExpanded ? "w-auto px-4" : "w-10 h-10 px-0",
              )}
              variant="outline"
              onClick={scrollToTop}
            >
              <ArrowUp className="h-4 w-4 flex-shrink-0" strokeWidth={4} />
              {isExpanded && (
                <span
                  className={cn(
                    "font-semibold whitespace-nowrap transition-all duration-300 overflow-hidden",
                    isExpanded
                      ? "opacity-100 ml-0.5 w-auto"
                      : "opacity-0 ml-0 w-0",
                  )}
                >
                  Scroll to top
                </span>
              )}
            </Button>
          </TooltipTrigger>
          {!isExpanded && (
            <TooltipContent>
              <p>Scroll to top</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
