/*
import { useState, useCallback } from 'react';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  }, []);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen
  };
};

*/

import { useCallback } from 'react';

export function useFullscreen() {
  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        return true;
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        return true;
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      return false;
    }
  }, []);

  return { enterFullscreen, exitFullscreen };
}