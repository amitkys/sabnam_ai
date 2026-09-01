"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2Icon,
  AlertCircleIcon,
  SparklesIcon,
  FolderTreeIcon,
  LayersIcon,
} from "lucide-react";

import { FlatCategoryItem } from "./category-dialog";
import { CategoryPickerModal } from "./category-picker-modal";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  createTestPaperAction,
  updateTestPaperAction,
} from "@/lib/action/admin/test-paper-actions";
import { toast } from "@/components/ui/toast";
import {
  getAdminCategoryTreeAction,
  CategoryTreeNode,
} from "@/lib/action/admin/category-actions";

export interface TestPaperItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  duration: number;
  totalMarks: number;
  languages: string[];
  isPublished: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    level: string;
    slug: string;
  };
}

interface TestPaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testToEdit?: TestPaperItem | null;
  defaultCategoryId?: string | null;
  allCategories: FlatCategoryItem[];
  onSuccess: () => void;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function TestPaperDialog({
  open,
  onOpenChange,
  testToEdit,
  defaultCategoryId,
  allCategories,
  onSuccess,
}: TestPaperDialogProps) {
  const isEditing = Boolean(testToEdit);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [duration, setDuration] = useState<number>(180);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [languages, setLanguages] = useState<string[]>(["en", "hi"]);
  const [isPublished, setIsPublished] = useState(true);

  const [isSlugManual, setIsSlugManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Category Tree & Picker States
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState("");

  // Fetch category tree when dialog opens
  useEffect(() => {
    if (open) {
      getAdminCategoryTreeAction().then((res) => {
        if (res.success) {
          setCategoryTree(res.data);
        }
      });
    }
  }, [open]);

  // Sync selectedCategoryPath with current categoryId
  useEffect(() => {
    if (categoryId && allCategories.length > 0) {
      const found = allCategories.find((c) => c.id === categoryId);

      if (found) {
        const path = found.parent
          ? `${found.parent.name} > ${found.name}`
          : found.name;

        setSelectedCategoryPath(path);
      }
    }
  }, [categoryId, allCategories]);

  // Initialize or reset form when dialog opens
  useEffect(() => {
    if (!open) return;

    if (testToEdit) {
      setTitle(testToEdit.title);
      setSlug(testToEdit.slug);
      setDescription(testToEdit.description || "");
      setCategoryId(testToEdit.categoryId);
      setDuration(testToEdit.duration || 180);
      setTotalMarks(testToEdit.totalMarks || 100);
      setLanguages(
        testToEdit.languages && testToEdit.languages.length > 0
          ? testToEdit.languages
          : ["en"],
      );
      setIsPublished(testToEdit.isPublished ?? true);
      setIsSlugManual(true);
    } else {
      setTitle("");
      setSlug("");
      setDescription("");
      setCategoryId(defaultCategoryId || (allCategories[0]?.id ?? ""));
      setDuration(180);
      setTotalMarks(100);
      setLanguages(["en", "hi"]);
      setIsPublished(true);
      setIsSlugManual(false);
    }
    setError(null);
  }, [open, testToEdit, defaultCategoryId, allCategories]);

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
        if (prev.length === 1) return prev; // At least one language required

        return prev.filter((l) => l !== lang);
      }

      return [...prev, lang];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a test title.");

      return;
    }

    const finalSlug = (slug || generateSlug(title)).trim();

    if (!finalSlug) {
      setError("Please provide a test slug.");

      return;
    }

    if (!categoryId) {
      setError("Please select a target category folder.");

      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && testToEdit) {
        const res = await updateTestPaperAction({
          id: testToEdit.id,
          title: title.trim(),
          slug: finalSlug,
          description: description.trim() || null,
          duration: Number(duration),
          totalMarks: Number(totalMarks),
          languages,
          isPublished,
          categoryId,
        });

        if (!res.success) {
          setError(res.error || "Failed to update test paper");
          toast.add({
            type: "error",
            title: "Update Failed",
            description: res.error || "Failed to update test paper.",
          });

          return;
        }

        toast.add({
          type: "success",
          title: "Test Updated",
          description: `Test "${title.trim()}" has been updated.`,
        });
      } else {
        const res = await createTestPaperAction({
          title: title.trim(),
          slug: finalSlug,
          description: description.trim() || null,
          duration: Number(duration),
          totalMarks: Number(totalMarks),
          languages,
          isPublished,
          categoryId,
        });

        if (!res.success) {
          setError(res.error || "Failed to create test paper");
          toast.add({
            type: "error",
            title: "Creation Failed",
            description: res.error || "Failed to create test paper.",
          });

          return;
        }

        toast.add({
          type: "success",
          title: "Test Created",
          description: `Test "${title.trim()}" created successfully.`,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred.";

      setError(msg);
      toast.add({
        type: "error",
        title: "Test Error",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing
              ? `Edit Test: ${testToEdit?.title}`
              : "Create New Test Paper"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modify test parameters, duration, marks, publish status, or move it to another folder."
              : "Define test title, syllabus folder placement, time duration, and marks."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
          {error && (
            <Alert className="py-2" variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold" htmlFor="test-title">
              Test Title <span className="text-destructive">*</span>
            </Label>
            <Input
              autoFocus
              disabled={loading}
              id="test-title"
              placeholder="e.g. BSEB Class 10 Math Final Practice Paper 2024"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold" htmlFor="test-slug">
                URL Slug <span className="text-destructive">*</span>
              </Label>
              <button
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
                type="button"
                onClick={handleAutoSlug}
              >
                <SparklesIcon className="h-3 w-3" />
                Regenerate from Title
              </button>
            </div>
            <Input
              disabled={loading}
              id="test-slug"
              placeholder="e.g. bseb-class-10-math-practice-2024"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
            />
          </div>

          {/* Target Folder / Category Placement */}
          <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <LayersIcon className="h-3.5 w-3.5 text-primary" />
                Target Exam Folder (Placement){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Button
                className="h-7 text-[11px] gap-1.5 font-semibold text-primary hover:bg-primary/10 border-primary/40"
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setPickerModalOpen(true)}
              >
                <FolderTreeIcon className="h-3.5 w-3.5" />
                Browse Tree
              </Button>
            </div>

            <div
              className="flex items-center justify-between p-2.5 rounded-lg border bg-background hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => setPickerModalOpen(true)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <LayersIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {allCategories.find((c) => c.id === categoryId)?.name ||
                      "Select a folder..."}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {selectedCategoryPath ||
                      "Click 'Browse Tree' to choose folder from hierarchy"}
                  </p>
                </div>
              </div>

              {categoryId && (
                <Badge
                  className="text-[10px] uppercase font-bold shrink-0"
                  variant="outline"
                >
                  {allCategories.find((c) => c.id === categoryId)?.level ||
                    "FOLDER"}
                </Badge>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground">
              Select which subject, chapter, class, or board folder contains
              this test.
            </p>
          </div>

          {/* Category Picker Tree Modal */}
          <CategoryPickerModal
            open={pickerModalOpen}
            selectedCategoryId={categoryId}
            treeData={categoryTree}
            onOpenChange={setPickerModalOpen}
            onSelectCategory={(id, _name, path) => {
              setCategoryId(id);
              setSelectedCategoryPath(path);
            }}
          />

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold" htmlFor="test-desc">
              Description / Instructions
            </Label>
            <Textarea
              disabled={loading}
              id="test-desc"
              placeholder="Brief summary of syllabus covered, negative marking guidelines, etc."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Duration & Total Marks Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold" htmlFor="test-duration">
                Duration (in minutes){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                disabled={loading}
                id="test-duration"
                max={600}
                min={1}
                type="number"
                value={duration}
                onChange={(e) =>
                  setDuration(parseInt(e.target.value, 10) || 60)
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold" htmlFor="test-marks">
                Total Marks <span className="text-destructive">*</span>
              </Label>
              <Input
                disabled={loading}
                id="test-marks"
                max={1000}
                min={0}
                type="number"
                value={totalMarks}
                onChange={(e) =>
                  setTotalMarks(parseInt(e.target.value, 10) || 100)
                }
              />
            </div>
          </div>

          {/* Supported Languages & Published Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-lg border bg-muted/20">
            {/* Languages */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Supported Languages
              </Label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <Checkbox
                    checked={languages.includes("en")}
                    disabled={loading}
                    onCheckedChange={() => toggleLanguage("en")}
                  />
                  English (en)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <Checkbox
                    checked={languages.includes("hi")}
                    disabled={loading}
                    onCheckedChange={() => toggleLanguage("hi")}
                  />
                  Hindi (hi)
                </label>
              </div>
            </div>

            {/* Published Switch */}
            <div className="space-y-2 flex flex-col justify-between">
              <Label className="text-xs font-semibold" htmlFor="test-published">
                Publish Status
              </Label>
              <div className="flex items-center gap-2.5 pt-0.5">
                <Switch
                  checked={isPublished}
                  disabled={loading}
                  id="test-published"
                  onCheckedChange={setIsPublished}
                />
                <span className="text-xs font-medium">
                  {isPublished ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Live (Published)
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Draft (Hidden)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              disabled={loading}
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="gap-1.5" disabled={loading} type="submit">
              {loading && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Test Paper"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
