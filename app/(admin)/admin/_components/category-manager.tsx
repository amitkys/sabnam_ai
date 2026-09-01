"use client";

import React, { useState } from "react";
import {
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  FileTextIcon,
  SearchIcon,
  ChevronsUpDownIcon,
  LayersIcon,
  AlertCircleIcon,
  MoreVerticalIcon,
  SparklesIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { FlatCategoryItem, CategoryDialog } from "./category-dialog";

import { CategoryLevel } from "@/lib/generated/prisma/enums";
import {
  CategoryTreeNode,
  deleteCategoryAction,
} from "@/lib/action/admin/category-actions";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface CategoryManagerProps {
  treeData: CategoryTreeNode[];
  flatCategories: FlatCategoryItem[];
  onRefresh: () => void;
  onOpenCreateTestForCategory?: (categoryId: string) => void;
  onViewTestsForCategory?: (categoryId: string) => void;
}

const LEVEL_COLORS: Record<CategoryLevel, { badge: string; text: string }> = {
  ROOT: {
    badge:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
  },
  EXAM: {
    badge:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  STANDARD: {
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  SUBJECT: {
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  CHAPTER: {
    badge:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
  },
  PYQ: {
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
  },
};

function inferNextLevel(currentLevel: CategoryLevel): CategoryLevel {
  switch (currentLevel) {
    case CategoryLevel.ROOT:
      return CategoryLevel.STANDARD;
    case CategoryLevel.STANDARD:
      return CategoryLevel.SUBJECT;
    case CategoryLevel.SUBJECT:
      return CategoryLevel.CHAPTER;
    case CategoryLevel.CHAPTER:
      return CategoryLevel.CHAPTER;
    default:
      return CategoryLevel.STANDARD;
  }
}

export function CategoryManager({
  treeData,
  flatCategories,
  onRefresh,
  onOpenCreateTestForCategory,
  onViewTestsForCategory,
}: CategoryManagerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("ALL");
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() => {
    // Default expand root nodes
    return new Set(treeData.map((node) => node.id));
  });

  // Modal dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<FlatCategoryItem | null>(
    null,
  );
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [defaultLevel, setDefaultLevel] = useState<CategoryLevel>(
    CategoryLevel.ROOT,
  );

  // Delete dialog state
  const [deleteConfirmNode, setDeleteConfirmNode] =
    useState<CategoryTreeNode | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (nodes: CategoryTreeNode[]) => {
      for (const n of nodes) {
        allIds.add(n.id);
        if (n.children.length > 0) collect(n.children);
      }
    };

    collect(treeData);
    setExpandedNodeIds(allIds);
  };

  const collapseAll = () => {
    setExpandedNodeIds(new Set());
  };

  const handleOpenCreateRoot = () => {
    setCategoryToEdit(null);
    setDefaultParentId(null);
    setDefaultLevel(CategoryLevel.ROOT);
    setDialogOpen(true);
  };

  const handleOpenAddChild = (parent: CategoryTreeNode) => {
    setCategoryToEdit(null);
    setDefaultParentId(parent.id);
    setDefaultLevel(inferNextLevel(parent.level));
    setDialogOpen(true);
  };

  const handleOpenEdit = (node: CategoryTreeNode) => {
    const flatItem = flatCategories.find((c) => c.id === node.id) || {
      id: node.id,
      name: node.name,
      slug: node.slug,
      level: node.level,
      domain: node.domain,
      parentId: node.parentId,
    };

    setCategoryToEdit(flatItem);
    setDefaultParentId(node.parentId);
    setDefaultLevel(node.level);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmNode) return;
    const nodeName = deleteConfirmNode.name;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await deleteCategoryAction({ id: deleteConfirmNode.id });

      if (res.success) {
        toast.add({
          type: "success",
          title: "Category Deleted",
          description: `"${nodeName}" and all its subfolders were removed.`,
        });
        setDeleteConfirmNode(null);
        onRefresh();
      } else {
        setDeleteError(res.error || "Failed to delete category");
        toast.add({
          type: "error",
          title: "Delete Failed",
          description: res.error || "Failed to delete category.",
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

  // Filter helper: matches search query
  const matchesSearch = (node: CategoryTreeNode): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesSelf =
      node.name.toLowerCase().includes(q) ||
      node.slug.toLowerCase().includes(q);

    if (matchesSelf) return true;

    return node.children.some(matchesSearch);
  };

  // Filter helper: matches level filter
  const matchesLevel = (node: CategoryTreeNode): boolean => {
    if (selectedLevelFilter === "ALL") return true;
    const matchesSelf = node.level === selectedLevelFilter;

    if (matchesSelf) return true;

    return node.children.some(matchesLevel);
  };

  // Render individual tree item recursively
  const renderTreeNode = (node: CategoryTreeNode, depth: number = 0) => {
    if (!matchesSearch(node) || !matchesLevel(node)) return null;

    const isExpanded =
      expandedNodeIds.has(node.id) || Boolean(searchQuery.trim());
    const hasChildren = node.children.length > 0;
    const color = LEVEL_COLORS[node.level] || LEVEL_COLORS.ROOT;

    return (
      <div key={node.id} className="flex flex-col select-none">
        {/* Node Row */}
        <div
          className={cn(
            "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
            "hover:bg-accent/70 hover:text-accent-foreground border border-transparent hover:border-border/60",
            depth === 0 && "bg-muted/30 font-medium mb-1",
            depth > 0 && "my-0.5",
          )}
          style={{ paddingLeft: `${Math.max(12, depth * 22 + 12)}px` }}
        >
          {/* Left: Expand toggle, Icon, Name, Slug, Badges */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Expand / Collapse Chevron */}
            {hasChildren ? (
              <button
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                type="button"
                onClick={() => toggleExpand(node.id)}
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <div className="w-5 shrink-0" />
            )}

            {/* Folder Icon */}
            {isExpanded && hasChildren ? (
              <FolderOpenIcon className={cn("h-4 w-4 shrink-0", color.text)} />
            ) : (
              <FolderIcon className={cn("h-4 w-4 shrink-0", color.text)} />
            )}

            {/* Name & Slug */}
            <div className="flex items-center gap-2 truncate">
              <span className="truncate font-semibold text-foreground">
                {node.name}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono truncate hidden sm:inline">
                /{node.slug}
              </span>
            </div>

            {/* Level Badge */}
            <Badge
              className={cn(
                "text-[10px] font-semibold uppercase px-1.5 py-0",
                color.badge,
              )}
              variant="outline"
            >
              {node.level}
            </Badge>

            {/* Domain Badge if ROOT */}
            {node.domain && (
              <Badge
                className="text-[10px] px-1.5 py-0 hidden md:inline-flex"
                variant="secondary"
              >
                {node.domain}
              </Badge>
            )}
          </div>

          {/* Right: Counter chips & Action dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Subfolders count */}
            {node.childrenCount > 0 && (
              <span
                className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
                title={`${node.childrenCount} subcategories`}
              >
                <LayersIcon className="h-3 w-3" />
                {node.childrenCount}
              </span>
            )}

            {/* Tests count - Clickable to navigate to Tests tab */}
            {node.testCount > 0 && (
              <button
                className="flex items-center gap-1 text-[11px] text-primary bg-primary/10 hover:bg-primary/20 transition-colors px-1.5 py-0.5 rounded font-medium cursor-pointer"
                title={`Click to view & manage ${node.testCount} test papers in ${node.name}`}
                type="button"
                onClick={() =>
                  onViewTestsForCategory && onViewTestsForCategory(node.id)
                }
              >
                <FileTextIcon className="h-3 w-3" />
                {node.testCount} tests
              </button>
            )}

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-70 group-hover:opacity-100 hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                <MoreVerticalIcon className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 text-xs">
                {/* Manage Tests Action if tests exist */}
                {node.testCount > 0 && onViewTestsForCategory && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer font-semibold text-primary"
                    onClick={() => onViewTestsForCategory(node.id)}
                  >
                    <FileTextIcon className="h-3.5 w-3.5" />
                    Manage Tests ({node.testCount})
                  </DropdownMenuItem>
                )}

                {/* Create Test Series for this category */}
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
                  onClick={() =>
                    router.push(`/admin/tests/create?categoryId=${node.id}`)
                  }
                >
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Create Test Series (JSON)
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => handleOpenAddChild(node)}
                >
                  <PlusIcon className="h-3.5 w-3.5 text-primary" />
                  Add Subfolder
                </DropdownMenuItem>
                {onOpenCreateTestForCategory && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => onOpenCreateTestForCategory(node.id)}
                  >
                    <FileTextIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Quick Blank Test
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => handleOpenEdit(node)}
                >
                  <Edit2Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  Edit & Place
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 text-destructive cursor-pointer focus:text-destructive"
                  onClick={() => setDeleteConfirmNode(node)}
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Child Subfolders */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col border-l border-border/40 ml-4 pl-1">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3.5 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 text-xs h-9"
              placeholder="Search folders or slugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Level Filter Pills */}
          <div className="hidden lg:flex items-center gap-1">
            {["ALL", "ROOT", "STANDARD", "SUBJECT", "CHAPTER"].map((lvl) => (
              <button
                key={lvl}
                className={cn(
                  "text-[11px] font-medium px-2 py-1 rounded-md transition-colors",
                  selectedLevelFilter === lvl
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted",
                )}
                type="button"
                onClick={() => setSelectedLevelFilter(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Tree controls & Create Root */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            className="text-xs h-8 gap-1 hidden sm:inline-flex"
            size="sm"
            variant="outline"
            onClick={expandAll}
          >
            <ChevronsUpDownIcon className="h-3.5 w-3.5" />
            Expand All
          </Button>

          <Button
            className="text-xs h-8 gap-1 hidden sm:inline-flex"
            size="sm"
            variant="outline"
            onClick={collapseAll}
          >
            Collapse
          </Button>

          <Button
            className="text-xs h-8 gap-1.5 font-semibold bg-primary hover:bg-primary/90"
            size="sm"
            onClick={handleOpenCreateRoot}
          >
            <PlusIcon className="h-4 w-4" />
            Add Root Exam Board
          </Button>
        </div>
      </div>

      {/* Tree Content Container */}
      <div className="rounded-xl border bg-card p-4 shadow-sm min-h-[350px]">
        {treeData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <FolderIcon className="h-10 w-10 stroke-1 mb-2 text-muted-foreground/60" />
            <p className="text-sm font-semibold">No Exam Folders Found</p>
            <p className="text-xs max-w-sm mt-1 mb-4">
              Get started by creating a top-level ROOT folder (e.g. Bihar Board,
              CBSE, JEE Main).
            </p>
            <Button
              className="gap-1.5 text-xs"
              size="sm"
              onClick={handleOpenCreateRoot}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Create First Exam Folder
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {treeData.map((rootNode) => renderTreeNode(rootNode, 0))}
          </div>
        )}
      </div>

      {/* Category Create/Edit Modal */}
      <CategoryDialog
        allCategories={flatCategories}
        categoryToEdit={categoryToEdit}
        defaultLevel={defaultLevel}
        defaultParentId={defaultParentId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteConfirmNode)}
        onOpenChange={(open) => !open && setDeleteConfirmNode(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5" />
              Delete &quot;{deleteConfirmNode?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete this exam folder? This
              action will cascade delete all nested subcategories and tests.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteConfirmNode && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200 space-y-1.5 text-left">
              <div className="font-semibold text-xs flex items-center gap-1 text-amber-700 dark:text-amber-400">
                Cascade Deletion Summary:
              </div>
              <ul className="text-[11px] list-disc list-inside space-y-0.5 opacity-90">
                <li>
                  All nested subcategories under &quot;{deleteConfirmNode.name}
                  &quot; will be deleted.
                </li>
                <li>All test papers inside these folders will be deleted.</li>
                <li>
                  <strong>Questions:</strong> Questions linked <em>only</em> to
                  this folder or its tests will be deleted. Any question shared
                  with other exam series outside this folder will be{" "}
                  <strong>preserved</strong>.
                </li>
              </ul>
            </div>
          )}

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
