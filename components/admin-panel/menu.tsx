"use client";

import { Ellipsis, LogOut, LogIn } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";

import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/admin-panel/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li key={index} className={cn("w-full", groupLabel ? "pt-5" : "")}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2" />
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, index) =>
                  !submenus || submenus.length === 0 ? (
                    <div key={index} className="w-full">
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              asChild
                              className="w-full justify-start h-10 mb-1"
                              variant={
                                (active === undefined &&
                                  pathname.startsWith(href)) ||
                                  active
                                  ? "secondary"
                                  : "ghost"
                              }
                            >
                              <Link href={href}>
                                <span
                                  className={cn(isOpen === false ? "" : "mr-2")}
                                >
                                  <Icon className={cn(href.startsWith("/board") ? "text-green-500" : href.startsWith("/exams") ? "text-yellow-500" : "")} size={18} />
                                </span>
                                <p
                                  className={cn(
                                    "max-w-[200px] truncate",
                                    isOpen === false
                                      ? "-translate-x-96 opacity-0"
                                      : "translate-x-0 opacity-100"
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div key={index} className="w-full">
                      <CollapseMenuButton
                        active={
                          active === undefined
                            ? pathname.startsWith(href)
                            : active
                        }
                        icon={Icon}
                        isOpen={isOpen}
                        label={label}
                        submenus={submenus}
                      />
                    </div>
                  )
              )}
            </li>
          ))}
          <li className="w-full grow flex items-end">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  {isAuthenticated ? (
                    <Button
                      className="w-full justify-center h-10 mt-5"
                      variant="outline"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <span className={cn(isOpen === false ? "" : "mr-2")}>
                        <LogOut size={18} />
                      </span>
                      <p
                        className={cn(
                          "whitespace-nowrap",
                          isOpen === false ? "opacity-0 hidden" : "opacity-100"
                        )}
                      >
                        Logout
                      </p>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="w-full justify-center h-10 mt-5"
                      variant="outline"
                    >
                      <Link href="/login">
                        <span className={cn(isOpen === false ? "" : "mr-2")}>
                          <LogIn size={18} />
                        </span>
                        <p
                          className={cn(
                            "whitespace-nowrap",
                            isOpen === false ? "opacity-0 hidden" : "opacity-100"
                          )}
                        >
                          Login
                        </p>
                      </Link>
                    </Button>
                  )}
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">
                    {isAuthenticated ? "Logout" : "Login"}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}
