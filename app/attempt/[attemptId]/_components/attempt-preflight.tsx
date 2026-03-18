"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Globe,
  Wifi,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Languages,
} from "lucide-react";

interface AttemptPreflightProps {
  test: {
    title: string;
    description: string | null;
    duration: number;
    totalMarks: number;
    languages: string[];
    questions: any[];
  };
  onStart: (language: string) => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "हिन्दी (Hindi)",
  bn: "বাংলা (Bengali)",
  te: "తెలుగు (Telugu)",
  mr: "मराठी (Marathi)",
  ta: "தமிழ் (Tamil)",
  ur: "اردو (Urdu)",
};

const WARNINGS = [
  {
    icon: <Wifi className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    text: "Ensure a stable internet connection — answers sync live. A brief disconnection won't lose your progress, but a long one might.",
  },
  {
    icon: <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    text: "Do not refresh or close the tab during the test. Your timer keeps running even if you leave.",
  },
  {
    icon: <RefreshCw className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    text: "If you exit accidentally, you can resume from the same question using the same link.",
  },
  {
    icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    text: "The test auto-submits when time runs out. Make sure to answer all questions before the timer ends.",
  },
];

export function AttemptPreflightScreen({ test, onStart }: AttemptPreflightProps) {
  const [selectedLang, setSelectedLang] = useState(test.languages[0] ?? "en");
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    // Request fullscreen immediately on click
    if (typeof document !== "undefined" && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {
        console.warn("Fullscreen request failed", e);
      }
    }
    // Inform the parent component to transition the view
    onStart(selectedLang);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4">
      <div className="max-w-2xl w-full bg-card border shadow-lg rounded-xl overflow-hidden p-6 md:p-8">
        
        <div className="space-y-2 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">{test.title}</h1>
          {test.description && (
            <p className="text-muted-foreground">{test.description}</p>
          )}
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard icon={<Clock className="w-5 h-5" />} label="Duration" value={`${test.duration} min`} />
          <StatCard icon={<BookOpen className="w-5 h-5" />} label="Marks" value={`${test.totalMarks}`} />
          <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Questions" value={`${test.questions.length}`} />
        </div>

        <Separator className="my-6" />

        <div className="grid md:grid-cols-2 gap-8">
          {/* ── Language Selection ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Languages className="w-4 h-4 text-primary" />
              Select Language
            </h3>
            
            {test.languages.length > 1 ? (
              <div className="flex flex-col gap-2">
                {test.languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-4 py-3 rounded-md text-sm font-medium border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selectedLang === lang
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background border rounded-md p-3">
                <Globe className="w-4 h-4 text-primary" />
                Medium:{" "}
                <Badge variant="secondary" className="uppercase text-xs ml-auto">
                  {LANGUAGE_LABELS[test.languages[0]] ?? test.languages[0]}
                </Badge>
              </div>
            )}
          </div>

          {/* ── Important Warnings ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Before You Start
            </h3>
            <ul className="space-y-3">
              {WARNINGS.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  {w.icon}
                  <span>{w.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <Button
            size="lg"
            onClick={handleStart}
            disabled={isStarting}
            className="w-full sm:w-auto px-12 text-lg shadow-md hover:shadow-lg transition-all"
          >
            {isStarting ? "Starting Test…" : "I'm Ready, Start Test →"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 sm:mt-0 sm:absolute sm:opacity-0">Enters fullscreen</p>
        </div>

      </div>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background border shadow-sm text-center">
      <div className="p-2 rounded-full bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}
