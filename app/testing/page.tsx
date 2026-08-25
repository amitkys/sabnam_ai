"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function Page() {
  return (
    <Button onClick={() => toast.add({ title: "hi there" })}>hi there</Button>
  )
}