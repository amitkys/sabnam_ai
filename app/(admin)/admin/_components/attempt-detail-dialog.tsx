"use client";

import React, { useState, useEffect } from "react";
import {
  PrinterIcon,
  CheckCircle2Icon,
  XCircleIcon,
  HelpCircleIcon,
  ClockIcon,
  UserIcon,
  Loader2Icon,
  CalendarIcon,
  MailIcon,
  BookOpenIcon,
  FileTextIcon,
} from "lucide-react";
import QRCode from "qrcode";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminAttemptDetailsAction } from "@/lib/action/admin/attempt-actions";
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import { toast } from "@/components/ui/toast";

interface AttemptDetailDialogProps {
  attemptId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttemptDetailDialog({
  attemptId,
  open,
  onOpenChange,
}: AttemptDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionFilter, setQuestionFilter] = useState<
    "all" | "correct" | "incorrect" | "skipped"
  >("all");
  const [activeLang, setActiveLang] = useState<"en" | "hi">("en");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Fetch attempt details when dialog opens
  useEffect(() => {
    if (!open || !attemptId) {
      setData(null);
      setError(null);

      return;
    }

    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminAttemptDetailsAction({
          attemptId: attemptId!,
        });

        if (res.success) {
          setData(res.data);
          if (res.data?.attempt?.language === "hi") {
            setActiveLang("hi");
          } else {
            setActiveLang("en");
          }
        } else {
          setError(res.error || "Failed to load attempt details");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load attempt details");
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [open, attemptId]);

  // Generate QR Code for report
  useEffect(() => {
    if (typeof window !== "undefined" && attemptId) {
      const url = `${window.location.origin}/result/${attemptId}`;

      QRCode.toDataURL(url, {
        width: 140,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      })
        .then((dataUri) => setQrCodeUrl(dataUri))
        .catch(() => {
          // Fallback if QR generation fails
          setQrCodeUrl("");
        });
    }
  }, [attemptId]);

  if (!open) return null;

  const attempt = data?.attempt;
  const user = data?.user;
  const testPaper = data?.testPaper;
  const questions: any[] = data?.questions || [];

  const totalQuestions = questions.length;
  const attemptedQuestions = questions.filter(
    (q) => q.studentResponse !== null && q.studentResponse?.userAnswer,
  ).length;
  const correctAnswers = questions.filter(
    (q) => q.studentResponse?.isCorrect,
  ).length;
  const incorrectAnswers = attemptedQuestions - correctAnswers;
  const skippedQuestions = Math.max(0, totalQuestions - attemptedQuestions);

  const accuracy =
    attemptedQuestions > 0
      ? ((correctAnswers / attemptedQuestions) * 100).toFixed(1)
      : "0.0";
  const percentage =
    testPaper?.totalMarks > 0
      ? (((attempt?.score || 0) / testPaper.totalMarks) * 100).toFixed(1)
      : "0.0";

  let timeSpentStr = "0 min";

  if (attempt?.startedAt && attempt?.submittedAt) {
    const diffSec = Math.floor(
      (new Date(attempt.submittedAt).getTime() -
        new Date(attempt.startedAt).getTime()) /
        1000,
    );
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;

    timeSpentStr = `${m}m ${s}s`;
  }

  const attemptDateStr = attempt?.submittedAt
    ? new Date(attempt.submittedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : attempt?.startedAt
      ? new Date(attempt.startedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  const handlePrintReport = () => {
    if (!data) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report — ${testPaper.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; background: #ffffff; color: #000000; -webkit-print-color-adjust: exact; print-color-adjust: exact; line-height: 1.5; padding: 12mm 15mm; }
    .report { max-width: 680px; margin: 0 auto; padding: 24px 0; }
    .doc-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 18px; }
    .doc-header h1 { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.2; }
    .doc-header h1.brand-name { font-family: 'Dancing Script', cursive; font-weight: 700; text-transform: none; font-size: 36px; letter-spacing: 0; }
    .doc-header .subtitle { font-size: 11px; color: #555; letter-spacing: 0.5px; margin-top: 2px; }
    .status-badge { display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 700; border: 1px solid #000; text-transform: uppercase; letter-spacing: 0.3px; }
    .attempt-id { font-size: 10px; color: #666; margin-top: 4px; font-family: 'Courier New', monospace; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #000; margin-bottom: 18px; background: #fafafa; }
    .details-col { padding: 14px; }
    .details-col + .details-col { border-left: 1px solid #ccc; }
    .detail-row { margin-bottom: 8px; }
    .detail-label { display: block; font-size: 9px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1px; }
    .detail-value { font-size: 13px; font-weight: 600; color: #000; }
    .detail-value.mono { font-family: 'Courier New', monospace; font-size: 12px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .score-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 18px; }
    .score-table th { background: #f0f0f0; border: 1px solid #000; padding: 7px 8px; font-weight: 700; text-align: left; }
    .score-table td { border: 1px solid #000; padding: 7px 8px; font-weight: 500; font-family: 'Courier New', monospace; }
    .breakdown-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 18px; }
    .breakdown-card { border: 1px solid #000; padding: 14px 8px; text-align: center; background: #fafafa; }
    .card-label { display: block; font-size: 9px; font-weight: 700; color: #666; text-transform: uppercase; margin-bottom: 4px; }
    .card-value { font-size: 24px; font-weight: 900; font-family: 'Courier New', monospace; }
    .qr-section { display: flex; align-items: center; justify-content: space-between; gap: 16px; border: 1px solid #000; padding: 16px; background: #fafafa; margin-bottom: 18px; }
    .qr-img-wrap { flex-shrink: 0; padding: 4px; border: 1px solid #000; background: #fff; }
    .qr-img-wrap img { display: block; width: 96px; height: 96px; }
    .doc-footer { padding-top: 12px; border-top: 1px solid #aaa; display: flex; align-items: center; justify-content: space-between; font-size: 9px; color: #888; }
    @media print { .report { max-width: 100%; padding: 0; } }
  </style>
</head>
<body>
  <div class="report">
    <div class="doc-header">
      <div><h1 class="brand-name">Sabnam AI — Test Report</h1><div class="subtitle">Official Examination Assessment &amp; Performance Evaluation</div></div>
      <div style="text-align:right"><span class="status-badge">${attempt.status}</span><div class="attempt-id">ID: ${attempt.id.slice(0, 14)}</div></div>
    </div>
    <div class="details-grid">
      <div class="details-col">
        <div class="detail-row"><span class="detail-label">Candidate Name</span><span class="detail-value">${user.name || "Student"}</span></div>
        <div class="detail-row"><span class="detail-label">Email Address</span><span class="detail-value mono">${user.email || "N/A"}</span></div>
        <div class="detail-row"><span class="detail-label">Date of Examination</span><span class="detail-value">${attemptDateStr}</span></div>
      </div>
      <div class="details-col">
        <div class="detail-row"><span class="detail-label">Test Series Title</span><span class="detail-value">${testPaper.title}</span></div>
        <div class="detail-row"><span class="detail-label">Exam Hierarchy</span><span class="detail-value">${data.categoryHierarchy}</span></div>
        <div class="detail-row"><span class="detail-label">Time Duration</span><span class="detail-value">${testPaper.duration}m (Spent: ${timeSpentStr})</span></div>
      </div>
    </div>
    <div class="section-title">Score &amp; Performance Summary</div>
    <table class="score-table">
      <thead><tr><th>Max Marks</th><th>Score Obtained</th><th>Percentage</th><th>Accuracy</th><th>Total Questions</th><th>Attempted</th></tr></thead>
      <tbody><tr><td>${testPaper.totalMarks}</td><td>${attempt.score ?? 0}</td><td>${percentage}%</td><td>${accuracy}%</td><td>${totalQuestions}</td><td>${attemptedQuestions}</td></tr></tbody>
    </table>
    <div class="breakdown-grid">
      <div class="breakdown-card"><span class="card-label">Correct</span><span class="card-value">${correctAnswers}</span></div>
      <div class="breakdown-card"><span class="card-label">Incorrect</span><span class="card-value">${incorrectAnswers}</span></div>
      <div class="breakdown-card"><span class="card-label">Skipped</span><span class="card-value">${skippedQuestions}</span></div>
    </div>
    <div class="qr-section">
      <div><div class="qr-label">Scan to View Full Questions &amp; Analysis</div><div class="attempt-id">Verification ID: ${attempt.id}</div></div>
      ${qrCodeUrl ? `<div class="qr-img-wrap"><img src="${qrCodeUrl}" /></div>` : ""}
    </div>
    <div class="doc-footer"><span>Generated by Sabnam AI Examination Engine</span><span>Document Authenticity Verified</span></div>
  </div>
</body>
</html>`;

    toast.add({
      type: "info",
      title: "Generating Test Report",
      description:
        "Preparing single-page PDF certificate with official QR seal...",
    });

    const printWin = window.open("", "_blank");

    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.onload = () => {
        setTimeout(() => {
          printWin.print();
        }, 500);
      };
    } else {
      toast.add({
        type: "warning",
        title: "Pop-up Blocked",
        description:
          "Please allow pop-ups for this site to print/save the test report.",
      });
    }
  };

  const filteredQuestions = questions.filter((tq) => {
    const isAnswered =
      tq.studentResponse !== null && tq.studentResponse?.userAnswer;
    const isCorrect = tq.studentResponse?.isCorrect;

    if (questionFilter === "correct") return isCorrect;
    if (questionFilter === "incorrect") return isAnswered && !isCorrect;
    if (questionFilter === "skipped") return !isAnswered;

    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
          <div>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Student Attempt Inspector &amp; Report
            </DialogTitle>
            <DialogDescription className="text-xs mt-0.5">
              Review candidate responses, scoring metrics, and generate official
              performance reports.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <Button
                className="text-xs h-8 gap-1.5 font-bold shadow-sm"
                size="sm"
                variant="default"
                onClick={handlePrintReport}
              >
                <PrinterIcon className="h-3.5 w-3.5" />
                Download / Print Report (PDF)
              </Button>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Loading student attempt details...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Student & Test Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
              {/* Student Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <UserIcon className="h-3.5 w-3.5" /> Candidate Information
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "ST"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {user?.name || "Anonymous Student"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <MailIcon className="h-3 w-3" />
                      {user?.email || "No email available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Attempt ID:
                  </span>
                  <code className="bg-background px-1.5 py-0.5 rounded border text-[11px]">
                    {attempt?.id}
                  </code>
                </div>
              </div>

              {/* Test Paper Info */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l md:pl-4 pt-2 md:pt-0">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <FileTextIcon className="h-3.5 w-3.5" /> Test Information
                </div>
                <p className="text-sm font-bold text-foreground">
                  {testPaper?.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge
                    className="bg-background font-normal text-[11px]"
                    variant="outline"
                  >
                    {data.categoryHierarchy}
                  </Badge>
                  <Badge
                    className="text-[11px]"
                    variant={
                      attempt?.status === "COMPLETED"
                        ? "default"
                        : attempt?.status === "PAUSED"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {attempt?.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
                  <CalendarIcon className="h-3 w-3" /> Exam Date:{" "}
                  {attemptDateStr}
                </p>
              </div>
            </div>

            {/* Performance Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-card shadow-xs">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground font-medium">
                    Score Obtained
                  </p>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {attempt?.score ?? 0}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      / {testPaper?.totalMarks}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    {percentage}% aggregate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card shadow-xs">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground font-medium">
                    Accuracy
                  </p>
                  <p className="text-2xl font-black text-primary mt-1">
                    {accuracy}%
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    {correctAnswers} of {attemptedQuestions} attempted
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card shadow-xs">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground font-medium">
                    Time Spent
                  </p>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {timeSpentStr}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    Duration: {testPaper?.duration} mins
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card shadow-xs">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground font-medium">
                    Question Status
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ {correctAnswers}
                    </span>
                    <span className="text-xs font-bold text-destructive">
                      ✗ {incorrectAnswers}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      - {skippedQuestions}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">
                    {totalQuestions} total questions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Language and Question Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-muted-foreground mr-1">
                  Display Language:
                </span>
                <Button
                  className="h-7 text-xs px-2.5"
                  size="sm"
                  variant={activeLang === "en" ? "default" : "outline"}
                  onClick={() => setActiveLang("en")}
                >
                  English
                </Button>
                <Button
                  className="h-7 text-xs px-2.5"
                  size="sm"
                  variant={activeLang === "hi" ? "default" : "outline"}
                  onClick={() => setActiveLang("hi")}
                >
                  हिंदी (Hindi)
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  className="h-7 text-xs px-2.5"
                  size="sm"
                  variant={questionFilter === "all" ? "secondary" : "ghost"}
                  onClick={() => setQuestionFilter("all")}
                >
                  All ({totalQuestions})
                </Button>
                <Button
                  className="h-7 text-xs px-2.5 text-emerald-600 dark:text-emerald-400"
                  size="sm"
                  variant={questionFilter === "correct" ? "secondary" : "ghost"}
                  onClick={() => setQuestionFilter("correct")}
                >
                  Correct ({correctAnswers})
                </Button>
                <Button
                  className="h-7 text-xs px-2.5 text-destructive"
                  size="sm"
                  variant={
                    questionFilter === "incorrect" ? "secondary" : "ghost"
                  }
                  onClick={() => setQuestionFilter("incorrect")}
                >
                  Incorrect ({incorrectAnswers})
                </Button>
                <Button
                  className="h-7 text-xs px-2.5 text-muted-foreground"
                  size="sm"
                  variant={questionFilter === "skipped" ? "secondary" : "ghost"}
                  onClick={() => setQuestionFilter("skipped")}
                >
                  Skipped ({skippedQuestions})
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border rounded-xl bg-muted/20">
                  No questions match the selected filter.
                </div>
              ) : (
                filteredQuestions.map((tq, idx) => {
                  const q = tq.question;
                  const response = tq.studentResponse;
                  const isAnswered = response !== null && response?.userAnswer;
                  const isCorrect = response?.isCorrect;

                  // Extract multilingual content
                  let questionText = "";

                  if (typeof q.content === "object" && q.content !== null) {
                    questionText =
                      q.content[activeLang] || q.content["en"] || "";
                  } else if (typeof q.content === "string") {
                    questionText = q.content;
                  }

                  let solutionText = "";

                  if (typeof q.solution === "object" && q.solution !== null) {
                    solutionText =
                      q.solution[activeLang] || q.solution["en"] || "";
                  } else if (typeof q.solution === "string") {
                    solutionText = q.solution;
                  }

                  const options: any[] = Array.isArray(q.options)
                    ? q.options
                    : [];

                  return (
                    <Card
                      key={tq.id || idx}
                      className={`border transition-all ${
                        isAnswered && isCorrect
                          ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                          : isAnswered && !isCorrect
                            ? "border-destructive/30 bg-destructive/5 dark:bg-destructive/950/10"
                            : "border-border bg-card"
                      }`}
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Question Header */}
                        <div className="flex items-center justify-between gap-2 border-b pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Q{tq.orderIndex || idx + 1}
                            </span>
                            <Badge
                              className="text-[10px] font-normal"
                              variant="outline"
                            >
                              {q.type}
                            </Badge>
                            <Badge
                              className="text-[10px] font-normal"
                              variant="outline"
                            >
                              {q.difficulty}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            {isAnswered ? (
                              isCorrect ? (
                                <Badge className="bg-emerald-600 text-white text-[11px] gap-1">
                                  <CheckCircle2Icon className="h-3 w-3" />{" "}
                                  Correct (+{tq.positiveMarks})
                                </Badge>
                              ) : (
                                <Badge
                                  className="text-[11px] gap-1"
                                  variant="destructive"
                                >
                                  <XCircleIcon className="h-3 w-3" /> Incorrect
                                  (-{tq.negativeMarks})
                                </Badge>
                              )
                            ) : (
                              <Badge
                                className="text-[11px] gap-1"
                                variant="secondary"
                              >
                                <HelpCircleIcon className="h-3 w-3" />{" "}
                                Unattempted (0)
                              </Badge>
                            )}

                            {response?.timeTaken ? (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                                <ClockIcon className="h-3 w-3" />{" "}
                                {response.timeTaken}s
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Question Content */}
                        <div className="text-sm font-medium">
                          <MarkdownRenderer
                            content={questionText}
                            variant="question"
                          />
                        </div>

                        {/* Options List */}
                        {options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {options.map((opt: any, optIdx: number) => {
                              const optId =
                                opt.id || String.fromCharCode(65 + optIdx);
                              let optText = "";

                              if (
                                typeof opt.text === "object" &&
                                opt.text !== null
                              ) {
                                optText =
                                  opt.text[activeLang] || opt.text["en"] || "";
                              } else {
                                optText = opt.text || "";
                              }

                              const isStudentPick =
                                response?.userAnswer === optId;
                              const isCorrectOpt =
                                opt.isCorrect || q.correctValue === optId;

                              let optBorder = "border-border/60 bg-muted/20";

                              if (isCorrectOpt) {
                                optBorder =
                                  "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300";
                              } else if (isStudentPick && !isCorrectOpt) {
                                optBorder =
                                  "border-destructive bg-destructive/10 font-bold text-destructive";
                              }

                              return (
                                <div
                                  key={optId}
                                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${optBorder}`}
                                >
                                  <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-background border shrink-0">
                                    {optId}
                                  </span>
                                  <div className="flex-1">
                                    <MarkdownRenderer
                                      content={optText}
                                      variant="option"
                                    />
                                  </div>
                                  {isCorrectOpt && (
                                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                      Correct
                                    </span>
                                  )}
                                  {isStudentPick && !isCorrectOpt && (
                                    <span className="text-[10px] bg-destructive text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                      Student Answer
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Solution / Explanation */}
                        {solutionText && (
                          <div className="mt-2 p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
                            <p className="font-bold text-primary flex items-center gap-1">
                              <BookOpenIcon className="h-3.5 w-3.5" />{" "}
                              Explanation &amp; Solution:
                            </p>
                            <div className="text-muted-foreground">
                              <MarkdownRenderer
                                content={solutionText}
                                variant="analysis"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
