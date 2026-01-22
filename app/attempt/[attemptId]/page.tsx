"use client";
import { useAttemptTest } from "@/hooks/get-attemp-test";
import { useParams } from "next/navigation";
import { Header } from "./_components/header";
import { useEffect } from "react";
import { useNewTestAttemptStore } from "@/lib/store/new-attempt-store";

export default function Page() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const { data, isLoading, error } = useAttemptTest({ attemptId })

  const hydrateFromServer = useNewTestAttemptStore(s => s.hydrateFromServer);

  // Hydrate store when data loads
  useEffect(() => {
    if (data?.responses) {
      // Step A: Filter & Transform
      const validResponses = data.responses
        // 1. FILTER: Ignore questions they haven't answered yet (where userAnswer is null)
        .filter((r) => r.userAnswer !== null)

        // 2. MAP: Convert the complex DB object into the simple shape the store expects
        .map((r) => ({
          questionId: r.questionId,
          userAnswer: r.userAnswer as string, // We know it's a string now because we filtered nulls
        }));

      // Step B: Update the Store
      hydrateFromServer(validResponses);
    }
  }, [data, hydrateFromServer]);

  if (isLoading) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>got error: {error.message}</div>
  }

  if (!data) {
    return <div>data not found</div>
  }

  console.log(data);


  return (
    <div>
      <Header attemptId={attemptId} />
    </div>
  )
}
