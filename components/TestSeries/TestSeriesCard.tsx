"use client";

import { useRouter } from "@bprogress/next/app";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Languages } from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { history, isLoading, error } = useTestHistory();

  const handleNavigation = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);

      return;
    }

    try {
      setLoading(true);
      const testAttemptId = await getTestAttemptId(testSeries.id);

      if (testAttemptId) {
        toast.info("Please wait, starting soon...");
      }

      router.push(`/test/${testSeries.id}/${testAttemptId}`);
    } catch (error: any) {
      toast.error("Failed to create test attempt", error);
    } finally {
      setLoading(false);
    }
  }, [testSeries.id, router, isAuthenticated]);

  return (
    <>
      <Card className="w-full mx-auto">
        <TooltipProvider>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="flex items-center gap-1" variant="outline">
                    <Languages size={14} />
                    {testSeries.availableLanguage.join(", ")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Language support for this test</p>
                </TooltipContent>
              </Tooltip>
              <Badge variant={getBadgeVariant(testSeries.level)}>
                {getBadgeLabel(testSeries.level)}
              </Badge>
            </div>
            <CardTitle className="text-lg capitalize pt-2">
              {testSeries.exactName}
            </CardTitle>
          </CardHeader>
        </TooltipProvider>
        <CardContent>
          <TestSeriesCardContent
            hasAttempted={testSeries.hasAttempted}
            lastScore={testSeries.lastScore}
            testSeriesId={testSeries.id}
            totalQuestions={testSeries.totalQuestions}
            onOpenDrawer={setIsDrawerOpen}
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
        testSeriesTitle={testSeries.exactName}
        onOpenChange={setIsDrawerOpen}
      />

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  );
};
