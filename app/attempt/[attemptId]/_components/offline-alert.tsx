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
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
