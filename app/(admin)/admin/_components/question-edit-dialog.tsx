"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Edit2Icon,
  SparklesIcon,
  PlusIcon,
  Trash2Icon,
  CheckIcon,
  Loader2Icon,
  AlertCircleIcon,
  EyeIcon,
  CodeIcon,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import { QuestionType, Difficulty } from "@/lib/generated/prisma/enums";
import { updateQuestionDetailAction } from "@/lib/action/admin/test-series-builder-actions";
import { NormalizedOption } from "@/lib/question-parser";
import { cn } from "@/lib/utils";

interface QuestionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionWrapper: any; // { id, testPaperId, positiveMarks, negativeMarks, question: {...} }
  testPaperId?: string;
  onSuccess: () => void;
}

export function QuestionEditDialog({
  open,
  onOpenChange,
  questionWrapper,
  testPaperId,
  onSuccess,
}: QuestionEditDialogProps) {
  const q = questionWrapper?.question || questionWrapper;

  // Form states
  const [contentEn, setContentEn] = useState("");
  const [contentHi, setContentHi] = useState("");
  const [solutionEn, setSolutionEn] = useState("");
  const [solutionHi, setSolutionHi] = useState("");
  const [type, setType] = useState<QuestionType>(QuestionType.MCQ_SINGLE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [positiveMarks, setPositiveMarks] = useState<number>(1);
  const [negativeMarks, setNegativeMarks] = useState<number>(0);
  const [options, setOptions] = useState<NormalizedOption[]>([]);
  const [correctValue, setCorrectValue] = useState<string>("");

  // Preview & Tab states
  const [activeLangTab, setActiveLangTab] = useState<"en" | "hi">("en");
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize data on open
  useEffect(() => {
    if (open && q) {
      const content = typeof q.content === "object" && q.content !== null ? q.content : { en: String(q.content || ""), hi: String(q.content || "") };
      setContentEn(content.en || "");
      setContentHi(content.hi || content.en || "");

      const sol = q.solution && typeof q.solution === "object" ? q.solution : { en: String(q.solution || ""), hi: String(q.solution || "") };
      setSolutionEn(sol.en || "");
      setSolutionHi(sol.hi || sol.en || "");

      setType(q.type || QuestionType.MCQ_SINGLE);
      setDifficulty(q.difficulty || Difficulty.MEDIUM);

      const pos = questionWrapper?.positiveMarks ?? q.positiveMarks ?? 1;
      const neg = questionWrapper?.negativeMarks ?? q.negativeMarks ?? 0;
      setPositiveMarks(pos);
      setNegativeMarks(neg);

      // Options
      const rawOpts = Array.isArray(q.options) ? q.options : [];
      const normalizedOpts: NormalizedOption[] = rawOpts.map((opt: any, idx: number) => {
        const id = opt.id || String.fromCharCode(65 + idx);
        const text = typeof opt.text === "object" ? opt.text : { en: String(opt.text || opt), hi: String(opt.text || opt) };
        const isCorrect = opt.isCorrect ?? (q.correctValue === id);
        return {
          id,
          text: { en: text.en || "", hi: text.hi || text.en || "" },
          isCorrect: Boolean(isCorrect),
        };
      });

      setOptions(normalizedOpts);
      setCorrectValue(q.correctValue || (normalizedOpts.find((o) => o.isCorrect)?.id || ""));
      setError(null);
    }
  }, [open, q, questionWrapper]);

  // Handle Option Toggle
  const handleToggleCorrectOption = (optId: string) => {
    if (type === QuestionType.MCQ_MULTIPLE) {
      const updated = options.map((opt) =>
        opt.id === optId ? { ...opt, isCorrect: !opt.isCorrect } : opt
      );
      setOptions(updated);
      const corrects = updated.filter((o) => o.isCorrect).map((o) => o.id).join(",");
      setCorrectValue(corrects);
    } else {
      // Single choice
      const updated = options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optId,
      }));
      setOptions(updated);
      setCorrectValue(optId);
    }
  };

  const handleOptionTextChange = (optId: string, lang: "en" | "hi", val: string) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optId ? { ...opt, text: { ...opt.text, [lang]: val } } : opt
      )
    );
  };

  const handleAddOption = () => {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const nextLetter = letters[options.length] || String(options.length + 1);
    setOptions((prev) => [
      ...prev,
      {
        id: nextLetter,
        text: { en: "", hi: "" },
        isCorrect: false,
      },
    ]);
  };

  const handleRemoveOption = (optId: string) => {
    setOptions((prev) => {
      const remaining = prev.filter((o) => o.id !== optId);
      const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
      return remaining.map((o, idx) => ({ ...o, id: letters[idx] || String(idx + 1) }));
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contentEn.trim() && !contentHi.trim()) {
      setError("Question content cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      const effectiveTestPaperId = testPaperId || questionWrapper?.testPaperId;

      const res = await updateQuestionDetailAction({
        questionId: q.id,
        testPaperId: effectiveTestPaperId,
        content: {
          en: contentEn.trim() || contentHi.trim(),
          hi: contentHi.trim() || contentEn.trim(),
        },
        type,
        difficulty,
        options,
        correctValue: correctValue || options.find((o) => o.isCorrect)?.id || "A",
        solution: {
          en: solutionEn.trim(),
          hi: solutionHi.trim(),
        },
        positiveMarks: Number(positiveMarks),
        negativeMarks: Number(negativeMarks),
      });

      if (res.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(res.error || "Failed to update question");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-2.5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Edit2Icon className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Edit Question & Options</DialogTitle>
                <DialogDescription className="text-xs">
                  Modify question markdown text, formulas, options, correct answers, and solution.
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="text-xs h-7 gap-1.5 font-semibold"
            >
              {previewMode ? (
                <>
                  <CodeIcon className="h-3.5 w-3.5 text-primary" /> Edit Mode
                </>
              ) : (
                <>
                  <EyeIcon className="h-3.5 w-3.5 text-primary" /> Live Preview
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Top Config Row: Type, Difficulty, Marks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/20 border">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Question Type</Label>
              <Select value={type} onValueChange={(val) => setType(val as QuestionType)}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value={QuestionType.MCQ_SINGLE}>Single Choice (MCQ)</SelectItem>
                  <SelectItem value={QuestionType.MCQ_MULTIPLE}>Multiple Choice (MCQ)</SelectItem>
                  <SelectItem value={QuestionType.NUMERICAL}>Numerical Answer</SelectItem>
                  <SelectItem value={QuestionType.INTEGER}>Integer Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Difficulty</Label>
              <Select value={difficulty} onValueChange={(val) => setDifficulty(val as Difficulty)}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value={Difficulty.EASY}>Easy</SelectItem>
                  <SelectItem value={Difficulty.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={Difficulty.HARD}>Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Positive Marks (+)</Label>
              <Input
                type="number"
                step="any"
                min={0}
                value={positiveMarks}
                onChange={(e) => setPositiveMarks(parseFloat(e.target.value) || 0)}
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Negative Marks (-)</Label>
              <Input
                type="number"
                step="any"
                min={0}
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
                className="text-xs h-8"
              />
            </div>
          </div>

          {/* Live Preview Mode or Edit Mode */}
          {previewMode ? (
            <div className="space-y-4 p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-xs font-bold text-foreground">Rendered KaTeX Preview</span>
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveLangTab("en")}
                    className={cn(
                      "px-2 py-0.5 rounded font-medium",
                      activeLangTab === "en" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"
                    )}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLangTab("hi")}
                    className={cn(
                      "px-2 py-0.5 rounded font-medium",
                      activeLangTab === "hi" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"
                    )}
                  >
                    Hindi
                  </button>
                </div>
              </div>

              {/* Question text */}
              <div className="prose dark:prose-invert max-w-none text-sm">
                <MarkdownRenderer
                  content={activeLangTab === "en" ? contentEn : contentHi}
                  variant="question"
                />
              </div>

              {/* Options */}
              {options.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Options</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {options.map((opt) => (
                      <div
                        key={opt.id}
                        className={cn(
                          "flex items-start gap-2.5 p-3 rounded-lg border text-xs",
                          opt.isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/60 font-medium text-foreground ring-1 ring-emerald-500/20"
                            : "bg-background border-border text-muted-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-bold text-[11px]",
                            opt.isCorrect ? "bg-emerald-600 text-white" : "bg-muted text-foreground"
                          )}
                        >
                          {opt.id}
                        </span>
                        <div className="flex-1 min-w-0 break-words">
                          <MarkdownRenderer
                            content={opt.text[activeLangTab] || opt.text.en}
                            variant="option"
                          />
                        </div>
                        {opt.isCorrect && (
                          <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 text-emerald-600 border-emerald-500/40 bg-emerald-500/10 font-bold shrink-0">
                            Correct
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solution */}
              {(solutionEn || solutionHi) && (
                <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
                  <p className="font-semibold text-xs text-foreground flex items-center gap-1">
                    <SparklesIcon className="h-3.5 w-3.5 text-primary" /> Solution:
                  </p>
                  <MarkdownRenderer
                    content={activeLangTab === "en" ? solutionEn : solutionHi}
                    variant="analysis"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Question Text Editor (Bilingual Tabs) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Question Text (Markdown + LaTeX) <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    Must start with ##### prefix
                  </span>
                </div>

                <Tabs value={activeLangTab} onValueChange={(val) => setActiveLangTab(val as "en" | "hi")} className="w-full">
                  <TabsList className="grid grid-cols-2 h-8 w-48 text-xs">
                    <TabsTrigger value="en" className="text-xs">English (EN)</TabsTrigger>
                    <TabsTrigger value="hi" className="text-xs">हिंदी (HI)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="en" className="mt-1.5">
                    <Textarea
                      value={contentEn}
                      onChange={(e) => setContentEn(e.target.value)}
                      placeholder="##### What is the value of $\sin(90^\circ)$?"
                      rows={4}
                      className="font-mono text-xs p-2.5 bg-muted/20"
                    />
                  </TabsContent>

                  <TabsContent value="hi" className="mt-1.5">
                    <Textarea
                      value={contentHi}
                      onChange={(e) => setContentHi(e.target.value)}
                      placeholder="##### $\sin(90^\circ)$ का मान क्या है?"
                      rows={4}
                      className="font-mono text-xs p-2.5 bg-muted/20"
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Options Editor for MCQ */}
              {(type === QuestionType.MCQ_SINGLE || type === QuestionType.MCQ_MULTIPLE) && (
                <div className="space-y-2.5 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Options & Correct Answer Selection
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="text-[11px] h-7 gap-1"
                    >
                      <PlusIcon className="h-3 w-3" /> Add Option
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {options.map((opt) => (
                      <div
                        key={opt.id}
                        className={cn(
                          "flex flex-col gap-2 p-3 rounded-lg border transition-colors",
                          opt.isCorrect
                            ? "border-emerald-500/60 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                            : "border-border bg-card"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-muted font-bold text-xs">
                              {opt.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleCorrectOption(opt.id)}
                              className={cn(
                                "text-xs font-semibold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1",
                                opt.isCorrect
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-background text-muted-foreground border-border hover:border-emerald-500"
                              )}
                            >
                              <CheckIcon className="h-3 w-3" />
                              {opt.isCorrect ? "Correct Answer" : "Mark as Correct"}
                            </button>
                          </div>

                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(opt.id)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded"
                            >
                              <Trash2Icon className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Bilingual inputs for option text */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            placeholder={`Option ${opt.id} text (EN) e.g. $\\sqrt{2}$`}
                            value={opt.text.en}
                            onChange={(e) => handleOptionTextChange(opt.id, "en", e.target.value)}
                            className="text-xs h-8 font-mono"
                          />
                          <Input
                            placeholder={`Option ${opt.id} text (HI)`}
                            value={opt.text.hi}
                            onChange={(e) => handleOptionTextChange(opt.id, "hi", e.target.value)}
                            className="text-xs h-8 font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Numerical / Integer Answer */}
              {(type === QuestionType.NUMERICAL || type === QuestionType.INTEGER) && (
                <div className="space-y-1.5 pt-2 border-t">
                  <Label className="text-xs font-semibold">Expected Correct Answer Value</Label>
                  <Input
                    placeholder="e.g. 45 or 3.14"
                    value={correctValue}
                    onChange={(e) => setCorrectValue(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              )}

              {/* Solution / Explanation Editor */}
              <div className="space-y-1.5 pt-2 border-t">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <SparklesIcon className="h-3.5 w-3.5 text-primary" />
                  Solution & Explanation (Markdown + LaTeX)
                </Label>

                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid grid-cols-2 h-8 w-48 text-xs">
                    <TabsTrigger value="en" className="text-xs">English (EN)</TabsTrigger>
                    <TabsTrigger value="hi" className="text-xs">हिंदी (HI)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="en" className="mt-1.5">
                    <Textarea
                      value={solutionEn}
                      onChange={(e) => setSolutionEn(e.target.value)}
                      placeholder="Step-by-step mathematical solution..."
                      rows={3}
                      className="font-mono text-xs p-2.5 bg-muted/20"
                    />
                  </TabsContent>

                  <TabsContent value="hi" className="mt-1.5">
                    <Textarea
                      value={solutionHi}
                      onChange={(e) => setSolutionHi(e.target.value)}
                      placeholder="चरणबद्ध गणितीय समाधान..."
                      rows={3}
                      className="font-mono text-xs p-2.5 bg-muted/20"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {/* Dialog Footer */}
          <DialogFooter className="pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5 font-semibold">
              {submitting ? (
                <>
                  <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CheckIcon className="h-3.5 w-3.5" />
                  Save Question Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
