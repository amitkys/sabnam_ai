import Link from "next/link";

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

// TestSeriesCard component
export const TestSeriesCard = ({
  testSeries,
}: {
  testSeries: TestSeriesResponse["data"][0];
}) => (
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
      <Link passHref href={`/test/${testSeries.id}`}>
        {testSeries.hasAttempted ? (
          <Button className="max-w-7xl" variant="outline">
            Re-Attempt
          </Button>
        ) : (
          <Button className="max-w-7xl">Start Test</Button>
        )}
      </Link>
    </CardFooter>
  </Card>
);
