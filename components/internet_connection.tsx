"use client";

import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AppTest2Page() {
  const isOnline = useOnlineStatus();
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      setWasOffline(true);
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
      if (wasOffline) {
        setShowOnlineAlert(true);
        const timer = setTimeout(() => {
          setShowOnlineAlert(false);
        }, 3000);

        setWasOffline(false);

        return () => clearTimeout(timer);
      }
    } else {
      setWasOffline(true);
      setShowOnlineAlert(false);
    }
  }, [isOnline, wasOffline]);

  return (
    <div className="flex items-center justify-center min-h-screen  px-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Internet Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
          {isOnline ? (
            <>
              <Wifi className="h-10 w-10 text-green-500" />
              <p className="text-xl font-medium text-green-600">
                You are online
              </p>
            </>
          ) : (
            <>
              <WifiOff className="h-10 w-10 text-red-500" />
              <p className="text-xl font-medium text-red-600">
                You are offline
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Offline Alert */}
      {!isOnline && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm">
          <Alert
            className="flex items-start gap-3 rounded-xl shadow-md"
            variant="destructive"
          >
            <WifiOff className="h-5 w-5 mt-0.5" />
            <div className="flex-1 min-w-0">
              <AlertTitle>You are offline</AlertTitle>
              <AlertDescription>
                Please check your internet connection and try again.
              </AlertDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}

      {/* Online Alert */}
      {showOnlineAlert && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm">
          <Alert
            className="flex items-start gap-3 rounded-xl shadow-md"
            variant="success"
          >
            <Wifi className="h-5 w-5 mt-0.5" />
            <div className="flex-1 min-w-0">
              <AlertTitle>Back online</AlertTitle>
              <AlertDescription>
                Your internet connection has been restored.
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}
