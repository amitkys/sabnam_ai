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
  UserCheckIcon,
} from "lucide-react";

import { FlatCategoryItem } from "./category-dialog";
import { TestPaperItem } from "./test-paper-dialog";
import { CategoryManager } from "./category-manager";
import { TestPaperManager } from "./test-paper-manager";
import { AttemptManager } from "./attempt-manager";

import { CategoryTreeNode } from "@/lib/action/admin/category-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [createTestCategoryId, setCreateTestCategoryId] = useState<
    string | null
  >(null);
  const [selectedCategoryFilterForTests, setSelectedCategoryFilterForTests] =
    useState<string | null>(null);

  // Quick summary statistics
  const totalCategories = initialFlatCategories.length;
  const rootBoards = initialFlatCategories.filter(
    (c) => c.level === "ROOT",
  ).length;
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
            Exam &amp; Candidate Management Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize exam boards, subjects, tests, track live candidate
            attempts, and generate official reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="text-xs h-8 gap-1.5"
            disabled={isRefreshing}
            size="sm"
            variant="outline"
            onClick={onRefreshData}
          >
            <RefreshCwIcon
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            size="sm"
            variant="ghost"
            onClick={handleLogout}
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
              <p className="text-xs text-muted-foreground font-medium">
                Root Exam Boards
              </p>
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
              <p className="text-xs text-muted-foreground font-medium">
                Total Folders / Nodes
              </p>
              <p className="text-xl font-bold text-foreground">
                {totalCategories}
              </p>
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
              <p className="text-xs text-muted-foreground font-medium">
                Total Test Papers
              </p>
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
              <p className="text-xs text-muted-foreground font-medium">
                Live (Published)
              </p>
              <p className="text-xl font-bold text-foreground">
                {publishedTests}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Tabs */}
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full sm:w-[620px] grid-cols-3 p-1 h-10 bg-muted/60">
          <TabsTrigger
            className="text-xs font-semibold gap-1.5"
            value="categories"
          >
            <FolderTreeIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Folder &amp; Category</span> Tree
          </TabsTrigger>
          <TabsTrigger className="text-xs font-semibold gap-1.5" value="tests">
            <FileTextIcon className="h-4 w-4" />
            Test Papers
          </TabsTrigger>
          <TabsTrigger
            className="text-xs font-semibold gap-1.5"
            value="attempts"
          >
            <UserCheckIcon className="h-4 w-4" />
            Candidate Attempts
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Category Tree Manager */}
        <TabsContent className="mt-4" value="categories">
          <CategoryManager
            flatCategories={initialFlatCategories}
            treeData={initialTree}
            onOpenCreateTestForCategory={handleOpenCreateTestForCategory}
            onRefresh={onRefreshData}
            onViewTestsForCategory={handleViewTestsForCategory}
          />
        </TabsContent>

        {/* Tab 2: Test Paper Manager */}
        <TabsContent className="mt-4" value="tests">
          <TestPaperManager
            allCategories={initialFlatCategories}
            initialCreateForCategory={createTestCategoryId}
            selectedFolderFilter={selectedCategoryFilterForTests}
            testPapers={initialTestPapers}
            onClearInitialCategory={() => setCreateTestCategoryId(null)}
            onRefresh={onRefreshData}
          />
        </TabsContent>

        {/* Tab 3: Attempt Manager */}
        <TabsContent className="mt-4" value="attempts">
          <AttemptManager
            allCategories={initialFlatCategories}
            testPapers={initialTestPapers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
