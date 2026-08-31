import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheckIcon, HomeIcon } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin Panel | Sabnam AI",
  description: "Manage exam folders, categories, subcategories, and test series.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Admin Topbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
              <span className="text-base font-bold tracking-tight">Sabnam Admin</span>
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex border-primary/40 text-primary bg-primary/5 text-xs font-medium">
              Portal v1.0
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/home">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <HomeIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Student View</span>
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-6 sm:px-8">
        {children}
      </main>
    </div>
  );
}
