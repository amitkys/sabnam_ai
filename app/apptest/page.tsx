"use client";
import { ErrorDisplay } from "@/components/error/ErrorDisplay";

export default function Page() {
  return (
    <ErrorDisplay gotoHome={true} message="Hello world" retry={() => { }} />
  );
}
