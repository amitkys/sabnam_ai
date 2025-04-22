"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { Loader } from "@/components/ui/loader";
import { TestSeriesResponse } from "@/lib/type";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTestAttemptId } from "@/lib/actions";

export const TestSeriesCard = ({
  testSeries,
}: {
  testSeries: TestSeriesResponse["data"][0];
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNavigation = useCallback(async () => {
    try {
      setLoading(true);
      // Create a toast with a specific ID

      const testAttemptId = await getTestAttemptId(testSeries.id);

      toast.promise(
        Promise.resolve(), // Empty promise since we already have the result
        {
          loading: "A new test on the way...",
          success: "You are ready to go!",
          error: "Failed to create test attempt",
        },
      );
      router.push(`/test/${testSeries.id}/${testAttemptId}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      toast.error("Failed to create test attempt");
    }
  }, [testSeries.id, router]);

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="relative">
        <Badge className="absolute top-2 right-2" variant="secondary">
          Free
        </Badge>
        <CardTitle className="text-lg">
          {testSeries.title.split(" ").slice(1).join(" ")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Duration: {testSeries.duration} minutes
        </p>
        <p className="text-sm text-muted-foreground">
          Questions: {testSeries.totalQuestions}
        </p>
        {testSeries.hasAttempted && (
          <p className="text-sm text-muted-foreground">
            Last Score: {testSeries.lastScore}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="max-w-7xl w-full"
          disabled={loading}
          variant={testSeries.hasAttempted ? "outline" : "default"}
          onClick={handleNavigation}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader size="small" variant="spin" />
            </div>
          ) : testSeries.hasAttempted ? (
            "Start New test"
          ) : (
            "Start Test"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
