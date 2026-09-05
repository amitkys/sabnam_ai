"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShuffleIcon,
  PercentIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  SparklesIcon,
  CalculatorIcon,
} from "lucide-react";
import {
  getAnswerDistributionInJson,
  shuffleAnswersInJson,
  applyBulkMarksInJson,
} from "@/lib/question-parser";

interface ShuffleMarksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jsonInput: string;
  onApplyJson: (newJson: string, message: string) => void;
}

export function ShuffleMarksDialog({
  open,
  onOpenChange,
  jsonInput,
  onApplyJson,
}: ShuffleMarksDialogProps) {
  const [activeTab, setActiveTab] = useState<"shuffle" | "marks">("shuffle");

  // --- Shuffle State ---
  const [weights, setWeights] = useState<{ A: number; B: number; C: number; D: number }>({
    A: 25,
    B: 25,
    C: 25,
    D: 25,
  });
  const [currentDist, setCurrentDist] = useState<{
    A: number;
    B: number;
    C: number;
    D: number;
    other: number;
    total: number;
  }>({ A: 0, B: 0, C: 0, D: 0, other: 0, total: 0 });

  // --- Marks State ---
  const [positiveMarks, setPositiveMarks] = useState<number>(1);
  const [negativePercentage, setNegativePercentage] = useState<number>(25);
  const [customPenaltyPercent, setCustomPenaltyPercent] = useState<string>("25");

  // Status message in modal
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Recalculate distribution whenever dialog opens or jsonInput changes
  useEffect(() => {
    if (open) {
      const dist = getAnswerDistributionInJson(jsonInput);
      setCurrentDist(dist);
      setActionSuccess(null);
      setActionError(null);
    }
  }, [open, jsonInput]);

  const totalWeight = weights.A + weights.B + weights.C + weights.D;
  const isWeightValid = totalWeight > 0;

  // Calculated count preview for each letter
  const totalMCQs = currentDist.A + currentDist.B + currentDist.C + currentDist.D;
  const countA = isWeightValid ? Math.round((weights.A / totalWeight) * totalMCQs) : 0;
  const countB = isWeightValid ? Math.round((weights.B / totalWeight) * totalMCQs) : 0;
  const countC = isWeightValid ? Math.round((weights.C / totalWeight) * totalMCQs) : 0;
  const countD = Math.max(0, totalMCQs - (countA + countB + countC));

  // Calculated negative marks
  const calculatedPenalty =
    Math.round(positiveMarks * (negativePercentage / 100) * 100) / 100;

  const handleShuffle = () => {
    setActionError(null);
    setActionSuccess(null);

    const res = shuffleAnswersInJson(jsonInput, weights);
    if (res.success && res.newJson) {
      const msg = `Shuffled answers: A: ${res.stats?.A}, B: ${res.stats?.B}, C: ${res.stats?.C}, D: ${res.stats?.D}`;
      setActionSuccess(msg);
      onApplyJson(res.newJson, msg);
      setCurrentDist(getAnswerDistributionInJson(res.newJson));
    } else {
      setActionError(res.error || "Failed to shuffle answers");
    }
  };

  const handleApplyMarks = () => {
    setActionError(null);
    setActionSuccess(null);

    const res = applyBulkMarksInJson(jsonInput, positiveMarks, negativePercentage);
    if (res.success && res.newJson) {
      const msg = `Updated ${res.updatedCount} questions: +${positiveMarks} / -${res.negativeMarks} marks (${negativePercentage}%)`;
      setActionSuccess(msg);
      onApplyJson(res.newJson, msg);
    } else {
      setActionError(res.error || "Failed to update marks");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 bg-muted/30 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Test Question Tools & Bulk Modifiers
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Shuffle correct answer options or bulk configure positive and negative marks.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="shuffle" className="text-xs gap-1.5 font-semibold">
                <ShuffleIcon className="h-3.5 w-3.5" />
                Shuffle Answer Keys
              </TabsTrigger>
              <TabsTrigger value="marks" className="text-xs gap-1.5 font-semibold">
                <CalculatorIcon className="h-3.5 w-3.5" />
                Marks & Negative %
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: SHUFFLE ANSWERS */}
            <TabsContent value="shuffle" className="space-y-4 pt-3 mt-0">
              {/* Current Distribution */}
              <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Current Answer Distribution</span>
                  <span className="font-mono text-[11px]">{currentDist.total} Questions</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["A", "B", "C", "D"] as const).map((letter) => {
                    const count = currentDist[letter];
                    const pct =
                      totalMCQs > 0 ? Math.round((count / totalMCQs) * 100) : 0;
                    return (
                      <div
                        key={letter}
                        className="flex flex-col items-center p-2 rounded-lg border bg-background text-center shadow-xs"
                      >
                        <span className="text-[11px] font-bold text-muted-foreground">
                          Option {letter}
                        </span>
                        <span className="text-base font-extrabold text-foreground mt-0.5">
                          {count}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 mt-1 font-mono font-bold"
                        >
                          {pct}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                {totalMCQs > 0 && currentDist.A / totalMCQs >= 0.6 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium pt-1">
                    <AlertCircleIcon className="h-3 w-3 shrink-0" />
                    Option A holds {Math.round((currentDist.A / totalMCQs) * 100)}% of correct answers. Shuffling will randomize correct answers across choices.
                  </p>
                )}
              </div>

              {/* Target Distribution Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">
                    Target Distribution Percentages
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWeights({ A: 25, B: 25, C: 25, D: 25 })}
                      className="text-[10px] h-6 px-2"
                    >
                      Even (25% each)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWeights({ A: 20, B: 30, C: 25, D: 25 })}
                      className="text-[10px] h-6 px-2"
                    >
                      20 / 30 / 25 / 25
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {(["A", "B", "C", "D"] as const).map((letter) => {
                    const expectedCount =
                      letter === "A"
                        ? countA
                        : letter === "B"
                        ? countB
                        : letter === "C"
                        ? countC
                        : countD;

                    return (
                      <div
                        key={letter}
                        className="flex flex-col p-2.5 rounded-lg border bg-card space-y-1.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">
                            Option {letter}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            ~{expectedCount} Qs
                          </span>
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={weights[letter]}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setWeights((prev) => ({ ...prev, [letter]: val }));
                            }}
                            className="text-xs h-8 pr-6 font-mono font-semibold"
                          />
                          <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">
                            %
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>
                    Total weight:{" "}
                    <strong
                      className={
                        totalWeight === 100
                          ? "text-emerald-600 font-bold"
                          : "text-amber-600 font-bold"
                      }
                    >
                      {totalWeight}%
                    </strong>{" "}
                    {totalWeight !== 100 && "(will be automatically normalized)"}
                  </span>
                  <span>Applies to {totalMCQs} MCQ questions</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleShuffle}
                  disabled={totalMCQs === 0 || !isWeightValid}
                  className="w-full text-xs font-bold h-9 gap-1.5 shadow-xs"
                >
                  <ShuffleIcon className="h-3.5 w-3.5" />
                  Shuffle Answer Options Now
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: BULK MARKS & NEGATIVE % */}
            <TabsContent value="marks" className="space-y-4 pt-3 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Positive Marks */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">
                    Positive Marks (Per Question)
                  </Label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((m) => (
                      <Button
                        key={m}
                        type="button"
                        variant={positiveMarks === m ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPositiveMarks(m)}
                        className="text-xs h-8 flex-1 font-semibold"
                      >
                        +{m}
                      </Button>
                    ))}
                  </div>
                  <div className="relative pt-1">
                    <Input
                      type="number"
                      step={0.5}
                      min={0}
                      value={positiveMarks}
                      onChange={(e) =>
                        setPositiveMarks(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      placeholder="Custom marks"
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                </div>

                {/* Negative Percentage */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">
                    Negative Marking Penalty
                  </Label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { label: "0% (None)", pct: 0 },
                      { label: "25% (1/4)", pct: 25 },
                      { label: "33% (1/3)", pct: 33.33 },
                    ].map((p) => (
                      <Button
                        key={p.pct}
                        type="button"
                        variant={negativePercentage === p.pct ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setNegativePercentage(p.pct);
                          setCustomPenaltyPercent(String(p.pct));
                        }}
                        className="text-[10px] h-8 px-1 font-semibold truncate"
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <Button
                      type="button"
                      variant={negativePercentage === 50 ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setNegativePercentage(50);
                        setCustomPenaltyPercent("50");
                      }}
                      className="text-[10px] h-8 font-semibold"
                    >
                      50% (1/2 penalty)
                    </Button>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={customPenaltyPercent}
                        onChange={(e) => {
                          setCustomPenaltyPercent(e.target.value);
                          setNegativePercentage(Math.max(0, parseFloat(e.target.value) || 0));
                        }}
                        placeholder="Custom %"
                        className="text-xs h-8 pr-6 font-mono font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Calculation */}
              <div className="rounded-xl border bg-card p-3.5 space-y-2 shadow-xs">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CalculatorIcon className="h-3.5 w-3.5 text-primary" />
                  Score Calculation Preview
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                      Correct Answer
                    </span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{positiveMarks} mark{positiveMarks !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">
                      Wrong Answer ({negativePercentage}%)
                    </span>
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                      -{calculatedPenalty} mark{calculatedPenalty !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-muted/40 border text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-muted-foreground font-semibold block">
                      Test Total ({currentDist.total} Qs)
                    </span>
                    <span className="text-sm font-extrabold text-foreground">
                      {positiveMarks * currentDist.total} marks
                    </span>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleApplyMarks}
                  disabled={currentDist.total === 0}
                  className="w-full text-xs font-bold h-9 gap-1.5 shadow-xs"
                >
                  <PercentIcon className="h-3.5 w-3.5" />
                  Apply Marks & Negative Penalty to All Questions
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Status feedback */}
          {actionSuccess && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in duration-200">
              <CheckCircle2Icon className="h-4 w-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}
          {actionError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium animate-in fade-in duration-200">
              <AlertCircleIcon className="h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
