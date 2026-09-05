"use client";

import React, { useState, useEffect } from "react";
import {
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  Edit2Icon,
  Trash2Icon,
  ClockIcon,
  CheckCircle2Icon,
  EyeOffIcon,
  AlertCircleIcon,
  LayersIcon,
  SparklesIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";

import { TestPaperItem, TestPaperDialog } from "./test-paper-dialog";
import { FlatCategoryItem } from "./category-dialog";

import {
  deleteTestPaperAction,
  toggleTestPaperPublishAction,
} from "@/lib/action/admin/test-paper-actions";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";

interface TestPaperManagerProps {
  testPapers: (TestPaperItem & {
    _count?: {
      questions: number;
      attempts: number;
    };
  })[];
  allCategories: FlatCategoryItem[];
  onRefresh: () => void;
  initialCreateForCategory?: string | null;
  onClearInitialCategory?: () => void;
  selectedFolderFilter?: string | null;
}

export function TestPaperManager({
  testPapers,
  allCategories,
  onRefresh,
  initialCreateForCategory,
  onClearInitialCategory,
  selectedFolderFilter,
}: TestPaperManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(
    selectedFolderFilter || "ALL",
  );
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("ALL");

  useEffect(() => {
    if (selectedFolderFilter) {
      setSelectedCategoryFilter(selectedFolderFilter);
    }
  }, [selectedFolderFilter]);

  // Modal dialog states
  const [dialogOpen, setDialogOpen] = useState(
    Boolean(initialCreateForCategory),
  );
  const [testToEdit, setTestToEdit] = useState<TestPaperItem | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(
    initialCreateForCategory || null,
  );

  // Delete dialog state
  const [deleteConfirmTest, setDeleteConfirmTest] =
    useState<TestPaperItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Quick toggle publish state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleTogglePublish = async (test: TestPaperItem) => {
    if (togglingId) return;
    const newStatus = !test.isPublished;
    setTogglingId(test.id);
    try {
      const res = await toggleTestPaperPublishAction({
        id: test.id,
        isPublished: newStatus,
      });
      if (res.success) {
        toast.add({
          type: "success",
          title: newStatus ? "Test Series Live" : "Test Series Set to Draft",
          description: `"${test.title}" is now ${newStatus ? "live and visible to students" : "hidden as draft (not visible to students)"}.`,
        });
        onRefresh();
      } else {
        toast.add({
          type: "error",
          title: "Update Failed",
          description: res.error || "Could not update test status.",
        });
      }
    } catch (err: any) {
      toast.add({
        type: "error",
        title: "Error",
        description: err?.message || "Failed to update test status.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenCreate = (categoryId?: string) => {
    setTestToEdit(null);
    setDefaultCategoryId(categoryId || (allCategories[0]?.id ?? null));
    setDialogOpen(true);
  };

  const handleOpenEdit = (test: TestPaperItem) => {
    setTestToEdit(test);
    setDefaultCategoryId(test.categoryId);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmTest) return;
    const testTitle = deleteConfirmTest.title;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await deleteTestPaperAction({ id: deleteConfirmTest.id });

      if (res.success) {
        toast.add({
          type: "success",
          title: "Test Paper Deleted",
          description: `Test "${testTitle}" has been permanently deleted.`,
        });
        setDeleteConfirmTest(null);
        onRefresh();
      } else {
        setDeleteError(res.error || "Failed to delete test paper");
        toast.add({
          type: "error",
          title: "Delete Failed",
          description: res.error || "Failed to delete test paper.",
        });
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred";

      setDeleteError(msg);
      toast.add({
        type: "error",
        title: "Delete Error",
        description: msg,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter test papers
  const filteredTests = testPapers.filter((test) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = test.title.toLowerCase().includes(q);
      const matchSlug = test.slug.toLowerCase().includes(q);
      const matchCategory = test.category?.name.toLowerCase().includes(q);

      if (!matchTitle && !matchSlug && !matchCategory) return false;
    }

    // Category filter
    if (
      selectedCategoryFilter !== "ALL" &&
      test.categoryId !== selectedCategoryFilter
    ) {
      return false;
    }

    // Status filter
    if (selectedStatusFilter === "PUBLISHED" && !test.isPublished) return false;
    if (selectedStatusFilter === "DRAFT" && test.isPublished) return false;

    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3.5 rounded-xl border shadow-sm">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 text-xs h-9"
              placeholder="Search tests by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="w-[180px]">
            <Select
              value={selectedCategoryFilter}
              onValueChange={(val) => setSelectedCategoryFilter(val || "ALL")}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="All Folders" />
              </SelectTrigger>
              <SelectContent className="max-h-60 text-xs">
                <SelectItem value="ALL">All Categories / Folders</SelectItem>
                {allCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-[130px]">
            <Select
              value={selectedStatusFilter}
              onValueChange={(val) => setSelectedStatusFilter(val || "ALL")}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Live (Published)</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create Test Buttons */}
        <div className="flex items-center gap-2">
          <Link href="/admin/tests/create">
            <Button
              className="text-xs h-9 gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              size="sm"
            >
              <SparklesIcon className="h-4 w-4" />
              Create Test Series (JSON)
            </Button>
          </Link>

          <Button
            className="text-xs h-9 gap-1"
            size="sm"
            variant="outline"
            onClick={() => handleOpenCreate()}
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Quick Test
          </Button>
        </div>
      </div>

      {/* Test Papers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <Card
            key={test.id}
            className="flex flex-col justify-between border-border/80 hover:border-primary/40 transition-colors shadow-sm"
          >
            <CardContent className="p-4.5 flex flex-col gap-3 flex-1">
              {/* Header: Status Badge & Placement Path */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePublish(test);
                  }}
                  disabled={togglingId === test.id}
                  title={test.isPublished ? "Click to disable Live (set to Draft & hide from students)" : "Click to enable Live (publish test series)"}
                  className={cn(
                    "inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer active:scale-95 select-none",
                    test.isPublished
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80",
                    togglingId === test.id && "opacity-60 cursor-not-allowed"
                  )}
                >
                  {togglingId === test.id ? (
                    <span className="flex items-center gap-1">
                      <Loader2Icon className="h-3 w-3 animate-spin" />
                      Updating...
                    </span>
                  ) : test.isPublished ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2Icon className="h-3 w-3" /> Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <EyeOffIcon className="h-3 w-3" /> Draft
                    </span>
                  )}
                </button>

                {/* Category Link */}
                {test.category && (
                  <span
                    className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 truncate max-w-[170px]"
                    title={test.category.name}
                  >
                    <LayersIcon className="h-3 w-3 shrink-0 text-primary" />
                    <span className="truncate">{test.category.name}</span>
                  </span>
                )}
              </div>

              {/* Title & Slug */}
              <div>
                <Link
                  className="hover:underline"
                  href={`/admin/tests/${test.id}`}
                >
                  <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors">
                    {test.title}
                  </h4>
                </Link>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                  /{test.slug}
                </p>
              </div>

              {/* Description if any */}
              {test.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {test.description}
                </p>
              )}

              {/* Stats Chips */}
              <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground border-t border-border/50">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  {test.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <FileTextIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  {test.totalMarks} marks
                </span>
                {test._count && (
                  <span className="text-primary font-medium text-[11px]">
                    {test._count.questions} questions
                  </span>
                )}
              </div>
            </CardContent>

            {/* Card Footer: Action Buttons */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/20 border-t border-border/60">
              <Link href={`/admin/tests/${test.id}`}>
                <Button
                  className="h-7 px-2.5 text-[11px] font-semibold gap-1 text-primary hover:text-primary"
                  size="sm"
                  variant="outline"
                >
                  <FileTextIcon className="h-3 w-3" />
                  Manage Qs ({test._count?.questions ?? 0})
                </Button>
              </Link>

              <div className="flex items-center gap-1">
                <Button
                  className="h-7 px-2 text-xs gap-1"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEdit(test)}
                >
                  <Edit2Icon className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteConfirmTest(test)}
                >
                  <Trash2Icon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card border rounded-xl shadow-sm">
          <FileTextIcon className="h-10 w-10 stroke-1 mb-2 text-muted-foreground/60" />
          <p className="text-sm font-semibold">No Test Papers Found</p>
          <p className="text-xs max-w-sm mt-1 mb-4">
            {searchQuery ||
            selectedCategoryFilter !== "ALL" ||
            selectedStatusFilter !== "ALL"
              ? "No test papers matched your filter criteria."
              : "Create your first test paper and attach it to a syllabus folder."}
          </p>
          <Button
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            size="sm"
            onClick={() => handleOpenCreate()}
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Create Test Paper
          </Button>
        </div>
      )}

      {/* Create / Edit Test Paper Modal */}
      <TestPaperDialog
        allCategories={allCategories}
        defaultCategoryId={defaultCategoryId}
        open={dialogOpen}
        testToEdit={testToEdit}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open && onClearInitialCategory) onClearInitialCategory();
        }}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteConfirmTest)}
        onOpenChange={(open) => !open && setDeleteConfirmTest(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5" />
              Delete &quot;{deleteConfirmTest?.title}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete this test paper and
              its question associations? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <div className="text-destructive font-semibold text-xs">
              {deleteError}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
              onClick={handleDelete}
            >
              {deleteLoading ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
