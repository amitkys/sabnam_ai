// app/exam/page.tsx

"use client";

import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const examName = searchParams.get("name");
  const subject = searchParams.get("subject");
  const chapter = searchParams.get("chapter");
}
