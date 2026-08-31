"use client";

import React, { useState } from "react";
import {
  FolderTreeIcon,
  FileTextIcon,
  LogOutIcon,
  LayersIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryTreeNode } from "@/lib/action/admin/category-actions";
import { FlatCategoryItem } from "./category-dialog";
import { TestPaperItem } from "./test-paper-dialog";
import { CategoryManager } from "./category-manager";
import { TestPaperManager } from "./test-paper-manager";
import { adminLogoutAction } from "@/lib/action/admin/admin-auth-actions";

interface AdminDashboardProps {
  initialTree: CategoryTreeNode[];
  initialFlatCategories: FlatCategoryItem[];
  initialTestPapers: TestPaperItem[];
  onLogout: () => void;
  onRefreshData: () => Promise<void>;
  isRefreshing: boolean;
}

export function AdminDashboard({
  initialTree,
  initialFlatCategories,
  initialTestPapers,
  onLogout,
  onRefreshData,
  isRefreshing,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("categories");
  const [createTestCategoryId, setCreateTestCategoryId] = useState<string | null>(null);
  const [selectedCategoryFilterForTests, setSelectedCategoryFilterForTests] = useState<string | null>(null);

  // Quick summary statistics
  const totalCategories = initialFlatCategories.length;
  const rootBoards = initialFlatCategories.filter((c) => c.level === "ROOT").length;
  const totalTests = initialTestPapers.length;
  const publishedTests = initialTestPapers.filter((t) => t.isPublished).length;

  const handleOpenCreateTestForCategory = (categoryId: string) => {
    setCreateTestCategoryId(categoryId);
    setActiveTab("tests");
  };

  const handleViewTestsForCategory = (categoryId: string) => {
    setSelectedCategoryFilterForTests(categoryId);
    setActiveTab("tests");
  };

  const handleLogout = async () => {
    await adminLogoutAction();
    onLogout();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Admin Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            Exam Structure & Test Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize exam boards, classes, subjects, chapters, and manage test paper placements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="text-xs h-8 gap-1.5"
          >
            <RefreshCwIcon className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <Card className="bg-card shadow-sm border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BookOpenIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Root Exam Boards</p>
              <p className="text-xl font-bold text-foreground">{rootBoards}</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="bg-card shadow-sm border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayersIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Folders / Nodes</p>
              <p className="text-xl font-bold text-foreground">{totalCategories}</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="bg-card shadow-sm border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileTextIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Test Papers</p>
              <p className="text-xl font-bold text-foreground">{totalTests}</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="bg-card shadow-sm border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Live (Published)</p>
              <p className="text-xl font-bold text-foreground">{publishedTests}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full sm:w-[420px] grid-cols-2 p-1 h-10 bg-muted/60">
          <TabsTrigger value="categories" className="text-xs font-semibold gap-1.5">
            <FolderTreeIcon className="h-4 w-4" />
            Folder & Category Tree
          </TabsTrigger>
          <TabsTrigger value="tests" className="text-xs font-semibold gap-1.5">
            <FileTextIcon className="h-4 w-4" />
            Test Papers & Placement
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Category Tree Manager */}
        <TabsContent value="categories" className="mt-4">
          <CategoryManager
            treeData={initialTree}
            flatCategories={initialFlatCategories}
            onRefresh={onRefreshData}
            onOpenCreateTestForCategory={handleOpenCreateTestForCategory}
            onViewTestsForCategory={handleViewTestsForCategory}
          />
        </TabsContent>

        {/* Tab 2: Test Paper Manager */}
        <TabsContent value="tests" className="mt-4">
          <TestPaperManager
            testPapers={initialTestPapers}
            allCategories={initialFlatCategories}
            onRefresh={onRefreshData}
            initialCreateForCategory={createTestCategoryId}
            onClearInitialCategory={() => setCreateTestCategoryId(null)}
            selectedFolderFilter={selectedCategoryFilterForTests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
