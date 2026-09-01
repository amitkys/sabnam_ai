"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrinterIcon, QrCodeIcon } from "lucide-react";
import { IResultData } from "@/hooks/query/get/use-result";
import QRCode from "qrcode";

interface TestReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: IResultData;
}

/**
 * Build a fully self-contained HTML string for the test report.
 * Loads Space Grotesk from Google Fonts CDN so the font is always available,
 * uses only inline styles — no dependency on the app's Tailwind / CSS variables.
 */
function buildPrintHTML({
  userName,
  userEmail,
  testTitle,
  categoryHierarchy,
  attemptId,
  attemptStatus,
  attemptDateStr,
  duration,
  timeSpentStr,
  totalMarks,
  score,
  percentage,
  accuracy,
  totalQuestions,
  attemptedQuestions,
  correctAnswers,
  incorrectAnswers,
  skippedQuestions,
  qrCodeUrl,
}: {
  userName: string;
  userEmail: string;
  testTitle: string;
  categoryHierarchy: string;
  attemptId: string;
  attemptStatus: string;
  attemptDateStr: string;
  duration: number;
  timeSpentStr: string;
  totalMarks: number;
  score: number;
  percentage: string;
  accuracy: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  qrCodeUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report — ${testTitle}</title>
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
      <div style="text-align:right"><span class="status-badge">${attemptStatus}</span><div class="attempt-id">ID: ${attemptId.slice(0, 14)}</div></div>
    </div>
    <div class="details-grid">
      <div class="details-col">
        <div class="detail-row"><span class="detail-label">Candidate Name</span><span class="detail-value">${userName}</span></div>
        <div class="detail-row"><span class="detail-label">Email Address</span><span class="detail-value mono">${userEmail}</span></div>
        <div class="detail-row"><span class="detail-label">Date of Examination</span><span class="detail-value">${attemptDateStr}</span></div>
      </div>
      <div class="details-col">
        <div class="detail-row"><span class="detail-label">Test Series Title</span><span class="detail-value">${testTitle}</span></div>
        <div class="detail-row"><span class="detail-label">Exam Hierarchy</span><span class="detail-value">${categoryHierarchy}</span></div>
        <div class="detail-row"><span class="detail-label">Time Duration</span><span class="detail-value">${duration}m (Spent: ${timeSpentStr})</span></div>
      </div>
    </div>
    <div class="section-title">Score &amp; Performance Summary</div>
    <table class="score-table">
      <thead><tr><th>Max Marks</th><th>Score Obtained</th><th>Percentage</th><th>Accuracy</th><th>Total Questions</th><th>Attempted</th></tr></thead>
      <tbody><tr><td>${totalMarks}</td><td>${score}</td><td>${percentage}%</td><td>${accuracy}%</td><td>${totalQuestions}</td><td>${attemptedQuestions}</td></tr></tbody>
    </table>
    <div class="breakdown-grid">
      <div class="breakdown-card"><span class="card-label">Correct</span><span class="card-value">${correctAnswers}</span></div>
      <div class="breakdown-card"><span class="card-label">Incorrect</span><span class="card-value">${incorrectAnswers}</span></div>
      <div class="breakdown-card"><span class="card-label">Skipped</span><span class="card-value">${skippedQuestions}</span></div>
    </div>
    <div class="qr-section">
      <div><div class="qr-label">Scan to View Full Questions &amp; Analysis</div><div class="attempt-id">Verification ID: ${attemptId}</div></div>
      ${qrCodeUrl ? `<div class="qr-img-wrap"><img src="${qrCodeUrl}" /></div>` : ""}
    </div>
    <div class="doc-footer"><span>Generated by Sabnam AI Examination Engine</span><span>Document Authenticity Verified</span></div>
  </div>
</body>
</html>`;
}

export function TestReportModal({ open, onOpenChange, data }: TestReportModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const { attempt, testPaper, questions, user, categoryHierarchy } = data;

  const totalQuestions = questions.length;
  const attemptedQuestions = questions.filter((q) => q.studentResponse !== null).length;
  const correctAnswers = questions.filter((q) => q.studentResponse?.isCorrect).length;
  const incorrectAnswers = attemptedQuestions - correctAnswers;
  const skippedQuestions = totalQuestions - attemptedQuestions;

  const accuracy = attemptedQuestions > 0 ? ((correctAnswers / attemptedQuestions) * 100).toFixed(1) : "0.0";
  const percentage = testPaper.totalMarks > 0 ? (((attempt.score || 0) / testPaper.totalMarks) * 100).toFixed(1) : "0.0";

  let timeSpentStr = "0 min";
  if (attempt.startedAt && attempt.submittedAt) {
    const diffSec = Math.floor((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000);
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    timeSpentStr = `${m}m ${s}s`;
  }

  const attemptDateStr = attempt.submittedAt
    ? new Date(attempt.submittedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : new Date(attempt.startedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Generate QR code for the current result URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      QRCode.toDataURL(url, {
        width: 140,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      })
        .then((dataUri) => setQrCodeUrl(dataUri))
        .catch((err) => console.error("Failed to generate QR code:", err));
    }
  }, [attempt.id]);

  const handlePrint = () => {
    const html = buildPrintHTML({
      userName: user?.name || "Student",
      userEmail: user?.email || "N/A",
      testTitle: testPaper.title,
      categoryHierarchy: categoryHierarchy || "General Assessment",
      attemptId: attempt.id,
      attemptStatus: attempt.status,
      attemptDateStr,
      duration: testPaper.duration,
      timeSpentStr,
      totalMarks: testPaper.totalMarks,
      score: attempt.score !== null ? attempt.score : 0,
      percentage,
      accuracy,
      totalQuestions,
      attemptedQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      qrCodeUrl,
    });

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      // Wait for the Google Font to load, then trigger print
      printWin.onload = () => {
        setTimeout(() => {
          printWin.print();
        }, 500);
      };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background">
        {/* Header with Print Action */}
        <DialogHeader className="p-3.5 border-b flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="text-base font-bold">Official Test Performance Report</DialogTitle>
            <DialogDescription className="text-xs">
              Single-page official examination certificate &amp; summary with QR verification.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1.5 font-bold"
            >
              <PrinterIcon className="h-3.5 w-3.5" />
              Print / Save as PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Report Preview (matches the print output layout) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white text-black font-sans">
          {/* Document Header */}
          <div className="border-b-2 border-black pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-brand tracking-normal text-black">
                Sabnam AI — Test Report
              </h1>
              <p className="text-xs text-gray-700 tracking-wide mt-0.5">
                Official Examination Assessment &amp; Performance Evaluation
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 text-xs font-bold border border-black uppercase">
                {attempt.status === "COMPLETED" ? "COMPLETED" : attempt.status}
              </span>
              <p className="text-[11px] text-gray-600 mt-1 font-mono">
                ID: {attempt.id.slice(0, 14)}
              </p>
            </div>
          </div>

          {/* Section 1: Candidate & Examination Details (2 Columns) */}
          <div className="grid grid-cols-2 gap-4 border border-black p-3.5 text-xs bg-gray-50/50">
            <div className="space-y-1.5">
              <div>
                <span className="font-bold text-gray-600 block text-[10px] uppercase">Candidate Name</span>
                <span className="font-semibold text-black text-sm">{user?.name || "Student"}</span>
              </div>
              <div>
                <span className="font-bold text-gray-600 block text-[10px] uppercase">Email Address</span>
                <span className="font-mono text-gray-900">{user?.email || "N/A"}</span>
              </div>
              <div>
                <span className="font-bold text-gray-600 block text-[10px] uppercase">Date of Examination</span>
                <span className="text-gray-900">{attemptDateStr}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-l border-gray-300 pl-4">
              <div>
                <span className="font-bold text-gray-600 block text-[10px] uppercase">Test Series Title</span>
                <span className="font-bold text-black text-sm">{testPaper.title}</span>
              </div>
              <div>
                <span className="font-bold text-gray-600 block text-[10px] uppercase">Exam Hierarchy</span>
                <span className="text-gray-900 font-medium">
                  {categoryHierarchy || "General Assessment"}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-600 block text-[10px] uppercase">Time Duration</span>
                <span className="text-gray-900">{testPaper.duration} minutes (Spent: {timeSpentStr})</span>
              </div>
            </div>
          </div>

          {/* Section 2: Performance Summary Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1.5">
              Score &amp; Performance Summary
            </h2>
            <table className="w-full text-xs border border-black border-collapse text-left">
              <thead>
                <tr className="bg-gray-100 text-black font-bold border-b border-black">
                  <th className="p-2 border border-black">Max Marks</th>
                  <th className="p-2 border border-black">Score Obtained</th>
                  <th className="p-2 border border-black">Percentage</th>
                  <th className="p-2 border border-black">Accuracy</th>
                  <th className="p-2 border border-black">Total Questions</th>
                  <th className="p-2 border border-black">Attempted</th>
                </tr>
              </thead>
              <tbody className="font-medium text-black">
                <tr className="border-b border-black">
                  <td className="p-2 border border-black font-mono">{testPaper.totalMarks}</td>
                  <td className="p-2 border border-black font-bold font-mono text-sm">
                    {attempt.score !== null ? attempt.score : 0}
                  </td>
                  <td className="p-2 border border-black font-bold font-mono">{percentage}%</td>
                  <td className="p-2 border border-black font-bold font-mono">{accuracy}%</td>
                  <td className="p-2 border border-black font-mono">{totalQuestions}</td>
                  <td className="p-2 border border-black font-mono">{attemptedQuestions}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Attempt Breakdown Summary */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="border border-black p-3 bg-gray-50/40">
              <span className="block text-[10px] uppercase font-bold text-gray-600">Correct Answers</span>
              <span className="text-xl font-black text-black font-mono mt-0.5 block">{correctAnswers}</span>
            </div>
            <div className="border border-black p-3 bg-gray-50/40">
              <span className="block text-[10px] uppercase font-bold text-gray-600">Incorrect Answers</span>
              <span className="text-xl font-black text-black font-mono mt-0.5 block">{incorrectAnswers}</span>
            </div>
            <div className="border border-black p-3 bg-gray-50/40">
              <span className="block text-[10px] uppercase font-bold text-gray-600">Skipped / Unattempted</span>
              <span className="text-xl font-black text-black font-mono mt-0.5 block">{skippedQuestions}</span>
            </div>
          </div>

          {/* Section 4: QR Code & Verification */}
          <div className="border border-black p-4 flex items-center justify-between gap-4 bg-gray-50/60">
            <div className="space-y-1.5 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <QrCodeIcon className="h-4 w-4" />
                Scan to View Full Questions &amp; Analysis
              </p>
              <p className="text-[10px] text-gray-500 font-mono break-all pt-0.5">
                Verification ID: {attempt.id}
              </p>
            </div>

            {qrCodeUrl && (
              <div className="shrink-0 p-1 border border-black bg-white">
                <img src={qrCodeUrl} alt="Result QR Code" className="w-24 h-24 block" />
              </div>
            )}
          </div>

          {/* Document Footer */}
          <div className="pt-3 border-t border-gray-400 flex items-center justify-between text-[10px] text-gray-600">
            <span>Generated by Sabnam AI Examination Engine</span>
            <span>Document Authenticity Verified • Official Record</span>
          </div>
        </div>

        <DialogFooter className="p-3 border-t bg-muted/20 flex items-center justify-between">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          <Button type="button" size="sm" onClick={handlePrint} className="gap-1.5 font-bold">
            <PrinterIcon className="h-3.5 w-3.5" />
            Print / Save as PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

