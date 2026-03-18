"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    icon: <Wifi className="w-5 h-5 text-warning-color shrink-0" />,
    text: "Live syncing. A brief disconnection won't lose your progress, but a long one might.",
  },
  {
    icon: <ShieldAlert className="w-5 h-5 text-warning-color shrink-0" />,
    text: "Do not refresh or close. Your timer keeps running even if you leave the tab.",
  },
  {
    icon: <RefreshCw className="w-5 h-5 text-warning-color shrink-0" />,
    text: "If you exit accidentally, you can resume from where you left using the same link.",
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-warning-color shrink-0" />,
    text: "Auto-সাবমিট (submits) when time runs out. Answer everything before the timer ends.",
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
    <div className="flex flex-col items-center justify-center min-h-dvh bg-linear-to-br from-background via-muted/30 to-background p-4 sm:p-6 lg:p-8">
      <div className="relative w-full max-w-6xl transition-all duration-300">
        {/* Subtle glow effect behind the card */}
        <div className="absolute -inset-1 bg-linear-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl blur opacity-60"></div>

        <div className="relative bg-card/90 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl overflow-hidden p-6 sm:p-8 lg:p-10">

          <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 lg:gap-12">

            {/* ── Left Side: Title, Stats, Warnings ── */}
            <div className="flex flex-col">
              <div className="space-y-3 mb-8 text-left">
                <h1 className="text-h2 md:text-h1 text-primary leading-tight">{test.title}</h1>
                {test.description && (
                  <p className="text-lead">{test.description}</p>
                )}
              </div>

              {/* ── Quick Stats ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                <StatCard icon={<Clock className="w-6 h-6" />} label="Duration" value={`${test.duration} min`} />
                <StatCard icon={<BookOpen className="w-6 h-6" />} label="Marks" value={`${test.totalMarks}`} />
                <StatCard icon={<CheckCircle2 className="w-6 h-6" />} label="Questions" value={`${test.questions.length}`} />
              </div>

              {/* ── Important Warnings ── */}
              <div className="space-y-4 mt-auto">
                <h3 className="text-h4 flex items-center gap-2 text-warning-color mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  Before You Start
                </h3>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                  {WARNINGS.map((w, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20">
                        {w.icon}
                      </div>
                      <span className="text-small text-muted-foreground leading-relaxed">{w.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Right Side: Language & Start Action ── */}
            <div className="flex flex-col space-y-8 bg-muted/20 p-6 lg:p-8 rounded-2xl border border-border/50 shadow-inner h-full">
              {/* ── Language Selection ── */}
              <div className="flex-1 space-y-5">
                <h3 className="text-h4 flex items-center gap-2 mb-2">
                  <Languages className="w-5 h-5 text-primary" />
                  Select Language
                </h3>

                {test.languages.length > 1 ? (
                  <div className="flex flex-col gap-3">
                    {test.languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLang(lang)}
                        className={`relative w-full px-5 py-4 rounded-xl text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedLang === lang
                          ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/50"
                          : "bg-background text-foreground border border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-large font-medium">{LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}</span>
                          {selectedLang === lang && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20">
                              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-background border border-border/50 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <span className="text-large font-medium">Medium</span>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 bg-muted uppercase shadow-sm text-small">
                      {LANGUAGE_LABELS[test.languages[0]] ?? test.languages[0]}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Start Action */}
              <div className="pt-6 border-t border-border/50 flex flex-col items-center">
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={isStarting}
                  className="w-full py-7 text-sm md:text-lg font-bold"
                >
                  {isStarting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                      Starting Test…
                    </span>
                  ) : (
                    "I'm Ready, Start Test →"
                  )}
                </Button>
                <p className="text-xs-text text-muted-foreground mt-4 opacity-80 font-medium">
                  Test will open in fullscreen mode
                </p>
              </div>
            </div>

          </div>

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
    <div className="group flex flex-col items-start gap-4 p-5 sm:p-6 rounded-2xl bg-background/50 border border-border/40 shadow-sm transition-all duration-300 hover:bg-background hover:shadow-md hover:-translate-y-1">
      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-inner">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-xs-text text-muted-foreground uppercase opacity-90 tracking-widest font-semibold">{label}</div>
        <div className="text-h2 text-foreground">{value}</div>
      </div>
    </div>
  );
}
