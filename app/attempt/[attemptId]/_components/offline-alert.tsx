"use client";

import { useEffect, useState } from "react";
import { IconMobiledataOff } from "@tabler/icons-react";

import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Displays a blocking popup when the user loses internet connection.
 * Informs them that local saving is active and sync will resume later.
 */
export function OfflineAlert() {
  const isOnline = useOnlineStatus();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [dismissedWhileOffline, setDismissedWhileOffline] = useState(false);

  useEffect(() => {
    if (isOnline) {
      setShowOfflineAlert(false);
      setDismissedWhileOffline(false);

      return;
    }

    if (dismissedWhileOffline) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowOfflineAlert(true);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [dismissedWhileOffline, isOnline]);

  const handleOpenChange = (open: boolean) => {
    setShowOfflineAlert(open);

    if (!open && !isOnline) {
      setDismissedWhileOffline(true);
    }
  };

  return (
    <AlertDialog open={showOfflineAlert} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Poor or lost connection</AlertDialogTitle>
          <AlertDialogDescription>
            Your answers are being saved locally and will be synced once you are
            back online. You can continue with the test.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => handleOpenChange(false)}>
            Continue without Internet
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * A persistent inline banner indicating the app is currently offline
 * and answers are waiting to be synchronized to the server.
 */
export function SyncAlert() {
  const isOnline = useOnlineStatus();

  return !isOnline ? (
    <div className="w-full mb-2 animate-in fade-in slide-in-from-top-2 duration-300 flex-none">
      <Alert className="shadow-md" variant="yellow">
        <IconMobiledataOff className="h-4 w-4" stroke={2} />
        <AlertTitle>Sync Paused (Offline)</AlertTitle>
        <AlertDescription>
          You are currently offline. Answers are safely stored on this device.
          Sync will resume once you are reconnected.
        </AlertDescription>
      </Alert>
    </div>
  ) : null;
}
