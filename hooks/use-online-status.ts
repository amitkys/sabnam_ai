import { useCallback, useEffect, useState } from "react";

export function useOnlineStatus(pingUrl = "https://httpbin.org/status/200") {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const checkConnection = useCallback(async () => {
    // If navigator says we're offline, trust it immediately
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOnline(false);

      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 5 second timeout

      const response = await fetch(pingUrl, {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setIsOnline(response.ok);
    } catch (error) {
      // Don't immediately assume offline if it's a CORS or network error
      // and navigator.onLine says we're online
      if (typeof navigator !== "undefined" && navigator.onLine) {
        // Try a different approach - create an image request to a reliable endpoint
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = resolve;
            img.onerror = reject;
            img.src = "https://www.google.com/favicon.ico?" + Date.now();
          });
          setIsOnline(true);
        } catch {
          setIsOnline(false);
        }
      } else {
        setIsOnline(false);
      }
    }
  }, [pingUrl]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleOnline = () => {
      setIsOnline(true);
      checkConnection(); // Verify the connection
    };

    const handleOffline = () => setIsOnline(false);

    // Initial check after a short delay to avoid race conditions
    const initialCheck = setTimeout(checkConnection, 100);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const interval = setInterval(checkConnection, 10000);

    return () => {
      clearTimeout(initialCheck);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection]);

  return isOnline;
}
