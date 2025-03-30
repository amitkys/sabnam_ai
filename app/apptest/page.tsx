"use client";

import { Spinner } from "@/components/custom/spinner";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <Button disabled>
      Hello world
      <Spinner size={"default"} variant={"default"} />
    </Button>
  );
}
