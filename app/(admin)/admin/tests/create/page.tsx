"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  SparklesIcon,
  LayersIcon,
  CodeIcon,
  EyeIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Trash2Icon,
  HelpCircleIcon,
  Loader2Icon,
  CheckIcon,
  RotateCcwIcon,
  FileCheckIcon,
  FolderTreeIcon,
  BookOpenIcon,
  FileTextIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import {
  parseMarkdownJSON,
  NormalizedQuestion,
  SAMPLE_BILINGUAL_JSON,
  SAMPLE_SINGLE_LANG_JSON,
} from "@/lib/question-parser";
import {
  getAdminCategoryTreeAction,
  getAllCategoriesFlatAction,
  CategoryTreeNode,
} from "@/lib/action/admin/category-actions";
import { createTestSeriesWithQuestionsAction } from "@/lib/action/admin/test-series-builder-actions";
import { FlatCategoryItem } from "../../_components/category-dialog";
import { CategoryPickerModal } from "../../_components/category-picker-modal";
import { cn } from "@/lib/utils";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CreateTestSeriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategoryId = searchParams.get("categoryId");

  // Category Tree & Selection State
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [flatCategories, setFlatCategories] = useState<FlatCategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(urlCategoryId || "");
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>("");

  // Test Paper metadata states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number>(90);
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [languages, setLanguages] = useState<string[]>(["en", "hi"]);
  const [isPublished, setIsPublished] = useState(true);
  const [isSlugManual, setIsSlugManual] = useState(false);

  // JSON Input & Questions State
  const [jsonInput, setJsonInput] = useState(SAMPLE_BILINGUAL_JSON);
  const [parsedQuestions, setParsedQuestions] = useState<NormalizedQuestion[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<"en" | "hi">("en");

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load category tree and flat list
  useEffect(() => {
    async function loadCategoryData() {
      try {
        const [treeRes, flatRes] = await Promise.all([
          getAdminCategoryTreeAction(),
          getAllCategoriesFlatAction(),
        ]);

        if (treeRes.success) {
          setCategoryTree(treeRes.data);
        }
        if (flatRes.success) {
          const flat = flatRes.data as FlatCategoryItem[];
          setFlatCategories(flat);

          if (flat.length > 0) {
            // Find target category if specified in URL query
            const targetCat = urlCategoryId ? flat.find((c) => c.id === urlCategoryId) : null;
            const chosen = targetCat || flat[0];

            if (chosen) {
              setSelectedCategoryId(chosen.id);
              const path = chosen.parent ? `${chosen.parent.name} > ${chosen.name}` : chosen.name;
              setSelectedCategoryPath(path);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load category tree:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategoryData();
  }, [urlCategoryId]);

  // Parse JSON automatically whenever jsonInput changes
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedQuestions([]);
      setParseError(null);
      return;
    }

    const result = parseMarkdownJSON(jsonInput);
    if (result.success) {
      setParsedQuestions(result.questions);
      setParseError(null);

      // If JSON contained test metadata and title is currently empty, populate it
      if (result.metadata?.title && !title) {
        setTitle(result.metadata.title);
        setSlug(generateSlug(result.metadata.title));
      }
      if (result.metadata?.duration && (!duration || duration === 90)) {
        setDuration(result.metadata.duration);
      }
      if (result.metadata?.description && !description) {
        setDescription(result.metadata.description);
      }
      if (result.metadata?.languages && result.metadata.languages.length > 0) {
        setLanguages(result.metadata.languages);
      }
    } else {
      setParseError(result.error || "Invalid JSON syntax");
    }
  }, [jsonInput]);

  // Compute total marks from parsed questions if totalMarks is 0
  const computedMarks = useMemo(() => {
    if (totalMarks > 0) return totalMarks;
    return parsedQuestions.reduce((acc, q) => acc + (q.positiveMarks || 1), 0);
  }, [totalMarks, parsedQuestions]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setIsSlugManual(true);
  };

  const handleAutoSlug = () => {
    const s = generateSlug(title);
    setSlug(s);
    setIsSlugManual(false);
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => {
      if (prev.includes(lang)) {
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== lang);
      }
      return [...prev, lang];
    });
  };

  const handleFormatJSON = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, 2));
    } catch {
      // Ignored if invalid
    }
  };

  const handleLoadSingleLangSample = () => {
    setJsonInput(SAMPLE_SINGLE_LANG_JSON);
  };

  const handleLoadBilingualSample = () => {
    setJsonInput(SAMPLE_BILINGUAL_JSON);
  };

  const handleDeleteQuestion = (indexToDelete: number) => {
    setParsedQuestions((prev) => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleCategorySelected = (catId: string, catName: string, fullPath: string) => {
    setSelectedCategoryId(catId);
    setSelectedCategoryPath(fullPath);
  };

  const selectedCategoryObj = flatCategories.find((c) => c.id === selectedCategoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) {
      setSubmitError("Please provide a test series title.");
      return;
    }

    const finalSlug = (slug || generateSlug(title)).trim();
    if (!finalSlug) {
      setSubmitError("Please provide a URL slug for this test series.");
      return;
    }

    if (!selectedCategoryId) {
      setSubmitError("Please select a target exam folder to place this test series.");
      return;
    }

    if (parsedQuestions.length === 0) {
      setSubmitError("Please provide valid questions in the JSON editor.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await createTestSeriesWithQuestionsAction({
        testPaper: {
          title: title.trim(),
          slug: finalSlug,
          description: description.trim() || null,
          duration: Number(duration),
          totalMarks: Number(computedMarks),
          languages,
          isPublished,
          categoryId: selectedCategoryId,
        },
        questions: parsedQuestions,
      });

      if (res.success) {
        router.push(`/admin/tests/${res.data.testId}`);
      } else {
        setSubmitError(res.error || "Failed to create test series");
      }
    } catch (err: any) {
      setSubmitError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Create Test Series with Questions
            </h1>
            <p className="text-xs text-muted-foreground">
              Paste Markdown JSON, preview LaTeX equations in real time, and link to an exact exam node.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting || parsedQuestions.length === 0}
            size="sm"
            className="text-xs h-8 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                Creating Test Series...
              </>
            ) : (
              <>
                <FileCheckIcon className="h-3.5 w-3.5" />
                Save & Link Test Series ({parsedQuestions.length} Qs)
              </>
            )}
          </Button>
        </div>
      </div>

      {submitError && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Failed to Create Test Series</AlertTitle>
          <AlertDescription className="text-xs">{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Main Grid: Left Config & Input / Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Metadata & JSON Editor (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Card 1: Placement & Metadata */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <LayersIcon className="h-4 w-4 text-primary" />
                Target Exam Folder & Test Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3.5">
              {/* Hierarchical Exam Folder Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>Target Exam Folder (Placement) <span className="text-destructive">*</span></span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Node in category hierarchy
                  </span>
                </Label>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20 hover:border-primary/50 transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FolderTreeIcon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {selectedCategoryObj ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground truncate">{selectedCategoryObj.name}</p>
                          <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 font-bold bg-primary/10 text-primary border-primary/30">
                            {selectedCategoryObj.level}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {selectedCategoryPath || selectedCategoryObj.name}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No folder selected</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerModalOpen(true)}
                    disabled={loadingCategories}
                    className="text-xs h-7 gap-1 font-semibold shrink-0"
                  >
                    <FolderTreeIcon className="h-3 w-3 text-primary" />
                    Browse Tree
                  </Button>
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-test-title" className="text-xs font-semibold">
                    Test Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="create-test-title"
                    placeholder="e.g. Class 10 Math Mock 1"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="create-test-slug" className="text-xs font-semibold">
                      URL Slug <span className="text-destructive">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={handleAutoSlug}
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                    >
                      <SparklesIcon className="h-2.5 w-2.5" /> Auto
                    </button>
                  </div>
                  <Input
                    id="create-test-slug"
                    placeholder="e.g. class-10-math-mock-1"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="create-test-desc" className="text-xs font-semibold">
                  Description / Syllabus
                </Label>
                <Input
                  id="create-test-desc"
                  placeholder="Optional summary of topics covered"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Duration, Marks, Languages, Published Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-border/50">
                <div className="space-y-1">
                  <Label htmlFor="create-test-duration" className="text-[11px] font-semibold">
                    Duration (min)
                  </Label>
                  <Input
                    id="create-test-duration"
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10) || 60)}
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="create-test-marks" className="text-[11px] font-semibold">
                    Total Marks
                  </Label>
                  <Input
                    id="create-test-marks"
                    type="number"
                    min={0}
                    value={computedMarks}
                    onChange={(e) => setTotalMarks(parseInt(e.target.value, 10) || 0)}
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Languages</Label>
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <Checkbox
                        checked={languages.includes("en")}
                        onCheckedChange={() => toggleLanguage("en")}
                      />
                      EN
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <Checkbox
                        checked={languages.includes("hi")}
                        onCheckedChange={() => toggleLanguage("hi")}
                      />
                      HI
                    </label>
                  </div>
                </div>

                <div className="space-y-1 flex flex-col justify-between">
                  <Label htmlFor="create-test-pub" className="text-[11px] font-semibold">
                    Publish Status
                  </Label>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Switch
                      id="create-test-pub"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                    <span className="text-[11px] font-medium">
                      {isPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: JSON Markdown Input Editor with Fixed Height Scrollable Textarea */}
          <Card className="border-border/80 shadow-sm flex flex-col">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CodeIcon className="h-4 w-4 text-purple-600" />
                  Paste Question JSON (Markdown + LaTeX)
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Paste AI-generated question JSON or standard test structure. Fixed scrollable input.
                </CardDescription>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFormatJSON}
                  className="text-[11px] h-7 px-2"
                >
                  Format JSON
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setJsonInput("")}
                  className="text-[11px] h-7 px-2 text-muted-foreground hover:text-destructive"
                >
                  Clear
                </Button>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 space-y-3">
              {/* Fixed Height Scrollable Textarea */}
              <div className="relative">
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Paste JSON here, e.g. { "questions": [ { "text": "##### What is...", "options": [...], "answerIndex": 0 } ] }'
                  className="h-[320px] max-h-[320px] overflow-y-auto font-mono text-xs p-3 leading-relaxed bg-muted/20 resize-none"
                  spellCheck={false}
                />
              </div>

              {/* Status bar under JSON editor */}
              <div className="flex items-center justify-between pt-1">
                {parseError ? (
                  <span className="text-xs text-destructive flex items-center gap-1 font-medium truncate">
                    <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{parseError}</span>
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2Icon className="h-3.5 w-3.5" />
                    Valid JSON: {parsedQuestions.length} question(s) parsed
                  </span>
                )}
              </div>

              {/* 2 Sample JSON Loader Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                <span className="text-[11px] text-muted-foreground font-semibold">Load Sample:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSingleLangSample}
                  className="text-[11px] h-7 px-2.5 gap-1.5 hover:border-primary/50"
                >
                  <BookOpenIcon className="h-3 w-3 text-blue-500" />
                  Sample: Single Language (Math)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadBilingualSample}
                  className="text-[11px] h-7 px-2.5 gap-1.5 hover:border-primary/50"
                >
                  <SparklesIcon className="h-3 w-3 text-amber-500" />
                  Sample: Bilingual (EN + HI Math)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Markdown & LaTeX Preview (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
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
                    ? "bg-background text-foreground shadow-sm font-semibold"
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
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </div>

          {/* Question List Preview Cards */}
          <div className="flex flex-col gap-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 pb-12">
            {parsedQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-card border rounded-xl shadow-sm">
                <HelpCircleIcon className="h-10 w-10 stroke-1 mb-2 text-muted-foreground/60" />
                <p className="text-sm font-semibold">No Questions to Preview</p>
                <p className="text-xs max-w-sm mt-1 mb-3">
                  Paste JSON in the editor on the left or load one of the sample formats below.
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleLoadSingleLangSample} className="text-xs gap-1">
                    <BookOpenIcon className="h-3.5 w-3.5 text-blue-500" />
                    Load Single Language
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleLoadBilingualSample} className="text-xs gap-1">
                    <SparklesIcon className="h-3.5 w-3.5 text-amber-500" />
                    Load Bilingual (EN + HI)
                  </Button>
                </div>
              </div>
            ) : (
              parsedQuestions.map((q, idx) => {
                const questionText = q.content[previewLanguage] || q.content.en || "";
                const solutionText = q.solution[previewLanguage] || q.solution.en || "";

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/80 bg-card shadow-sm flex flex-col transition-all"
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
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(idx)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors"
                          title="Remove question"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Body */}
                    <div className="p-4 space-y-4 flex flex-col">
                      {/* Question Text with LaTeX / Markdown */}
                      <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                        <MarkdownRenderer
                          content={questionText}
                          variant="question"
                        />
                      </div>

                      {/* Options List: 2-column on larger preview or 1-column with full visibility */}
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
                                      opt.isCorrect
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-muted text-foreground"
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

                      {/* Correct Value if numerical/integer */}
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

      {/* Category Picker Modal */}
      <CategoryPickerModal
        open={pickerModalOpen}
        onOpenChange={setPickerModalOpen}
        treeData={categoryTree}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleCategorySelected}
      />
    </div>
  );
}

export default function CreateTestSeriesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
          <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
          Loading creator...
        </div>
      }
    >
      <CreateTestSeriesContent />
    </React.Suspense>
  );
}
