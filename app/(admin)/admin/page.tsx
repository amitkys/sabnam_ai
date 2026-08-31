"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AdminLoginForm } from "./_components/admin-login-form";
import { AdminDashboard } from "./_components/admin-dashboard";
import { checkAdminAuthAction } from "@/lib/action/admin/admin-auth-actions";
import {
  getAdminCategoryTreeAction,
  getAllCategoriesFlatAction,
  CategoryTreeNode,
} from "@/lib/action/admin/category-actions";
import { getAdminTestPapersAction } from "@/lib/action/admin/test-paper-actions";
import { FlatCategoryItem } from "./_components/category-dialog";
import { TestPaperItem } from "./_components/test-paper-dialog";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";

export default function AdminPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Data state
  const [treeData, setTreeData] = useState<CategoryTreeNode[]>([]);
  const [flatCategories, setFlatCategories] = useState<FlatCategoryItem[]>([]);
  const [testPapers, setTestPapers] = useState<TestPaperItem[]>([]);

  // Check auth on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await checkAdminAuthAction();
        if (res.success && res.data.isAuthenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }
    initAuth();
  }, []);

  // Fetch all admin data
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [treeRes, flatRes, testRes] = await Promise.all([
        getAdminCategoryTreeAction(),
        getAllCategoriesFlatAction(),
        getAdminTestPapersAction(),
      ]);

      if (treeRes.success) {
        setTreeData(treeRes.data);
      }
      if (flatRes.success) {
        setFlatCategories(flatRes.data as FlatCategoryItem[]);
      }
      if (testRes.success) {
        setTestPapers(testRes.data as TestPaperItem[]);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // When user becomes authenticated, fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Loader2Icon className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground font-medium">Checking admin session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginForm onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminDashboard
      initialTree={treeData}
      initialFlatCategories={flatCategories}
      initialTestPapers={testPapers}
      onLogout={() => setIsAuthenticated(false)}
      onRefreshData={fetchData}
      isRefreshing={loadingData}
    />
  );
}
