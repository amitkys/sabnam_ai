"use client";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";
import { Header } from "./_components/header";

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

  if (!data) {
    <div>data not found</div>
  }

  console.log(data);


  return (
    <div>
      <Header attemptId={attemptId} />
    </div>
  )
}
