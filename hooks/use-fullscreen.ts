import { useCallback, useEffect, useState } from "react";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update fullscreen state based on document.fullscreenElement
  const updateFullscreenState = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    // Set initial state
    updateFullscreenState();

    // Add event listeners for fullscreen changes
    const events = [
      "fullscreenchange",
      "webkitfullscreenchange", // Safari
      "mozfullscreenchange", // Firefox
      "MSFullscreenChange", // IE/Edge
    ];

    events.forEach((event) => {
      document.addEventListener(event, updateFullscreenState);
    });

    // Cleanup event listeners
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateFullscreenState);
      });
    };
  }, [updateFullscreenState]);

  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();

        return true;
      }
      // Fallback for Safari
      else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();

        return true;
      }
      // Fallback for Firefox
      else if ((document.documentElement as any).mozRequestFullScreen) {
        await (document.documentElement as any).mozRequestFullScreen();

        return true;
      }
      // Fallback for IE/Edge
      else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);

      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();

        return true;
      }
      // Fallback for Safari
      else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();

        return true;
      }
      // Fallback for Firefox
      else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();

        return true;
      }
      // Fallback for IE/Edge
      else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);

      return false;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      return await exitFullscreen();
    } else {
      return await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isFullscreen,
  };
}
