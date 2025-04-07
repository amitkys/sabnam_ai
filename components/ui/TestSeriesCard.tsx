"use client";
import { useRouter } from "next/navigation";

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
  const route = useRouter();
  const handleNavigation = async () => {
    const testAttemptId = await getTestAttemptId(testSeries.id);

    console.log("attemp id", testAttemptId);

    route.push(`/test/${testSeries.id}/${testAttemptId}`);
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="relative">
        <Badge className="absolute top-2 right-2" variant="secondary">
          Free
        </Badge>
        <CardTitle className="text-lg">{testSeries.title}</CardTitle>
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
          variant={testSeries.hasAttempted ? "outline" : "default"}
          onClick={handleNavigation}
        >
          {testSeries.hasAttempted ? "Re-Attempt" : "Start Test"}
        </Button>
      </CardFooter>
    </Card>
  );
};
