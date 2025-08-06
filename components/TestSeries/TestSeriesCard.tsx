"use client";

import { useRouter } from "@bprogress/next/app";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { TestHistoryDrawer } from "./TestHistoryDrawer";
import { TestSeriesCardContent } from "./TestSeriesCardContent";
import { TestSeriesCardActions } from "./TestSeriesCardAction";

import LoginDialog from "@/components/loginDailog";
import { TestSeriesResponse } from "@/lib/type";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTestAttemptId } from "@/lib/actions";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTestHistory } from "@/lib/store/test-history-Store";
import { getBadgeLabel, getBadgeVariant } from "@/utils/utils";

export const TestSeriesCard = ({
  testSeries,
}: {
  testSeries: TestSeriesResponse["data"][0];
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isDrawerOpen, setIsDrawerOpen, history, isLoading, error } =
    useTestHistory();

  const handleNavigation = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);

      return;
    }

    try {
      setLoading(true);
      const testAttemptId = await getTestAttemptId(testSeries.id);

      toast.promise(Promise.resolve(), {
        loading: "A new test on the way...",
        success: "Test starting...",
        error: "Failed to create test attempt",
      });

      router.push(`/test/${testSeries.id}/${testAttemptId}`);
    } catch (error: any) {
      toast.error("Failed to create test attempt", error);
    } finally {
      setLoading(false);
    }
  }, [testSeries.id, router, isAuthenticated]);

  const formattedTitle = testSeries.title
    .split(" ")
    .slice(2)
    .join(" ")
    .replace("series", "Test Series");

  return (
    <>
      <Card className="w-full mx-auto">
        <CardHeader className="relative">
          <Badge
            className="absolute top-2 right-2"
            variant={getBadgeVariant(testSeries.level)}
          >
            {getBadgeLabel(testSeries.level)}
          </Badge>
          <CardTitle className="text-lg capitalize">{formattedTitle}</CardTitle>
        </CardHeader>

        <CardContent>
          <TestSeriesCardContent
            hasAttempted={testSeries.hasAttempted}
            lastScore={testSeries.lastScore}
            testSeriesId={testSeries.id}
            totalQuestions={testSeries.totalQuestions}
          />
        </CardContent>

        <CardFooter>
          <TestSeriesCardActions
            hasAttempted={testSeries.hasAttempted}
            loading={loading}
            onStartTest={handleNavigation}
          />
        </CardFooter>
      </Card>

      <TestHistoryDrawer
        error={error}
        history={history}
        isLoading={isLoading}
        open={isDrawerOpen}
        testSeriesId={testSeries.id}
        testSeriesTitle={testSeries.title}
        onOpenChange={setIsDrawerOpen}
      />

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  );
};
