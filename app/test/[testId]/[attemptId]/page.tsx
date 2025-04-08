"use client";
import { usePathname } from "next/navigation";

export default function Page() {
  const pathname = usePathname();

  const parts = pathname.split("/");

  const testSeriesId = parts[2];
  const testAttemptId = parts[3];

  if (!testSeriesId || !testAttemptId) {
    alert("URL is missing");

    return;
  }

  return (
    <div>
      <p>First ID: </p>
      <p>Second ID:</p>
    </div>
  );
}
