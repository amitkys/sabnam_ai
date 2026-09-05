"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ClockIcon,
  HelpCircleIcon,
  AwardIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  GlobeIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  Loader2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface AttemptPreflightProps {
  test: {
    title: string;
    description: string | null;
    duration: number;
    totalMarks: number;
    languages: string[];
    questions: any[];
  };
  onStart: (language: string) => Promise<void>;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  bn: "বাংলা",
  te: "తెలుగు",
  mr: "मराठी",
  ta: "தமிழ்",
  ur: "اردو",
};

export function AttemptPreflightScreen({
  test,
  onStart,
}: AttemptPreflightProps) {
  const [selectedLang, setSelectedLang] = useState(test.languages[0] ?? "en");
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = useCallback(async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      // Request fullscreen on user gesture
      if (
        typeof document !== "undefined" &&
        document.documentElement.requestFullscreen
      ) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (e) {
          console.warn("Fullscreen request ignored or failed", e);
        }
      }
      await onStart(selectedLang);
    } catch (error) {
      console.error("Failed to start test:", error);
      setIsStarting(false);
    }
  }, [isStarting, onStart, selectedLang]);

  // Support pressing Enter key to quickly begin the test
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isStarting) {
        e.preventDefault();
        handleStart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStart, isStarting]);

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-3">
        {/* Top Navigation & Status */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to tests</span>
          </Link>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheckIcon className="h-3 w-3 text-emerald-500" />
            Ready to Begin
          </span>
        </div>

        {/* Minimalist Card Container */}
        <div className="bg-card border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {test.title}
            </h1>
            {test.description ? (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {test.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Review the test details and instructions below to begin.
              </p>
            )}
          </div>

          {/* Micro Stats Strip */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/50 text-center">
            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <ClockIcon className="h-3 w-3" />
                <span>Duration</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {test.duration} mins
              </p>
            </div>

            <div className="space-y-0.5 border-x border-border/60">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <HelpCircleIcon className="h-3 w-3" />
                <span>Questions</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {test.questions?.length ?? 0} Qs
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <AwardIcon className="h-3 w-3" />
                <span>Total Marks</span>
              </div>
              <p className="text-xs font-semibold text-foreground">
                {test.totalMarks}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <GlobeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Language
              </span>
              {test.languages.length <= 1 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {LANGUAGE_LABELS[test.languages[0]] || test.languages[0] || "English"}
                </span>
              )}
            </div>

            {test.languages.length > 1 && (
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted/50 border">
                {test.languages.map((lang) => {
                  const isActive = selectedLang === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${isActive
                          ? "bg-card text-foreground shadow-xs border font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {isActive && (
                        <CheckCircle2Icon className="h-3 w-3 text-primary" />
                      )}
                      <span>{LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compact Instructions */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1.5">
            <p className="text-[11px] font-semibold text-foreground">
              Key Instructions
            </p>
            <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                <span>The test runs in distraction-free fullscreen mode.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                <span>Answers sync continuously in real-time as you attempt questions.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                <span>The test automatically submits when the duration expires.</span>
              </li>
            </ul>
          </div>

          {/* Action CTA */}
          <div className="space-y-2 pt-1">
            <Button
              className="w-full h-9 text-xs font-semibold gap-1.5 shadow-xs"
              onClick={handleStart}
              disabled={isStarting}
            >
              {isStarting ? (
                <>
                  <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                  <span>Starting test...</span>
                </>
              ) : (
                <>
                  <span>Start Test</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </>
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              Press <kbd className="px-1 py-0.5 text-[9px] font-mono bg-muted rounded border">Enter ↵</kbd> to start immediately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
