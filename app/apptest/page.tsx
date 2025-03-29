"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Button onClick={() => setCount(count + 1)}>{count} time click</Button>
    </div>
  );
}
