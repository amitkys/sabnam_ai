"use client";

import { useEffect, useState } from "react";
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
import { IconMobiledataOff } from "@tabler/icons-react";

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
  return (
    !isOnline ? (
      <Alert className="border-amber-500/50 bg-card">
        <AlertTitle className="flex items-center gap-2 text-amber-500">
          <IconMobiledataOff stroke={2} className="h-4 w-4" />
          <p>Sync Paused: Waiting for Connection</p>
        </AlertTitle>
        <AlertDescription>
          You can proceed with the test, but do not close the tab or browser.
        </AlertDescription>
      </Alert>
    ) : null
  )
}
