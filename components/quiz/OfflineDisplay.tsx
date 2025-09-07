"use client";

import { RefreshCw, WifiOff } from "lucide-react";

import { Button } from "../ui/button";

export const OfflineDisplay = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-card p-8 rounded-xl shadow-lg text-center">
        <WifiOff className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">You are offline</h2>
        <p className="text-muted-foreground mb-6">
          Please check your internet connection.
        </p>
        <Button variant={"secondary"} onClick={() => window.location.reload()}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Reload
        </Button>
      </div>
    </div>
  );
};
