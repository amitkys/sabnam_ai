"use client";

import { useRouter } from '@bprogress/next/app';
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
import { formatDuration } from "@/utils/utils";
import LoginDialog from '../loginDailog';
import { useAuthStore } from '@/lib/store/auth-store';
import { getBadgeLabel, getBadgeVariant } from '@/utils/utils';

export const TestSeriesCard = ({
  testSeries,
}: {
  testSeries: TestSeriesResponse["data"][0];
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleNavigation = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    try {
      setLoading(true);

      const testAttemptId = await getTestAttemptId(testSeries.id);

      toast.promise(
        Promise.resolve(), // Empty promise since we already have the result
        {
          loading: "A new test on the way...",
          success: "Test starting...",
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
        <Badge className="absolute top-2 right-2" variant={getBadgeVariant(testSeries.level)}>
          {getBadgeLabel(testSeries.level)}
        </Badge>
        <CardTitle className="text-lg capitalize">
          {testSeries.title.split(" ").slice(2).join(" ").replace("series", "Test Series")}
        </CardTitle>

      </CardHeader>
      <CardContent>
        {/* <p className="text-sm text-muted-foreground">
          Duration: {formatDuration(testSeries.duration)}
        </p> */}
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
            "Start New Test"
          ) : (
            "Start Test"
          )}

          <LoginDialog
            open={showLoginDialog}
            onOpenChange={setShowLoginDialog}
          />
        </Button>
      </CardFooter>
    </Card>
  );
};
