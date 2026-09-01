"use client";
import Image from "next/image";
import Link from "next/link";

import { Menu } from "@/components/admin-panel/menu";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";
import { buttonVariants } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const sidebar = useStore(useSidebar, (x) => x);

  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden",
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <div
        className="relative h-full flex flex-col px-3 py-4 overflow-hidden shadow-md dark:shadow-sidebar-border bg-sidebar text-sidebar-foreground"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <Link
          className={cn(
            buttonVariants({ variant: "link" }),
            "flex items-center gap-2 transition-transform ease-in-out duration-300 mb-1",
            !getOpenState() ? "translate-x-1" : "translate-x-0",
          )}
          href="/home"
        >
          <Image
            alt="Logo"
            className="mr-1"
            height={24}
            src="/logo.svg"
            width={24}
          />
          <h1
            className={cn(
              "font-brand text-2xl tracking-wide whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
              !getOpenState()
                ? "-translate-x-96 opacity-0 hidden"
                : "translate-x-0 opacity-100",
            )}
          >
            Sabnam
          </h1>
        </Link>
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
