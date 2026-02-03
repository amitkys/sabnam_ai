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

export function OfflineAlert() {
  const isOnline = useOnlineStatus();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
    } else {
      setShowOfflineAlert(false);
    }
  }, [isOnline]);

  return (
    <AlertDialog open={showOfflineAlert} onOpenChange={setShowOfflineAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>You are offline</AlertDialogTitle>
          <AlertDialogDescription>
            Your answers are being saved locally and will be synced once you are
            back online. You can continue with the test.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowOfflineAlert(false)}>
            Continue without Internet
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SyncAlert() {
  const isOnline = useOnlineStatus();
  return (
    !isOnline ? (
      <Alert size="sm" variant="warning">
        <AlertTitle className="flex items-center gap-2">
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
