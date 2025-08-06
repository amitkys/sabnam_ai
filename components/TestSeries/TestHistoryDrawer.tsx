"use client";

import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  FileText,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mutate } from "swr";

import { VisuallyHidden } from "../ui/visually-hidden";

import { Loader } from "@/components/ui/loader";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteAttempt } from "@/lib/actions";
import { ITestAttemptHistoryResponse, ITestAttemptHistory } from "@/lib/type";
import { useTestHistory } from "@/lib/store/test-history-Store";

interface TestHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testSeriesTitle: string;
  testSeriesId: string;
  history: ITestAttemptHistoryResponse | null;
  isLoading?: boolean;
  error?: string | null;
}

type LoadingAction = "resume" | "analysis" | "delete" | null;

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const TestHistoryDrawer = ({
  open,
  onOpenChange,
  testSeriesTitle,
  testSeriesId,
  history,
  isLoading = false,
  error = null,
}: TestHistoryDrawerProps) => {
  const router = useRouter();
  const { reset, removeAttempt } = useTestHistory();
  const [selectedAttempt, setSelectedAttempt] =
    useState<ITestAttemptHistory | null>(null);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  // Helper function to safely format dates
  const safeFormatDate = (date: Date | string, formatStr: string) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);

      return format(dateObj, formatStr);
    } catch (error) {
      console.error("Date formatting error:", error);

      return "Invalid Date";
    }
  };

  // Reset selected attempt and loading state when drawer closes or opens
  useEffect(() => {
    if (!open) {
      setSelectedAttempt(null);
      setLoadingAction(null);
    }
  }, [open]);

  // Prepare chart data
  const chartData =
    history?.testAttemptHistory && !isLoading && !error
      ? history.testAttemptHistory
        .map((attempt, index) => ({
          attempt: `Test ${index + 1}`,
          score: attempt.score || 0,
          date: safeFormatDate(attempt.startedAt, "MMM dd"),
          fullDate: safeFormatDate(attempt.startedAt, "MMM dd, yyyy HH:mm"),
          attemptId: attempt.id,
          attemptData: attempt,
        }))
        .reverse()
      : [];

  // Calculate stats
  const scores =
    history?.testAttemptHistory
      ?.map((h) => h.score || 0)
      .filter((score) => score > 0) || [];
  const avgScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const improvementPercent =
    scores.length > 1
      ? (((scores[scores.length - 1] - scores[0]) / scores[0]) * 100).toFixed(1)
      : "0";

  const isImproving = Number(improvementPercent) > 0;

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;

      setSelectedAttempt(clickedData.attemptData);
    }
  };

  const handleResume = () => {
    if (selectedAttempt && !loadingAction) {
      setLoadingAction("resume");
      toast.promise(Promise.resolve(), {
        loading: "Redirecting to test...",
        success: "Opening test...",
      });
      router.push(`/test/${testSeriesId}/${selectedAttempt.id}`);
    }
  };

  const handleAnalysis = () => {
    if (selectedAttempt && !loadingAction) {
      setLoadingAction("analysis");
      toast.promise(Promise.resolve(), {
        loading: "Redirecting to analysis...",
        success: "Opening analysis...",
      });
      router.push(`/analysis/${selectedAttempt.id}`);
    }
  };
  // const handleDelete = async () => {
  //   if (selectedAttempt && !loadingAction) {
  //     setLoadingAction("delete");

  //     // ✅ Clear immediately to prevent double-clicks
  //     const attemptToDelete = selectedAttempt;

  //     setSelectedAttempt(null);

  //     try {
  //       await toast.promise(deleteAttempt(attemptToDelete.id), {
  //         loading: "Deleting test...",
  //         success: "Test deleted successfully",
  //         error: "Failed to delete test. Please try again.",
  //       });

  //       // ✅ Mutate AFTER the promise completes, not inside callback
  //       mutate(`/api/testhistory/${testSeriesId}`);
  //     } catch (error) {
  //       console.error("Delete operation failed:", error);
  //       mutate(`/api/testhistory/${testSeriesId}`);
  //     } finally {
  //       setLoadingAction(null);
  //     }
  //   }
  // };

  const handleDelete = async () => {
    if (selectedAttempt && !loadingAction) {
      setLoadingAction("delete");

      // ✅ Clear immediately to prevent double-clicks
      const attemptToDelete = selectedAttempt;

      setSelectedAttempt(null);

      try {
        await toast.promise(deleteAttempt(attemptToDelete.id), {
          loading: "Deleting test...",
          success: "Test deleted successfully",
          error: "Failed to delete test. Please try again.",
        });

        // ✅ Update Zustand store immediately for UI update
        removeAttempt(attemptToDelete.id);

        // ✅ Also mutate SWR cache to keep it in sync
        mutate(`/api/testhistory/${testSeriesId}`);
        window.location.reload();
      } catch (error) {
        console.error("Delete operation failed:", error);
        // ✅ On error, revalidate SWR to restore correct state
        mutate(`/api/testhistory/${testSeriesId}`);
      } finally {
        setLoadingAction(null);
        setSelectedAttempt(null);
      }
    }
  };

  const handleClose = () => {
    setLoadingAction(null);
    setSelectedAttempt(null);
    reset(); // Clear the store state
    onOpenChange(false);
  };

  const isActionLoading = (action: LoadingAction) => loadingAction === action;
  const isAnyActionLoading = loadingAction !== null;

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader size="medium" />
      <p className="text-sm text-muted-foreground">Loading test history...</p>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground">
          Failed to load history
        </p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
      <Button size="sm" variant="outline" onClick={handleClose}>
        Close
      </Button>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <BarChart3 className="h-12 w-12 text-muted-foreground" />
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground">No test history</p>
        <p className="text-xs text-muted-foreground">
          Take your first test to see your progress
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={handleClose}>
        Close
      </Button>
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <VisuallyHidden>
          <DrawerHeader className="pb-4">
            <DrawerTitle>Test Performance History</DrawerTitle>
            <DrawerDescription>
              Your score progression for{" "}
              {testSeriesTitle.replace("series", "Test Series")}
            </DrawerDescription>
          </DrawerHeader>
        </VisuallyHidden>
        <div className="mx-auto w-full max-w-md">
          <div className="p-4 pb-4 space-y-3">
            {/* Handle different states */}
            {isLoading ? (
              renderLoadingState()
            ) : error ? (
              renderErrorState()
            ) : !history?.testAttemptHistory?.length ? (
              renderEmptyState()
            ) : (
              <>
                {/* Chart */}
                <div className="h-48 mb-8 md:mb-16">
                  <ChartContainer config={chartConfig}>
                    <BarChart
                      accessibilityLayer
                      data={chartData}
                      onClick={handleBarClick}
                    >
                      <CartesianGrid className="opacity-30" vertical={false} />
                      <XAxis
                        axisLine={false}
                        className="text-muted-foreground"
                        dataKey="date"
                        fontSize={12}
                        tickFormatter={(value) => value}
                        tickLine={false}
                        tickMargin={10}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value, name, props) => (
                              <div className="space-y-1">
                                <p className="text-xs font-medium">
                                  {props.payload?.fullDate}
                                </p>
                                <p className="text-xs text-primary font-semibold">
                                  Score: {value}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Click to view options
                                </p>
                              </div>
                            )}
                          />
                        }
                        cursor={false}
                      />
                      <Bar
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        dataKey="score"
                        fill="var(--color-score)"
                        maxBarSize={50}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>

                {/* Selected Attempt Actions OR Stats Section */}
                {selectedAttempt ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Score: {selectedAttempt.score || 0}
                        </p>
                      </div>
                      <Button
                        disabled={isAnyActionLoading}
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedAttempt(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <Card className="border-0 bg-muted/50">
                        <CardContent className="p-3">
                          <Button
                            className="w-full h-auto p-0 bg-transparent hover:bg-transparent text-foreground disabled:opacity-50"
                            disabled={isAnyActionLoading}
                            onClick={handleResume}
                          >
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1 h-4">
                                {isActionLoading("resume") ? (
                                  <Loader
                                    className="text-muted-foreground"
                                    size="small"
                                  />
                                ) : (
                                  <Play className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {isActionLoading("resume")
                                  ? "Loading..."
                                  : "Resume"}
                              </div>
                            </div>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-0 bg-muted/50">
                        <CardContent className="p-3">
                          <Button
                            className="w-full h-auto p-0 bg-transparent hover:bg-transparent text-foreground disabled:opacity-50"
                            disabled={isAnyActionLoading}
                            onClick={handleAnalysis}
                          >
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1 h-4">
                                {isActionLoading("analysis") ? (
                                  <Loader
                                    className="text-muted-foreground"
                                    size="small"
                                  />
                                ) : (
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {isActionLoading("analysis")
                                  ? "Loading..."
                                  : "Analysis"}
                              </div>
                            </div>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-0 bg-muted/50">
                        <CardContent className="p-3">
                          <Button
                            className="w-full h-auto p-0 bg-transparent hover:bg-red-50 text-foreground hover:text-red-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground"
                            disabled={isAnyActionLoading}
                            onClick={handleDelete}
                          >
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1 h-4">
                                {isActionLoading("delete") ? (
                                  <Loader
                                    className="text-muted-foreground"
                                    size="small"
                                  />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              <div
                                className={`text-xs ${isActionLoading("delete")
                                    ? "text-red-500"
                                    : isAnyActionLoading
                                      ? "text-muted-foreground"
                                      : "text-red-600"
                                  }`}
                              >
                                {isActionLoading("delete")
                                  ? "Deleting..."
                                  : "Delete"}
                              </div>
                            </div>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  /* Stats Section */
                  <div className="grid grid-cols-3 gap-2">
                    <Card className="border-0 bg-muted/50">
                      <CardContent className="p-3 text-center">
                        <div className="flex items-center justify-center mb-1">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg font-semibold">
                          {avgScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Average
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-muted/50">
                      <CardContent className="p-3 text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Award className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg font-semibold">{bestScore}</div>
                        <div className="text-xs text-muted-foreground">
                          Best
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-muted/50">
                      <CardContent className="p-3 text-center">
                        <div className="flex items-center justify-center mb-1">
                          {isImproving ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div
                          className={`text-lg font-semibold ${isImproving ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {improvementPercent}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Change
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Close Button */}
                <div className="pt-4">
                  <Button className="w-full" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
