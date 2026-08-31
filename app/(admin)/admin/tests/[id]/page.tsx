"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ClockIcon,
  FileTextIcon,
  Edit2Icon,
  Trash2Icon,
  PlusIcon,
  CheckCircle2Icon,
  EyeOffIcon,
  LayersIcon,
  SparklesIcon,
  Loader2Icon,
  CodeIcon,
  AlertCircleIcon,
  HelpCircleIcon,
  EyeIcon,
  SaveIcon,
  RotateCcwIcon,
  MousePointerClickIcon,
  LayoutListIcon,
  BookOpenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import {
  getAdminTestDetailAction,
  addQuestionsToTestAction,
  removeQuestionFromTestAction,
  syncAllTestQuestionsAction,
} from "@/lib/action/admin/test-series-builder-actions";
import { deleteTestPaperAction } from "@/lib/action/admin/test-paper-actions";
import { getAllCategoriesFlatAction } from "@/lib/action/admin/category-actions";
import {
  parseMarkdownJSON,
  NormalizedQuestion,
  SAMPLE_SINGLE_LANG_JSON,
  SAMPLE_BILINGUAL_JSON,
} from "@/lib/question-parser";
import { TestPaperDialog, TestPaperItem } from "../../_components/test-paper-dialog";
import { FlatCategoryItem } from "../../_components/category-dialog";
import { QuestionEditDialog } from "../../_components/question-edit-dialog";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Converts test question records into clean formatted JSON for bulk editing
 */
function convertQuestionsToJSON(testQuestions: any[]): string {
  if (!testQuestions || testQuestions.length === 0) {
    return JSON.stringify({ questions: [] }, null, 2);
  }

  const formatted = testQuestions.map((tq) => {
    const q = tq.question || tq;
    const content = typeof q.content === "object" && q.content !== null ? q.content : { en: String(q.content || "") };
    const solution = typeof q.solution === "object" && q.solution !== null ? q.solution : { en: String(q.solution || "") };
    const options = Array.isArray(q.options)
      ? q.options.map((opt: any, idx: number) => ({
          id: opt.id || String.fromCharCode(65 + idx),
          text: typeof opt.text === "object" ? opt.text : { en: String(opt.text || opt), hi: String(opt.text || opt) },
          isCorrect: Boolean(opt.isCorrect ?? (q.correctValue === opt.id)),
        }))
      : [];

    return {
      text: content,
      type: q.type || "MCQ_SINGLE",
      difficulty: q.difficulty || "MEDIUM",
      positiveMarks: tq.positiveMarks ?? q.positiveMarks ?? 1,
      negativeMarks: tq.negativeMarks ?? q.negativeMarks ?? 0,
      options,
      correctValue: q.correctValue || (options.find((o: any) => o.isCorrect)?.id || ""),
      solution,
    };
  });

  return JSON.stringify({ questions: formatted }, null, 2);
}

export default function TestDetailPage({ params }: PageProps) {
  const { id: testId } = use(params);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<FlatCategoryItem[]>([]);
  const [previewLanguage, setPreviewLanguage] = useState<"en" | "hi">("en");
  const [viewMode, setViewMode] = useState<"split" | "cards">("split");

  // Full JSON Bulk Editor States
  const [jsonInput, setJsonInput] = useState("");
  const [originalJson, setOriginalJson] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<NormalizedQuestion[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [highlightedQuestionIdx, setHighlightedQuestionIdx] = useState<number | null>(null);

  // Edit test paper dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Add questions JSON modal state
  const [addJsonModalOpen, setAddJsonModalOpen] = useState(false);
  const [importJsonInput, setImportJsonInput] = useState("");
  const [parsedImportQuestions, setParsedImportQuestions] = useState<NormalizedQuestion[]>([]);
  const [importJsonError, setImportJsonError] = useState<string | null>(null);
  const [addingQuestions, setAddingQuestions] = useState(false);

  // Remove question state
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [removingQuestion, setRemovingQuestion] = useState(false);

  // Edit single question state
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Delete entire test state
  const [deleteTestConfirmOpen, setDeleteTestConfirmOpen] = useState(false);
  const [deletingTest, setDeletingTest] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const [detailRes, catRes] = await Promise.all([
        getAdminTestDetailAction({ testId }),
        getAllCategoriesFlatAction(),
      ]);

      if (detailRes.success) {
        setTestData(detailRes.data);
        const formatted = convertQuestionsToJSON(detailRes.data.questions || []);
        setJsonInput(formatted);
        setOriginalJson(formatted);

        const parsed = parseMarkdownJSON(formatted);
        if (parsed.success) {
          setParsedQuestions(parsed.questions);
        }
      }
      if (catRes.success) {
        setCategories(catRes.data as FlatCategoryItem[]);
      }
    } catch (err) {
      console.error("Failed to load test details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [testId]);

  // Real-time JSON validation & parsing for full bulk editor
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedQuestions([]);
      setJsonError(null);
      return;
    }

    const result = parseMarkdownJSON(jsonInput);
    if (result.success) {
      setParsedQuestions(result.questions);
      setJsonError(null);
    } else {
      setJsonError(result.error || "Invalid JSON syntax");
    }
  }, [jsonInput]);

  // Real-time parsing for the Import Modal
  useEffect(() => {
    if (!importJsonInput.trim()) {
      setParsedImportQuestions([]);
      setImportJsonError(null);
      return;
    }

    const result = parseMarkdownJSON(importJsonInput);
    if (result.success) {
      setParsedImportQuestions(result.questions);
      setImportJsonError(null);
    } else {
      setImportJsonError(result.error || "Invalid JSON syntax");
    }
  }, [importJsonInput]);

  /**
   * Jump to corresponding line / cursor in JSON when clicking on a question in the preview
   */
  const handleJumpToJsonQuestion = (qIndex: number) => {
    setHighlightedQuestionIdx(qIndex);
    const textarea = textareaRef.current;
    if (!textarea || !jsonInput) return;

    try {
      const targetQ = parsedQuestions[qIndex];
      let targetIndex = -1;

      if (targetQ) {
        // Method 1: Search by question English or Hindi text snippet
        const rawEn = (targetQ.content.en || "").replace(/^#####\s*/, "").trim();
        const rawHi = (targetQ.content.hi || "").replace(/^#####\s*/, "").trim();
        const snippet = (rawEn || rawHi).slice(0, 25);

        if (snippet) {
          targetIndex = jsonInput.indexOf(snippet);
        }
      }

      // Method 2: Fallback to finding the N-th occurrence of "text": or "question":
      if (targetIndex === -1) {
        let count = 0;
        const regex = /"(?:text|content|question)"\s*:/g;
        let match;
        while ((match = regex.exec(jsonInput)) !== null) {
          if (count === qIndex) {
            targetIndex = match.index;
            break;
          }
          count++;
        }
      }

      if (targetIndex !== -1) {
        textarea.focus();
        const endIndex = Math.min(jsonInput.length, targetIndex + 45);
        textarea.setSelectionRange(targetIndex, endIndex);

        // Scroll textarea smoothly to the question position
        const textBefore = jsonInput.substring(0, targetIndex);
        const linesBefore = textBefore.split("\n").length;
        const approxLineHeight = 18;
        textarea.scrollTo({
          top: Math.max(0, (linesBefore - 4) * approxLineHeight),
          behavior: "smooth",
        });
      }
    } catch (err) {
      console.error("Failed to focus JSON location:", err);
    }
  };

  /**
   * Save All Questions from the JSON Editor in one atomic transaction
   */
  const handleSaveAllQuestions = async () => {
    if (parsedQuestions.length === 0) {
      alert("No valid questions to save.");
      return;
    }

    setSavingAll(true);
    setSaveStatus(null);

    try {
      const res = await syncAllTestQuestionsAction({
        testPaperId: testId,
        questions: parsedQuestions,
      });

      if (res.success) {
        setOriginalJson(jsonInput);
        setSaveStatus({
          success: true,
          message: `Saved all ${parsedQuestions.length} questions successfully!`,
        });
        await fetchDetail();
      } else {
        setSaveStatus({
          success: false,
          message: res.error || "Failed to save questions",
        });
      }
    } catch (err: any) {
      setSaveStatus({
        success: false,
        message: err?.message || "An unexpected error occurred",
      });
    } finally {
      setSavingAll(false);
    }
  };

  const handleFormatJSON = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, 2));
    } catch {
      if (parsedQuestions.length > 0) {
        setJsonInput(JSON.stringify({ questions: parsedQuestions }, null, 2));
      }
    }
  };

  const handleResetToOriginal = () => {
    setJsonInput(originalJson);
    setSaveStatus(null);
  };

  const handleAddQuestionsSubmit = async () => {
    if (parsedImportQuestions.length === 0) return;
    setAddingQuestions(true);

    try {
      const res = await addQuestionsToTestAction({
        testId,
        questions: parsedImportQuestions,
      });

      if (res.success) {
        setAddJsonModalOpen(false);
        setImportJsonInput("");
        setParsedImportQuestions([]);
        fetchDetail();
      } else {
        setImportJsonError(res.error || "Failed to add questions");
      }
    } catch (err: any) {
      setImportJsonError(err?.message || "An unexpected error occurred");
    } finally {
      setAddingQuestions(false);
    }
  };

  const handleRemoveQuestion = async () => {
    if (!deleteQuestionId) return;
    setRemovingQuestion(true);

    try {
      const res = await removeQuestionFromTestAction({
        testPaperId: testId,
        questionId: deleteQuestionId,
      });

      if (res.success) {
        setDeleteQuestionId(null);
        fetchDetail();
      }
    } catch (err) {
      console.error("Failed to remove question:", err);
    } finally {
      setRemovingQuestion(false);
    }
  };

  const handleDeleteEntireTest = async () => {
    setDeletingTest(true);
    try {
      const res = await deleteTestPaperAction({ id: testId });
      if (res.success) {
        router.push("/admin");
      }
    } catch (err) {
      console.error("Failed to delete test paper:", err);
    } finally {
      setDeletingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading test series and questions...</p>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <AlertCircleIcon className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-bold">Test Series Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested test series could not be located.</p>
        <Link href="/admin">
          <Button size="sm" variant="outline" className="mt-2 text-xs">
            Back to Admin Panel
          </Button>
        </Link>
      </div>
    );
  }

  const category = testData.category;
  const questionsList = testData.questions || [];
  const hasChanges = jsonInput !== originalJson;

  // Calculate live total marks from parsed questions
  const liveTotalMarks = parsedQuestions.reduce((sum, q) => sum + (q.positiveMarks || 1), 0);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumbs & Actions Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{testData.title}</h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5",
                  testData.isPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {testData.isPublished ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2Icon className="h-3 w-3" /> Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <EyeOffIcon className="h-3 w-3" /> Draft
                  </span>
                )}
              </Badge>
            </div>

            {category && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <LayersIcon className="h-3.5 w-3.5 text-primary" />
                <span>
                  {category.parent ? `${category.parent.name} > ` : ""}
                  {category.name} ({category.level})
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-muted p-0.5 rounded-lg border text-xs mr-1">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors",
                viewMode === "split"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CodeIcon className="h-3.5 w-3.5 text-primary" />
              Live JSON & Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutListIcon className="h-3.5 w-3.5 text-blue-500" />
              Individual Cards
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddJsonModalOpen(true)}
            className="text-xs h-8 gap-1.5 font-medium"
          >
            <PlusIcon className="h-3.5 w-3.5 text-primary" />
            Append JSON
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
            className="text-xs h-8 gap-1.5 font-medium"
          >
            <Edit2Icon className="h-3.5 w-3.5" />
            Edit Test Settings
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteTestConfirmOpen(true)}
            className="text-xs h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete this test paper"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FileTextIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Questions</p>
              <p className="text-lg font-bold text-foreground">{parsedQuestions.length || questionsList.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ClockIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Duration</p>
              <p className="text-lg font-bold text-foreground">{testData.duration} min</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Total Marks</p>
              <p className="text-lg font-bold text-foreground">{liveTotalMarks || testData.totalMarks}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <LayersIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Student Attempts</p>
              <p className="text-lg font-bold text-foreground">{testData._count?.attempts ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Status Notification Banner */}
      {saveStatus && (
        <Alert
          variant={saveStatus.success ? "default" : "destructive"}
          className={cn(
            "py-2.5 px-4 transition-all animate-in fade-in-50",
            saveStatus.success
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200"
              : ""
          )}
        >
          {saveStatus.success ? (
            <CheckCircle2Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircleIcon className="h-4 w-4 text-destructive" />
          )}
          <AlertDescription className="text-xs font-semibold">{saveStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* VIEW MODE 1: SPLIT LIVE JSON EDITOR & LIVE PREVIEW WITH CLICK-TO-SYNC */}
      {viewMode === "split" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN (6 Cols): Full JSON Textarea Editor */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex items-center justify-between bg-card p-3 rounded-xl border shadow-sm">
              <div className="flex items-center gap-2">
                <CodeIcon className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-bold text-foreground">Question Bank JSON Editor</span>
                {hasChanges && (
                  <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 font-semibold">
                    Unsaved Edits
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFormatJSON}
                  className="text-[11px] h-7 px-2"
                  title="Auto-format and beautify JSON"
                >
                  Format
                </Button>
                {hasChanges && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetToOriginal}
                    className="text-[11px] h-7 px-2 text-muted-foreground hover:text-foreground gap-1"
                    title="Revert edits to saved database state"
                  >
                    <RotateCcwIcon className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* JSON Textarea with Cursor Ref */}
            <div className="relative rounded-xl border border-border/80 bg-card shadow-sm p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 border-b border-border/50">
                <span>Click any question in right preview to jump cursor here</span>
                <span className="font-mono text-[10px]">{parsedQuestions.length} Questions</span>
              </div>

              <Textarea
                ref={textareaRef}
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setSaveStatus(null);
                }}
                placeholder='{ "questions": [ ... ] }'
                className="h-[calc(100vh-320px)] min-h-[480px] font-mono text-xs p-3 leading-relaxed bg-muted/20 resize-none overflow-y-auto"
                spellCheck={false}
              />

              {/* Status and Save Action Footer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-border/50">
                <div>
                  {jsonError ? (
                    <span className="text-xs text-destructive flex items-center gap-1 font-medium">
                      <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-xs">{jsonError}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2Icon className="h-3.5 w-3.5" />
                      Valid JSON • {parsedQuestions.length} questions parsed
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveAllQuestions}
                    disabled={savingAll || Boolean(jsonError) || parsedQuestions.length === 0}
                    className="text-xs h-8 px-3 gap-1.5 font-bold shadow-sm"
                  >
                    {savingAll ? (
                      <>
                        <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                        Saving All...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-3.5 w-3.5" />
                        Save All Questions
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (6 Cols): Live KaTeX Visual Preview with Click-to-Jump */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            {/* Preview Header & Language Switch */}
            <div className="flex items-center justify-between bg-card p-3 rounded-xl border shadow-sm">
              <div className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Live Visual Preview</span>
                <Badge variant="outline" className="text-[11px] font-semibold bg-primary/10 text-primary border-primary/30">
                  {parsedQuestions.length} Questions
                </Badge>
              </div>

              {/* Language Switch */}
              <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewLanguage("en")}
                  className={cn(
                    "text-xs font-medium px-2.5 py-0.5 rounded-md transition-colors",
                    previewLanguage === "en"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLanguage("hi")}
                  className={cn(
                    "text-xs font-medium px-2.5 py-0.5 rounded-md transition-colors",
                    previewLanguage === "hi"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            </div>

            {/* Scrollable Question Cards with Click-to-Jump Indicator */}
            <div className="flex flex-col gap-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 pb-16">
              {parsedQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-card border rounded-xl shadow-sm">
                  <HelpCircleIcon className="h-10 w-10 stroke-1 mb-2 text-muted-foreground/60" />
                  <p className="text-sm font-semibold">No Questions in Test</p>
                  <p className="text-xs max-w-sm mt-1 mb-3">
                    Edit the JSON on the left to add questions or import a sample template.
                  </p>
                </div>
              ) : (
                parsedQuestions.map((q, idx) => {
                  const questionText = q.content[previewLanguage] || q.content.en || "";
                  const solutionText = q.solution[previewLanguage] || q.solution.en || "";
                  const isHighlighted = highlightedQuestionIdx === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleJumpToJsonQuestion(idx)}
                      className={cn(
                        "rounded-xl border bg-card shadow-sm flex flex-col transition-all cursor-pointer group",
                        isHighlighted
                          ? "border-primary ring-2 ring-primary/40 shadow-md"
                          : "border-border/80 hover:border-primary/50"
                      )}
                      title="Click anywhere to focus and jump to this question in the JSON editor"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border/50 rounded-t-xl">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                            {idx + 1}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {q.type}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] font-semibold",
                              q.difficulty === "EASY" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                              q.difficulty === "MEDIUM" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                              q.difficulty === "HARD" && "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {q.difficulty}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            +{q.positiveMarks} / -{q.negativeMarks} marks
                          </span>

                          <span className="text-[10px] text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 px-1.5 py-0.5 rounded">
                            <MousePointerClickIcon className="h-3 w-3" />
                            Focus in JSON
                          </span>
                        </div>
                      </div>

                      {/* Question Body */}
                      <div className="p-4 space-y-4 flex flex-col">
                        {/* Question Text with KaTeX */}
                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                          <MarkdownRenderer content={questionText} variant="question" />
                        </div>

                        {/* Options List */}
                        {q.options.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              <span>Options ({q.options.length})</span>
                              {q.options.some((o) => o.isCorrect) && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium normal-case">
                                  Correct: {q.options.filter((o) => o.isCorrect).map((o) => o.id).join(", ")}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {q.options.map((opt) => {
                                const optText = opt.text[previewLanguage] || opt.text.en || "";
                                return (
                                  <div
                                    key={opt.id}
                                    className={cn(
                                      "flex items-start gap-2.5 p-3 rounded-lg border text-xs transition-all w-full min-w-0",
                                      opt.isCorrect
                                        ? "bg-emerald-500/10 border-emerald-500/60 text-foreground font-medium ring-1 ring-emerald-500/20 shadow-xs"
                                        : "bg-background border-border/80 text-muted-foreground hover:border-muted-foreground/50"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold text-xs",
                                        opt.isCorrect ? "bg-emerald-600 text-white shadow-xs" : "bg-muted text-foreground"
                                      )}
                                    >
                                      {opt.id}
                                    </span>

                                    <div className="flex-1 min-w-0 break-words py-0.5">
                                      <MarkdownRenderer content={optText} variant="option" />
                                    </div>

                                    {opt.isCorrect && (
                                      <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shrink-0 font-bold bg-emerald-500/15">
                                        Correct
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Correct Value if Numerical / Integer */}
                        {q.options.length === 0 && q.correctValue && (
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                              Expected Numerical / Text Answer:
                            </span>
                            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200 text-sm">
                              {q.correctValue}
                            </span>
                          </div>
                        )}

                        {/* Solution / Explanation */}
                        {solutionText && (
                          <div className="p-3.5 rounded-lg bg-muted/40 border border-border/70 text-xs space-y-1.5">
                            <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                              <SparklesIcon className="h-3.5 w-3.5 text-primary" />
                              Solution & Explanation:
                            </p>
                            <div className="text-muted-foreground leading-relaxed">
                              <MarkdownRenderer content={solutionText} variant="analysis" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: INDIVIDUAL CARD LIST VIEW */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                Question Bank List ({questionsList.length} Questions)
              </h2>
            </div>

            <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPreviewLanguage("en")}
                className={cn(
                  "px-2.5 py-0.5 rounded-md font-medium",
                  previewLanguage === "en" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"
                )}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPreviewLanguage("hi")}
                className={cn(
                  "px-2.5 py-0.5 rounded-md font-medium",
                  previewLanguage === "hi" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"
                )}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questionsList.map((tq: any, idx: number) => {
              const q = tq.question;
              const questionText = q.content[previewLanguage] || q.content.en || "";
              const solutionText = q.solution ? q.solution[previewLanguage] || q.solution.en || "" : "";
              const rawOptions = Array.isArray(q.options) ? q.options : [];

              return (
                <div key={tq.id} className="rounded-xl border border-border/80 bg-card shadow-sm flex flex-col transition-all">
                  {/* Question Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {tq.orderIndex || idx + 1}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {q.type}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-semibold",
                          q.difficulty === "EASY" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          q.difficulty === "MEDIUM" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                          q.difficulty === "HARD" && "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {q.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-muted-foreground mr-1">
                        +{tq.positiveMarks} / -{tq.negativeMarks} marks
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingQuestion(tq)}
                        className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                      >
                        <Edit2Icon className="h-3 w-3" />
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => setDeleteQuestionId(q.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors"
                        title="Remove question from this test"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 flex flex-col">
                    {/* Question Content */}
                    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                      <MarkdownRenderer content={questionText} variant="question" />
                    </div>

                    {/* Options */}
                    {rawOptions.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <span>Options ({rawOptions.length})</span>
                          {rawOptions.some((o: any) => o.isCorrect) && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium normal-case">
                              Correct: {rawOptions.filter((o: any) => o.isCorrect).map((o: any) => o.id).join(", ")}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {rawOptions.map((opt: any, optIdx: number) => {
                            const optTextObj = typeof opt.text === "object" ? opt.text : { en: String(opt.text || opt), hi: String(opt.text || opt) };
                            const optText = optTextObj[previewLanguage] || optTextObj.en || "";
                            const isCorrect = opt.isCorrect ?? (q.correctValue === opt.id || q.correctValue === String(optIdx));

                            return (
                              <div
                                key={opt.id || optIdx}
                                className={cn(
                                  "flex items-start gap-2.5 p-3 rounded-lg border text-xs transition-all w-full min-w-0",
                                  isCorrect
                                    ? "bg-emerald-500/10 border-emerald-500/60 text-foreground font-medium ring-1 ring-emerald-500/20 shadow-xs"
                                    : "bg-background border-border/80 text-muted-foreground hover:border-muted-foreground/50"
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold text-xs",
                                    isCorrect ? "bg-emerald-600 text-white shadow-xs" : "bg-muted text-foreground"
                                  )}
                                >
                                  {opt.id || String.fromCharCode(65 + optIdx)}
                                </span>

                                <div className="flex-1 min-w-0 break-words py-0.5">
                                  <MarkdownRenderer content={optText} variant="option" />
                                </div>

                                {isCorrect && (
                                  <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shrink-0 font-bold bg-emerald-500/15">
                                    Correct
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Correct Value if Numerical / Integer */}
                    {rawOptions.length === 0 && q.correctValue && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                          Correct Value / Answer:
                        </span>
                        <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200 text-sm">
                          {q.correctValue}
                        </span>
                      </div>
                    )}

                    {/* Solution */}
                    {solutionText && (
                      <div className="p-3.5 rounded-lg bg-muted/40 border border-border/70 text-xs space-y-1.5">
                        <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <SparklesIcon className="h-3.5 w-3.5 text-primary" />
                          Solution & Explanation:
                        </p>
                        <div className="text-muted-foreground leading-relaxed">
                          <MarkdownRenderer content={solutionText} variant="analysis" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Append Questions Modal Dialog */}
      <Dialog open={addJsonModalOpen} onOpenChange={setAddJsonModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <PlusIcon className="h-4 w-4 text-primary" />
              Append Questions to Test Series
            </DialogTitle>
            <DialogDescription className="text-xs">
              Paste Markdown JSON with LaTeX formulas to append new questions to this test.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            <Textarea
              value={importJsonInput}
              onChange={(e) => setImportJsonInput(e.target.value)}
              placeholder='Paste JSON here, e.g. { "questions": [ ... ] }'
              className="h-[280px] font-mono text-xs p-3 leading-relaxed bg-muted/20"
              spellCheck={false}
            />

            {/* Quick Sample JSON Loaders */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground font-semibold">Load Sample:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImportJsonInput(SAMPLE_SINGLE_LANG_JSON)}
                className="text-[11px] h-7 px-2.5 gap-1.5"
              >
                <BookOpenIcon className="h-3 w-3 text-blue-500" />
                Sample: Single Language
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImportJsonInput(SAMPLE_BILINGUAL_JSON)}
                className="text-[11px] h-7 px-2.5 gap-1.5"
              >
                <SparklesIcon className="h-3 w-3 text-amber-500" />
                Sample: Bilingual (EN + HI)
              </Button>
            </div>

            {importJsonError ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription className="text-xs">{importJsonError}</AlertDescription>
              </Alert>
            ) : (
              parsedImportQuestions.length > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  {parsedImportQuestions.length} valid question(s) parsed and ready to append.
                </div>
              )
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddJsonModalOpen(false)}
              disabled={addingQuestions}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddQuestionsSubmit}
              disabled={addingQuestions || parsedImportQuestions.length === 0}
              className="gap-1.5 font-semibold"
            >
              {addingQuestions ? (
                <>
                  <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                  Adding Questions...
                </>
              ) : (
                `Append ${parsedImportQuestions.length} Question(s)`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Test Settings Dialog */}
      {editDialogOpen && (
        <TestPaperDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          allCategories={categories}
          testToEdit={testData}
          onSuccess={fetchDetail}
        />
      )}

      {/* Edit Single Question Modal Dialog */}
      {editingQuestion && (
        <QuestionEditDialog
          open={Boolean(editingQuestion)}
          onOpenChange={(open) => !open && setEditingQuestion(null)}
          questionWrapper={editingQuestion}
          testPaperId={testId}
          onSuccess={fetchDetail}
        />
      )}

      {/* Remove Question Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteQuestionId)}
        onOpenChange={(open) => !open && setDeleteQuestionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2Icon className="h-5 w-5" />
              Remove Question from Test?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will remove this question from this test series. If the question is not used in any other test paper, it will also be cleaned up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingQuestion}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveQuestion}
              disabled={removingQuestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removingQuestion ? "Removing..." : "Remove Question"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Test Paper Alert Dialog */}
      <AlertDialog
        open={deleteTestConfirmOpen}
        onOpenChange={setDeleteTestConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2Icon className="h-5 w-5" />
              Delete &quot;{testData.title}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete this test series? All student attempts on this test will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingTest}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntireTest}
              disabled={deletingTest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingTest ? "Deleting..." : "Confirm Delete Test"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
