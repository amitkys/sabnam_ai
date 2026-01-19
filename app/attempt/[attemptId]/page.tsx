import { getAttemptAction } from "@/lib/action/get-attempt-action";
import { AttemptSummary } from "./_components/AttemptSummary";
import { QuestionReviewCard } from "./_components/QuestionReviewCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function Page({ params }: { params: { attemptId: string } }) {
  const { attemptId } = await params;
  const result = await getAttemptAction(attemptId);

  return (
    <div>le bettaaa </div>
  )
}
