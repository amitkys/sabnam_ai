"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Types() {
  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast("You are on the latest version.", {
            description: "We have updated the app to the latest version.",
          })
        }
      >
        Description
      </Button>

      <Button
        variant="outline"
        onClick={() => toast.success("You are on the latest version.")}
      >
        Success
      </Button>

      <Button
        variant="outline"
        onClick={() => toast.info("You are on the latest version.")}
      >
        Info
      </Button>

      <Button
        variant="outline"
        onClick={() => toast.warning("You are on the latest version.")}
      >
        Warning
      </Button>

      <Button
        variant="outline"
        onClick={() => toast.error("You are on the latest version.")}
      >
        Error
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast("You are on the latest version.", {
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        Action
      </Button>
    </>
  );
}