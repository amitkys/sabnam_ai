"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  PrinterIcon,
  UserIcon,
  FolderTreeIcon,
  RotateCcwIcon,
} from "lucide-react";

import { ResultSummary } from "./components/ResultSummary";
import { ResultQuestionList } from "./components/ResultQuestionList";
import { TestReportModal } from "./components/TestReportModal";

import { useResult } from "@/hooks/query/get/use-result";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clearAttemptLocalStorage } from "@/lib/store/new-attempt-store";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default function ResultPage({ params }: PageProps) {
  const { attemptId } = use(params);
  const { data, isLoading, error, refetch } = useResult(attemptId);

  const [activeLanguage, setActiveLanguage] = useState<string>("en");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Clear any attempt storage when viewing the results page
  React.useEffect(() => {
    clearAttemptLocalStorage(attemptId);
  }, [attemptId]);

  // Sync default language with attempt language when loaded
  React.useEffect(() => {
    if (data?.attempt?.language) {
      setActiveLanguage(data.attempt.language);
    }
  }, [data?.attempt?.language]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-36" />
          </div>
          <div className="p-6 rounded-2xl border bg-card space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-2xl border bg-card text-center space-y-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
            <AlertCircleIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Result Not Available
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {error instanceof Error
                ? error.message
                : "Could not load test attempt result."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Link href="/home">
              <Button className="text-xs" size="sm" variant="outline">
                Back to Home
              </Button>
            </Link>
            <Button
              className="text-xs gap-1.5"
              size="sm"
              onClick={() => refetch()}
            >
              <RotateCcwIcon className="h-3.5 w-3.5" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { testPaper, user, categoryHierarchy } = data;

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-6 print:bg-white print:p-0">
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Top Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-3 print:hidden">
          <Link href="/home">
            <Button
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              size="sm"
              variant="ghost"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back to Tests
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center rounded-lg border bg-card p-0.5 text-xs">
              <button
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeLanguage === "en"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                type="button"
                onClick={() => setActiveLanguage("en")}
              >
                English
              </button>
              <button
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeLanguage === "hi"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                type="button"
                onClick={() => setActiveLanguage("hi")}
              >
                हिंदी
              </button>
            </div>

            {/* Download Test Report (PDF) Button */}
            <Button
              className="text-xs h-8 gap-1.5 font-bold shadow-xs bg-foreground text-background hover:bg-foreground/90"
              size="sm"
              type="button"
              variant="default"
              onClick={() => setReportModalOpen(true)}
            >
              <PrinterIcon className="h-3.5 w-3.5" />
              Download Test Report (PDF)
            </Button>
          </div>
        </div>

        {/* Essential Header Card */}
        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-3 print:border-none print:shadow-none">
          {/* Breadcrumb Hierarchy */}
          {categoryHierarchy && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium flex-wrap">
              <FolderTreeIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{categoryHierarchy}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {testPaper.title}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed assessment summary, solution keys, and performance
                evaluation.
              </p>
            </div>

            {/* Candidate Identity Pill */}
            {user && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border shrink-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-foreground truncate">
                    {user.name || "Student"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user.email || ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Essential Summary Metrics */}
        <ResultSummary data={data} />

        {/* Detailed Solutions & Question Analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Questions & Mathematical Solutions
            </h2>
            <span className="text-xs text-muted-foreground">
              Language: {activeLanguage === "hi" ? "हिंदी (Hindi)" : "English"}
            </span>
          </div>

          <ResultQuestionList activeLanguage={activeLanguage} data={data} />
        </div>
      </div>

      {/* Download / Print Black & White PDF Modal */}
      {reportModalOpen && (
        <TestReportModal
          data={data}
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
        />
      )}
    </div>
  );
}
