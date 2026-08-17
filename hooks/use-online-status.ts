"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onlineManager } from "@tanstack/react-query";

export function useOnlineStatus(pingUrl: string = "/favicon.svg") {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  // Prevent stale async updates
  const checkIdRef = useRef(0);

  const checkConnection = useCallback(async () => {
    const checkId = ++checkIdRef.current;

    // If browser already knows we're offline, trust it
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      if (checkId === checkIdRef.current) {
        setIsOnline(false);
      }
      return;
    }

    if (!pingUrl) {
      if (checkId === checkIdRef.current) {
        setIsOnline(true);
      }

      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const urlWithCacheBuster = pingUrl.includes("?")
        ? `${pingUrl}&_=${Date.now()}`
        : `${pingUrl}?_=${Date.now()}`;

      const response = await fetch(urlWithCacheBuster, {
        method: "GET", // GET is more reliable than HEAD
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (checkId === checkIdRef.current) {
        setIsOnline(response.ok);
      }
    } catch {
      if (checkId === checkIdRef.current) {
        setIsOnline(false);
      }
    }
  }, [pingUrl]);

  // Browser events + polling
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const initialCheck = setTimeout(checkConnection, 100);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = pingUrl ? setInterval(checkConnection, 15000) : null;

    return () => {
      clearTimeout(initialCheck);
      if (interval) {
        clearInterval(interval);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnection]);

  useEffect(() => {
    onlineManager.setOnline(isOnline);
  }, [isOnline]);

  return isOnline;
}
