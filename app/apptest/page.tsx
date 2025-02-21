"use client";

import { toast } from "sonner";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-centerj w-full">
    <button onClick={() => toast.info("Operation successfully done")}>click on me</button>
    </div>
  )
}