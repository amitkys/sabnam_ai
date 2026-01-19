"use client";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const { data, isLoading, error } = useAttemptTest({ attemptId })

  if (isLoading) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>got error: {error.message}</div>
  }


  return (
    <div>hi there</div>
  )
}
