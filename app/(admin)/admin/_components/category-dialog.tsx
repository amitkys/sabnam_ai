"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CategoryLevel, ExamDomain } from "@/lib/generated/prisma/enums";
import { createCategoryAction, updateCategoryAction } from "@/lib/action/admin/category-actions";
import { Loader2Icon, AlertCircleIcon, SparklesIcon } from "lucide-react";

export interface FlatCategoryItem {
  id: string;
  name: string;
  level: CategoryLevel;
  slug: string;
  domain?: ExamDomain | null;
  parentId?: string | null;
  parent?: {
    id: string;
    name: string;
    level: CategoryLevel;
  } | null;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: FlatCategoryItem | null;
  defaultParentId?: string | null;
  defaultLevel?: CategoryLevel;
  allCategories: FlatCategoryItem[];
  onSuccess: () => void;
}

const LEVEL_OPTIONS: { value: CategoryLevel; label: string; desc: string }[] = [
  { value: CategoryLevel.ROOT, label: "ROOT (Exam Board / Org)", desc: "Top-level board, e.g. BSEB, CBSE, JEE" },
  { value: CategoryLevel.EXAM, label: "EXAM (Exam Name)", desc: "Intermediary exam level" },
  { value: CategoryLevel.STANDARD, label: "STANDARD (Class / Grade)", desc: "Class 10, Class 12, etc." },
  { value: CategoryLevel.SUBJECT, label: "SUBJECT (Subject)", desc: "Mathematics, Physics, etc." },
  { value: CategoryLevel.CHAPTER, label: "CHAPTER (Chapter / Topic)", desc: "Trigonometry, Calculus, etc." },
  { value: CategoryLevel.PYQ, label: "PYQ (Previous Year Papers)", desc: "Previous year question sets" },
];

const DOMAIN_OPTIONS: { value: ExamDomain; label: string }[] = [
  { value: ExamDomain.BOARD, label: "Board Exams (BSEB, CBSE, ICSE)" },
  { value: ExamDomain.ENTRANCE, label: "Entrance Exams (JEE, NEET, CUET)" },
  { value: ExamDomain.COMPETITIVE, label: "Competitive Exams (SSC, RRB, UPSC)" },
  { value: ExamDomain.OLYMPIAD, label: "Olympiad (IMO, NSO, NTSE)" },
  { value: ExamDomain.LANGUAGE, label: "Language Certification (IELTS, TOEFL)" },
  { value: ExamDomain.UNIVERSITY, label: "University Exams" },
  { value: ExamDomain.RECRUITMENT, label: "Govt Recruitment (Police, PSC)" },
  { value: ExamDomain.SCHOLARSHIP, label: "Scholarships (NMMS, INSPIRE)" },
  { value: ExamDomain.VOCATIONAL, label: "Vocational / Skill (ITI, Polytechnic)" },
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryDialog({
  open,
  onOpenChange,
  categoryToEdit,
  defaultParentId,
  defaultLevel,
  allCategories,
  onSuccess,
}: CategoryDialogProps) {
  const isEditing = Boolean(categoryToEdit);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [level, setLevel] = useState<CategoryLevel>(CategoryLevel.ROOT);
  const [domain, setDomain] = useState<ExamDomain>(ExamDomain.BOARD);
  const [parentId, setParentId] = useState<string>("none");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form when dialog opens
  useEffect(() => {
    if (!open) return;

    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
      setLevel(categoryToEdit.level);
      setDomain(categoryToEdit.domain || ExamDomain.BOARD);
      setParentId(categoryToEdit.parentId || "none");
      setIsSlugManual(true);
    } else {
      setName("");
      setSlug("");
      setLevel(defaultLevel || CategoryLevel.ROOT);
      setDomain(ExamDomain.BOARD);
      setParentId(defaultParentId || "none");
      setIsSlugManual(false);
    }
    setError(null);
  }, [open, categoryToEdit, defaultParentId, defaultLevel]);

  // Auto update slug when name changes (if user hasn't manually edited slug)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setIsSlugManual(true);
  };

  const handleAutoSlug = () => {
    const s = generateSlug(name);
    setSlug(s);
    setIsSlugManual(false);
  };

  // Filter available parent categories (prevent setting itself or invalid options)
  const parentOptions = allCategories.filter((c) => {
    if (isEditing && categoryToEdit) {
      return c.id !== categoryToEdit.id;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a category name.");
      return;
    }

    const finalSlug = (slug || generateSlug(name)).trim();
    if (!finalSlug) {
      setError("Please provide a category slug.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const targetParentId = parentId === "none" ? null : parentId;
      const targetDomain = level === CategoryLevel.ROOT ? domain : null;

      if (isEditing && categoryToEdit) {
        const res = await updateCategoryAction({
          id: categoryToEdit.id,
          name: name.trim(),
          slug: finalSlug,
          level,
          domain: targetDomain,
          parentId: targetParentId,
        });

        if (!res.success) {
          setError(res.error || "Failed to update category");
          return;
        }
      } else {
        const res = await createCategoryAction({
          name: name.trim(),
          slug: finalSlug,
          level,
          domain: targetDomain,
          parentId: targetParentId,
        });

        if (!res.success) {
          setError(res.error || "Failed to create category");
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? `Edit Category: ${categoryToEdit?.name}` : "Create New Exam Folder / Category"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modify folder name, slug, level, or move it to a different parent category."
              : "Add a new exam board, class, subject, chapter, or subfolder to the hierarchy."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Name & Auto Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name" className="text-xs font-semibold">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              placeholder="e.g. Mathematics, Class 10, Bihar Board (BSEB)"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="cat-slug" className="text-xs font-semibold">
                URL Slug <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <SparklesIcon className="h-3 w-3" />
                Regenerate from Name
              </button>
            </div>
            <Input
              id="cat-slug"
              placeholder="e.g. mathematics, class-10, bseb"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={loading}
            />
            <p className="text-[11px] text-muted-foreground">
              Unique identifier used in web URLs (letters, numbers, hyphens only).
            </p>
          </div>

          {/* Hierarchy Level */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-level" className="text-xs font-semibold">
              Category Level Depth <span className="text-destructive">*</span>
            </Label>
            <Select
              value={level}
              onValueChange={(val) => setLevel((val as CategoryLevel) || CategoryLevel.ROOT)}
              disabled={loading}
            >
              <SelectTrigger id="cat-level" className="w-full">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Domain (Only for ROOT Level) */}
          {level === CategoryLevel.ROOT && (
            <div className="space-y-1.5 p-3 rounded-lg border bg-primary/5 border-primary/20">
              <Label htmlFor="cat-domain" className="text-xs font-semibold text-primary">
                Top-Level Exam Domain
              </Label>
              <Select
                value={domain}
                onValueChange={(val) => setDomain((val as ExamDomain) || ExamDomain.BOARD)}
                disabled={loading}
              >
                <SelectTrigger id="cat-domain" className="w-full bg-background">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAIN_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Domain categorizes the exam card on the main student portal.
              </p>
            </div>
          )}

          {/* Parent Category Picker (Placement / Re-parenting) */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-parent" className="text-xs font-semibold">
              Parent Folder / Category (Placement)
            </Label>
            <Select
              value={parentId}
              onValueChange={(val) => setParentId(val || "none")}
              disabled={loading}
            >
              <SelectTrigger id="cat-parent" className="w-full">
                <SelectValue placeholder="None (Root Level)" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="none" className="text-xs font-semibold text-primary">
                  [None / Top-Level Folder]
                </SelectItem>
                {parentOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    <span className="font-semibold text-foreground">{c.name}</span>{" "}
                    <span className="text-muted-foreground text-[10px]">
                      ({c.level}{c.parent ? ` ↳ under ${c.parent.name}` : ""})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Select which folder contains this item. Change this to move this category anywhere in the tree.
            </p>
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
              {isEditing ? "Save Changes" : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
