"use client";

import React, { useState, useMemo } from "react";
import {
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  SearchIcon,
  LayersIcon,
  CheckIcon,
  FolderTreeIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryLevel } from "@/lib/generated/prisma/enums";
import { CategoryTreeNode } from "@/lib/action/admin/category-actions";
import { cn } from "@/lib/utils";

interface CategoryPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treeData: CategoryTreeNode[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string, categoryName: string, fullPath: string) => void;
}

// Level Badge Color Mapper
function getLevelBadge(level: CategoryLevel) {
  switch (level) {
    case CategoryLevel.ROOT:
      return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px] uppercase font-bold">ROOT</Badge>;
    case CategoryLevel.STANDARD:
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] uppercase font-bold">Standard</Badge>;
    case CategoryLevel.SUBJECT:
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] uppercase font-bold">Subject</Badge>;
    case CategoryLevel.CHAPTER:
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] uppercase font-bold">Chapter</Badge>;
    case CategoryLevel.PYQ:
      return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] uppercase font-bold">PYQ</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px] uppercase">{level}</Badge>;
  }
}

// Helper to flatten tree with path
interface FlatItemWithPath {
  node: CategoryTreeNode;
  fullPath: string;
  depth: number;
}

function flattenTreeWithPath(nodes: CategoryTreeNode[], parentPath: string = "", depth: number = 0): FlatItemWithPath[] {
  let list: FlatItemWithPath[] = [];
  for (const n of nodes) {
    const currentPath = parentPath ? `${parentPath} > ${n.name}` : n.name;
    list.push({ node: n, fullPath: currentPath, depth });
    if (n.children && n.children.length > 0) {
      list = list.concat(flattenTreeWithPath(n.children, currentPath, depth + 1));
    }
  }
  return list;
}

export function CategoryPickerModal({
  open,
  onOpenChange,
  treeData,
  selectedCategoryId,
  onSelectCategory,
}: CategoryPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [tempSelectedId, setTempSelectedId] = useState<string>(selectedCategoryId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Flatten tree for path lookups
  const flatItems = useMemo(() => flattenTreeWithPath(treeData), [treeData]);

  // Selected item lookup
  const currentSelection = useMemo(() => {
    return flatItems.find((i) => i.node.id === (tempSelectedId || selectedCategoryId));
  }, [flatItems, tempSelectedId, selectedCategoryId]);

  // Initialize expanded IDs on load
  React.useEffect(() => {
    if (open) {
      setTempSelectedId(selectedCategoryId);
      // Auto expand all nodes up to 2 levels
      const initial = new Set<string>();
      for (const item of flatItems) {
        if (item.depth < 2) initial.add(item.node.id);
      }
      setExpandedIds(initial);
    }
  }, [open, selectedCategoryId, flatItems]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(flatItems.map((i) => i.node.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Filtered list when searching
  const isFiltering = Boolean(searchQuery.trim() || levelFilter !== "ALL");
  const filteredFlatList = useMemo(() => {
    if (!isFiltering) return [];
    const q = searchQuery.toLowerCase().trim();
    return flatItems.filter((item) => {
      const matchesSearch = !q || item.fullPath.toLowerCase().includes(q) || item.node.name.toLowerCase().includes(q) || item.node.slug.toLowerCase().includes(q);
      const matchesLevel = levelFilter === "ALL" || item.node.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [flatItems, isFiltering, searchQuery, levelFilter]);

  const handleConfirm = () => {
    if (currentSelection) {
      onSelectCategory(currentSelection.node.id, currentSelection.node.name, currentSelection.fullPath);
      onOpenChange(false);
    }
  };

  // Render recursive tree node
  const renderTreeNode = (node: CategoryTreeNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = (tempSelectedId || selectedCategoryId) === node.id;

    return (
      <div key={node.id} className="flex flex-col">
        <div
          onClick={() => setTempSelectedId(node.id)}
          className={cn(
            "group flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs cursor-pointer transition-colors select-none",
            isSelected
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "hover:bg-muted/80 text-foreground"
          )}
          style={{ paddingLeft: `${Math.max(10, depth * 22 + 10)}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(node.id, e)}
                className={cn(
                  "p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 shrink-0",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {isExpanded ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <span className="w-4.5 shrink-0" />
            )}

            {isExpanded ? (
              <FolderOpenIcon className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary-foreground" : "text-amber-500")} />
            ) : (
              <FolderIcon className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
            )}

            <span className="truncate">{node.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {!isSelected && getLevelBadge(node.level)}
            {isSelected && (
              <span className="flex items-center gap-1 text-[11px] bg-white/20 px-1.5 py-0.5 rounded text-primary-foreground">
                <CheckIcon className="h-3 w-3" /> Selected
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <FolderTreeIcon className="h-5 w-5 text-primary" />
            Select Target Exam Folder
          </DialogTitle>
          <DialogDescription className="text-xs">
            Browse the exam hierarchy tree or search to link this test series to the exact standard, subject, or chapter.
          </DialogDescription>
        </DialogHeader>

        {/* Search & Level Filter Bar */}
        <div className="p-4 py-2.5 bg-muted/30 border-b space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search folder or full path (e.g. BSEB, Math, Class 10)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 bg-background"
              />
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="text-[11px] h-8 px-2 text-muted-foreground"
              >
                Expand All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="text-[11px] h-8 px-2 text-muted-foreground"
              >
                Collapse
              </Button>
            </div>
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
            <span className="text-muted-foreground text-[10px] font-semibold shrink-0">Level:</span>
            {["ALL", "ROOT", "STANDARD", "SUBJECT", "CHAPTER", "PYQ"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={cn(
                  "px-2 py-0.5 rounded-full font-medium transition-colors shrink-0",
                  levelFilter === lvl
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Tree / Search Results Area */}
        <div className="p-4 flex-1 min-h-[300px] max-h-[400px] overflow-y-auto space-y-1">
          {isFiltering ? (
            filteredFlatList.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No matching exam folders found for &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredFlatList.map(({ node, fullPath }) => {
                  const isSelected = (tempSelectedId || selectedCategoryId) === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setTempSelectedId(node.id)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                          : "bg-card hover:bg-muted/60 border-border text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderIcon className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary-foreground" : "text-primary")} />
                        <div className="truncate">
                          <p className="font-semibold truncate">{node.name}</p>
                          <p className={cn("text-[10px] truncate", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                            {fullPath}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[11px] bg-white/20 px-1.5 py-0.5 rounded text-primary-foreground">
                            <CheckIcon className="h-3 w-3" /> Selected
                          </span>
                        ) : (
                          getLevelBadge(node.level)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : treeData.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No categories created yet. Please create a ROOT folder first.
            </div>
          ) : (
            <div className="space-y-0.5">
              {treeData.map((rootNode) => renderTreeNode(rootNode, 0))}
            </div>
          )}
        </div>

        {/* Footer with Selected Lineage Summary & Confirm Button */}
        <DialogFooter className="p-3.5 bg-muted/20 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="text-xs text-left min-w-0">
            {currentSelection ? (
              <div className="flex items-center gap-1.5 truncate">
                <LayersIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground text-[11px] truncate">
                  Path: <strong className="text-foreground">{currentSelection.fullPath}</strong>
                </span>
                {getLevelBadge(currentSelection.node.level)}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">No folder selected</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={!tempSelectedId}
              className="bg-primary text-primary-foreground font-semibold gap-1"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              Confirm Selection
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
