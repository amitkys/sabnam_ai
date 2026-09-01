"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function Page() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Toast Showcase</h1>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Default Event",
              description: "Event has been created.",
            })
          }
        >
          Default
        </Button>
        <Button
          className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
          variant="outline"
          onClick={() =>
            toast.add({
              type: "success",
              title: "Success",
              description: "Test submitted successfully.",
            })
          }
        >
          Success (Green)
        </Button>
        <Button
          className="border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
          variant="outline"
          onClick={() =>
            toast.add({
              type: "info",
              title: "Information",
              description: "Test will automatically auto-save every 5s.",
            })
          }
        >
          Info (Blue)
        </Button>
        <Button
          className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
          variant="outline"
          onClick={() =>
            toast.add({
              type: "warning",
              title: "Connection Warning",
              description: "Sync is running in offline mode.",
            })
          }
        >
          Warning (Yellow)
        </Button>
        <Button
          className="border-rose-500/50 text-rose-600 hover:bg-rose-500/10"
          variant="outline"
          onClick={() =>
            toast.add({
              type: "error",
              title: "Action Failed",
              description: "Could not connect to the database.",
            })
          }
        >
          Error (Red)
        </Button>
      </div>
    </div>
  );
}
