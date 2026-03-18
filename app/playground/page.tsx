"use client";

import { createToast } from "vercel-toast";

export default function PlaygroundPage() {
  return (
    <button onClick={() => createToast("hi there", { type: "success", timeout: 1000 },)}>trigger toast</button>
  )
}
