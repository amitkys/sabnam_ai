"use client";

import { useEffect, useState } from "react";
import {
  IconCheck,
  IconClock,
  IconCloudCheck,
  IconDeviceFloppy,
  IconExclamationMark,
  IconWifiOff,
} from "@tabler/icons-react";

import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "Not synced yet";

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 5) return "Just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const minutes = Math.floor(diffSeconds / 60);

  if (minutes === 1) return "1 min ago";

  return `${minutes} mins ago`;
}

export function SyncStatusBadge() {
  const isOnline = useOnlineStatus();
  const isSyncing = useNewTestAttemptStore((s) => s.isSyncing);
  const lastSyncedAt = useNewTestAttemptStore((s) => s.lastSyncedAt);
  const pendingSync = useNewTestAttemptStore((s) => s.pendingSync);
  const syncErrorCount = useNewTestAttemptStore((s) => s.syncErrorCount);

  // Periodic re-render ticker for the relative timestamp
  const [, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Determine operational state
  const isOffline = !isOnline;
  const isDelayed = isOnline && syncErrorCount >= 2;

  const statusColor = isOffline ? "rose" : isDelayed ? "amber" : "emerald";

  const statusLabel = isOffline
    ? "Offline"
    : isDelayed
      ? "Sync Delayed"
      : isSyncing
        ? "Syncing..."
        : "Operational";

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 cursor-pointer select-none",
          statusColor === "emerald" &&
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/30",
          statusColor === "amber" &&
            "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/30",
          statusColor === "rose" &&
            "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/30",
        )}
      >
        {/* Heartbeat / Live Indicator Dot */}
        <span className="relative flex h-2 w-2 items-center justify-center">
          {/* Animated pulse ring during active heartbeat or warning */}
          {(isSyncing || isDelayed) && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                statusColor === "emerald" && "bg-emerald-400",
                statusColor === "amber" && "bg-amber-400",
                statusColor === "rose" && "bg-rose-400",
              )}
            />
          )}
          {/* Solid resting dot */}
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full transition-colors",
              statusColor === "emerald" &&
                "bg-emerald-500 shadow-xs shadow-emerald-500/50",
              statusColor === "amber" &&
                "bg-amber-500 shadow-xs shadow-amber-500/50",
              statusColor === "rose" &&
                "bg-rose-500 shadow-xs shadow-rose-500/50",
            )}
          />
        </span>

        {/* Text Label */}
        <span className="hidden sm:inline-block tracking-tight">
          {statusLabel}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 p-3.5 shadow-lg border bg-popover/95 backdrop-blur-sm"
        sideOffset={6}
      >
        <div className="flex flex-col gap-2.5">
          {/* Title Header */}
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-2 w-2 rounded-full",
                  statusColor === "emerald" && "bg-emerald-500",
                  statusColor === "amber" && "bg-amber-500",
                  statusColor === "rose" && "bg-rose-500",
                )}
              />
              <span className="text-xs font-semibold text-foreground">
                {isOffline
                  ? "System Offline"
                  : isDelayed
                    ? "Sync Retrying"
                    : "System Operational"}
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
              Auto-Save (5s)
            </span>
          </div>

          {/* Details list */}
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            {/* Cloud Sync Status */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IconCloudCheck className="text-foreground/70" size={14} />
                Cloud Backup
              </span>
              <span className="font-medium text-foreground">
                {isOffline ? (
                  <span className="flex items-center gap-1 text-rose-500">
                    <IconWifiOff size={12} /> Paused
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <IconCheck size={12} /> {formatRelativeTime(lastSyncedAt)}
                  </span>
                )}
              </span>
            </div>

            {/* Local Storage Protection */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IconDeviceFloppy className="text-foreground/70" size={14} />
                Local Storage
              </span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Protected (Instant)
              </span>
            </div>

            {/* Pending Buffer Status */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IconClock className="text-foreground/70" size={14} />
                Sync Queue
              </span>
              <span
                className={cn(
                  "font-medium",
                  pendingSync.size > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-foreground",
                )}
              >
                {pendingSync.size === 0
                  ? "All synced"
                  : `${pendingSync.size} pending auto-sync`}
              </span>
            </div>
          </div>

          {/* Context Note */}
          <div className="rounded-md bg-muted/60 p-2 text-[11px] leading-tight text-muted-foreground">
            {isOffline ? (
              <span className="text-rose-600 dark:text-rose-400 flex items-start gap-1">
                <IconExclamationMark className="shrink-0 mt-0.5" size={14} />
                Answers are safe on this device. Sync will resume once you
                reconnect.
              </span>
            ) : (
              <span>
                Your answers are automatically saved locally and backed up to
                the cloud every 5 seconds.
              </span>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
