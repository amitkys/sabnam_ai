"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCwIcon,
  UserCheckIcon,
  ClockIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Trash2Icon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon,
  AwardIcon,
  XIcon,
} from "lucide-react";

import { FlatCategoryItem } from "./category-dialog";
import { TestPaperItem } from "./test-paper-dialog";
import { AttemptDetailDialog } from "./attempt-detail-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import {
  AdminAttemptItem,
  getAdminRecentAttemptsAction,
  deleteAdminAttemptAction,
  GetAdminAttemptsResult,
} from "@/lib/action/admin/attempt-actions";
import { AttemptStatus } from "@/lib/generated/prisma/enums";

interface AttemptManagerProps {
  testPapers: TestPaperItem[];
  allCategories?: FlatCategoryItem[];
}

export function AttemptManager({
  testPapers,
  allCategories: _allCategories,
}: AttemptManagerProps) {
  // Filter states
  const [emailQuery, setEmailQuery] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Data states
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetAdminAttemptsResult | null>(null);

  // Inspection Dialog
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Delete State
  const [attemptToDelete, setAttemptToDelete] =
    useState<AdminAttemptItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce email query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(emailQuery);
      setPage(1); // Reset to page 1 on search change
    }, 350);

    return () => clearTimeout(timer);
  }, [emailQuery]);

  // Load attempts
  const loadAttempts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminRecentAttemptsAction({
        page,
        limit,
        email: debouncedEmail || undefined,
        status: statusFilter as any,
        testPaperId:
          selectedTestFilter !== "ALL" ? selectedTestFilter : undefined,
      });

      if (res.success) {
        setData(res.data);
      } else {
        toast.add({
          type: "error",
          title: "Failed to load attempts",
          description: res.error,
        });
      }
    } catch (err: any) {
      toast.add({
        type: "error",
        title: "Error fetching attempts",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedEmail, statusFilter, selectedTestFilter]);

  // Fetch when filters change
  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  // Delete attempt handler
  const handleDeleteAttempt = async () => {
    if (!attemptToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteAdminAttemptAction({
        attemptId: attemptToDelete.id,
      });

      if (res.success) {
        toast.add({
          type: "success",
          title: "Attempt Deleted",
          description: "Candidate test attempt has been removed.",
        });
        setAttemptToDelete(null);
        loadAttempts();
      } else {
        toast.add({
          type: "error",
          title: "Deletion failed",
          description: res.error,
        });
      }
    } catch (err: any) {
      toast.add({
        type: "error",
        title: "Error deleting attempt",
        description: err.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleInspectAttempt = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setDetailDialogOpen(true);
  };

  const clearEmailFilter = () => {
    setEmailQuery("");
    setDebouncedEmail("");
    setPage(1);
  };

  const stats = data?.summaryStats;
  const attempts = data?.attempts || [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCheckIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Attempts
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats?.totalAttempts ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Completed
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats?.completedAttempts ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ClockIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                In Progress / Paused
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats?.inProgressAttempts ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <AwardIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Average Score
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats?.averageScore ?? 0} pts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border shadow-xs bg-card">
        <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Email Filter Search Input */}
          <div className="relative flex-1">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-9 h-9 text-xs font-mono"
              placeholder="Filter by candidate email address..."
              type="text"
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
            />
            {emailQuery && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                type="button"
                onClick={clearEmailFilter}
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val || "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-9 text-xs font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value={AttemptStatus.COMPLETED}>
                  Completed
                </SelectItem>
                <SelectItem value={AttemptStatus.STARTED}>Started</SelectItem>
                <SelectItem value={AttemptStatus.PAUSED}>Paused</SelectItem>
              </SelectContent>
            </Select>

            {/* Test Paper Filter */}
            <Select
              value={selectedTestFilter}
              onValueChange={(val) => {
                setSelectedTestFilter(val || "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] h-9 text-xs font-medium truncate">
                <SelectValue placeholder="Filter by Test" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="ALL">All Test Papers</SelectItem>
                {testPapers.map((tp) => (
                  <SelectItem key={tp.id} className="text-xs" value={tp.id}>
                    {tp.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              className="h-9 text-xs gap-1.5"
              disabled={loading}
              size="sm"
              variant="outline"
              onClick={loadAttempts}
            >
              <RefreshCwIcon
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attempts List / Table */}
      <Card className="border shadow-xs bg-card overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UserCheckIcon className="h-4 w-4 text-primary" />
              Recent Candidate Attempts
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {debouncedEmail
                ? `Showing test attempts matching email "${debouncedEmail}"`
                : "Chronological list of student exam sessions and submissions"}
            </p>
          </div>

          {pagination && (
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
              {pagination.total} total{" "}
              {pagination.total === 1 ? "attempt" : "attempts"}
            </span>
          )}
        </div>

        {loading && attempts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <RefreshCwIcon className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-medium">
              Fetching candidate attempt logs...
            </p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MailIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                No attempts found
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {debouncedEmail
                  ? `No test attempts were found matching the email address "${debouncedEmail}".`
                  : "No students have attempted the selected tests yet."}
              </p>
            </div>
            {debouncedEmail && (
              <Button
                className="text-xs h-8"
                size="sm"
                variant="outline"
                onClick={clearEmailFilter}
              >
                Clear Email Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Test Series</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Score / Accuracy</th>
                  <th className="py-3 px-4 text-center">Questions</th>
                  <th className="py-3 px-4">Timing</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {attempts.map((att) => {
                  const isCompleted = att.status === AttemptStatus.COMPLETED;
                  const isStarted = att.status === AttemptStatus.STARTED;
                  const isPaused = att.status === AttemptStatus.PAUSED;

                  const timeSpentMins = Math.floor(att.timeSpentSeconds / 60);
                  const timeSpentSecs = att.timeSpentSeconds % 60;

                  const startDateStr = new Date(
                    att.startedAt,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={att.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Candidate info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border">
                            {att.user.name
                              ? att.user.name.slice(0, 2).toUpperCase()
                              : "ST"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate max-w-[160px]">
                              {att.user.name || "Student"}
                            </p>
                            <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[180px] flex items-center gap-1">
                              <MailIcon className="h-2.5 w-2.5 shrink-0" />
                              {att.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Test Series */}
                      <td className="py-3 px-4">
                        <div className="min-w-0 max-w-[220px]">
                          <p className="font-semibold text-foreground truncate">
                            {att.testPaper.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {att.categoryHierarchy}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={`text-[10px] font-bold ${
                            isCompleted
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : isStarted
                                ? "border-amber-500/50 text-amber-600 dark:text-amber-400 animate-pulse"
                                : ""
                          }`}
                          variant={
                            isCompleted
                              ? "default"
                              : isPaused
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {att.status}
                        </Badge>
                      </td>

                      {/* Score / Accuracy */}
                      <td className="py-3 px-4 text-center">
                        <div className="font-mono font-bold text-foreground">
                          {att.score !== null ? att.score : "—"}{" "}
                          <span className="text-[10px] text-muted-foreground font-normal">
                            / {att.testPaper.totalMarks}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                          {att.accuracy}% acc
                        </p>
                      </td>

                      {/* Questions Breakdown */}
                      <td className="py-3 px-4 text-center">
                        <div className="text-[11px] font-medium text-foreground">
                          {att.answeredCount} / {att.totalQuestions} ans
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ {att.correctCount} correct
                        </div>
                      </td>

                      {/* Timing */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] font-medium text-foreground">
                          {startDateStr}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                          <ClockIcon className="h-2.5 w-2.5" />
                          {timeSpentMins}m {timeSpentSecs}s
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Detail & Report */}
                          <Button
                            className="h-7 text-xs px-2.5 gap-1 font-semibold"
                            size="sm"
                            variant="default"
                            onClick={() => handleInspectAttempt(att.id)}
                          >
                            <EyeIcon className="h-3 w-3" />
                            Inspect &amp; Report
                          </Button>

                          {/* Delete Attempt */}
                          <Button
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            size="sm"
                            title="Delete attempt"
                            variant="ghost"
                            onClick={() => setAttemptToDelete(att)}
                          >
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.total > 0 && (
          <div className="p-3 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-muted-foreground font-medium">
              <span>
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} records
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">Per page:</span>
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    setLimit(Number(val) || 20);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-6 w-16 text-[11px] px-1.5 py-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                className="h-7 text-xs px-2.5 gap-1"
                disabled={pagination.page <= 1 || loading}
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon className="h-3 w-3" />
                Previous
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum = i + 1;

                    if (pagination.totalPages > 5 && pagination.page > 3) {
                      pageNum = Math.min(
                        pagination.totalPages - 4 + i,
                        pagination.page - 2 + i,
                      );
                    }

                    return (
                      <Button
                        key={pageNum}
                        className="h-7 w-7 p-0 text-xs font-mono"
                        disabled={loading}
                        size="sm"
                        variant={
                          pagination.page === pageNum ? "default" : "ghost"
                        }
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  },
                )}
              </div>

              <Button
                className="h-7 text-xs px-2.5 gap-1"
                disabled={pagination.page >= pagination.totalPages || loading}
                size="sm"
                variant="outline"
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
              >
                Next
                <ChevronRightIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* In-depth Attempt Details & Report Modal */}
      <AttemptDetailDialog
        attemptId={selectedAttemptId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(attemptToDelete)}
        onOpenChange={(open) => !open && setAttemptToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5" />
              Delete Candidate Attempt?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs space-y-1 block">
              <span className="block">
                Are you sure you want to delete this test attempt for candidate{" "}
                <span className="font-bold text-foreground">
                  {attemptToDelete?.user.name} ({attemptToDelete?.user.email})
                </span>
                ?
              </span>
              <span className="block text-muted-foreground">
                This action will permanently delete all student answers, scores,
                and session logs for this attempt.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs h-8"
              disabled={deleting}
              onClick={handleDeleteAttempt}
            >
              {deleting ? "Deleting..." : "Delete Attempt"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
