"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { createTestPaperAction, updateTestPaperAction } from "@/lib/action/admin/test-paper-actions";
import { getAdminCategoryTreeAction, CategoryTreeNode } from "@/lib/action/admin/category-actions";
import { FlatCategoryItem } from "./category-dialog";
import { CategoryPickerModal } from "./category-picker-modal";
import { Loader2Icon, AlertCircleIcon, SparklesIcon, FolderTreeIcon, LayersIcon } from "lucide-react";

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
        const path = found.parent ? `${found.parent.name} > ${found.name}` : found.name;
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
      setLanguages(testToEdit.languages && testToEdit.languages.length > 0 ? testToEdit.languages : ["en"]);
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
          return;
        }
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
          return;
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? `Edit Test: ${testToEdit?.title}` : "Create New Test Paper"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modify test parameters, duration, marks, publish status, or move it to another folder."
              : "Define test title, syllabus folder placement, time duration, and marks."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="test-title" className="text-xs font-semibold">
              Test Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="test-title"
              placeholder="e.g. BSEB Class 10 Math Final Practice Paper 2024"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="test-slug" className="text-xs font-semibold">
                URL Slug <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <SparklesIcon className="h-3 w-3" />
                Regenerate from Title
              </button>
            </div>
            <Input
              id="test-slug"
              placeholder="e.g. bseb-class-10-math-practice-2024"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Target Folder / Category Placement */}
          <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <LayersIcon className="h-3.5 w-3.5 text-primary" />
                Target Exam Folder (Placement) <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPickerModalOpen(true)}
                className="h-7 text-[11px] gap-1.5 font-semibold text-primary hover:bg-primary/10 border-primary/40"
              >
                <FolderTreeIcon className="h-3.5 w-3.5" />
                Browse Tree
              </Button>
            </div>

            <div
              onClick={() => setPickerModalOpen(true)}
              className="flex items-center justify-between p-2.5 rounded-lg border bg-background hover:border-primary/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 min-w-0">
                <LayersIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {allCategories.find((c) => c.id === categoryId)?.name || "Select a folder..."}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {selectedCategoryPath || "Click 'Browse Tree' to choose folder from hierarchy"}
                  </p>
                </div>
              </div>

              {categoryId && (
                <Badge variant="outline" className="text-[10px] uppercase font-bold shrink-0">
                  {allCategories.find((c) => c.id === categoryId)?.level || "FOLDER"}
                </Badge>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground">
              Select which subject, chapter, class, or board folder contains this test.
            </p>
          </div>

          {/* Category Picker Tree Modal */}
          <CategoryPickerModal
            open={pickerModalOpen}
            onOpenChange={setPickerModalOpen}
            treeData={categoryTree}
            selectedCategoryId={categoryId}
            onSelectCategory={(id, _name, path) => {
              setCategoryId(id);
              setSelectedCategoryPath(path);
            }}
          />

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="test-desc" className="text-xs font-semibold">
              Description / Instructions
            </Label>
            <Textarea
              id="test-desc"
              rows={2}
              placeholder="Brief summary of syllabus covered, negative marking guidelines, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Duration & Total Marks Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="test-duration" className="text-xs font-semibold">
                Duration (in minutes) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="test-duration"
                type="number"
                min={1}
                max={600}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 60)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="test-marks" className="text-xs font-semibold">
                Total Marks <span className="text-destructive">*</span>
              </Label>
              <Input
                id="test-marks"
                type="number"
                min={0}
                max={1000}
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value, 10) || 100)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Supported Languages & Published Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-lg border bg-muted/20">
            {/* Languages */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Supported Languages</Label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <Checkbox
                    checked={languages.includes("en")}
                    onCheckedChange={() => toggleLanguage("en")}
                    disabled={loading}
                  />
                  English (en)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <Checkbox
                    checked={languages.includes("hi")}
                    onCheckedChange={() => toggleLanguage("hi")}
                    disabled={loading}
                  />
                  Hindi (hi)
                </label>
              </div>
            </div>

            {/* Published Switch */}
            <div className="space-y-2 flex flex-col justify-between">
              <Label htmlFor="test-published" className="text-xs font-semibold">
                Publish Status
              </Label>
              <div className="flex items-center gap-2.5 pt-0.5">
                <Switch
                  id="test-published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                  disabled={loading}
                />
                <span className="text-xs font-medium">
                  {isPublished ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Live (Published)</span>
                  ) : (
                    <span className="text-muted-foreground">Draft (Hidden)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Test Paper"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
