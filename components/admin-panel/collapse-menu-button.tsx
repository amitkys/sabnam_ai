"use client";

import { IconChevronDown, IconPointFilled } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

interface CollapseMenuButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  submenus: Submenu[];
  isOpen: boolean | undefined;
}

export function CollapseMenuButton({
  icon: Icon,
  label,
  active,
  submenus,
  isOpen,
}: CollapseMenuButtonProps) {
  const pathname = usePathname();
  const isSubmenuActive =
    active ||
    submenus.some((submenu) =>
      submenu.active === undefined ? submenu.href === pathname : submenu.active,
    );
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive);

  return isOpen ? (
    <Collapsible
      open={isCollapsed}
      onOpenChange={setIsCollapsed}
      className="w-full"
    >
      <CollapsibleTrigger
        className="data-open:[&_svg.transition-transform]:rotate-180 mb-1 w-full"
        render={
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-10",
              isSubmenuActive &&
              "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <div className="w-full items-center flex justify-between">
              <div className="flex items-center">
                <span className="mr-4">
                  <Icon className="size-5" />
                </span>
                <p
                  className={cn(
                    "max-w-[150px] truncate",
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-96 opacity-0",
                  )}
                >
                  {label}
                </p>
              </div>
              <div
                className={cn(
                  "whitespace-nowrap",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0",
                )}
              >
                <IconChevronDown className="size-5 transition-transform duration-200" />
              </div>
            </div>
          </Button>
        }
      />
      <CollapsibleContent className="overflow-hidden data-closed:animate-collapsible-up data-open:animate-collapsible-down">
        {submenus.map(({ href, label, active }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start h-10 mb-1",
              ((active === undefined && pathname === href) || active) &&
              "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <span className="mr-4 ml-2">
              <IconPointFilled className="size-5" />
            </span>
            <p
              className={cn(
                "max-w-[170px] truncate",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-96 opacity-0",
              )}
            >
              {label}
            </p>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  ) : (
    <DropdownMenu>
      <TooltipProvider delay={100}>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-10 mb-1",
                      isSubmenuActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                  >
                    <div className="w-full items-center flex justify-between">
                      <div className="flex items-center">
                        <span className={cn(isOpen === false ? "" : "mr-4")}>
                          <Icon className="size-5" />
                        </span>
                        <p
                          className={cn(
                            "max-w-[200px] truncate",
                            isOpen === false ? "opacity-0" : "opacity-100",
                          )}
                        >
                          {label}
                        </p>
                      </div>
                    </div>
                  </Button>
                }
              />
            }
          />
          <TooltipContent side="right" align="start" alignOffset={2}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent side="right" sideOffset={25} align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="max-w-[190px] truncate">
            {label}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {submenus.map(({ href, label, active }) => (
          <DropdownMenuItem
            key={href}
            render={
              <Link
                className={cn(
                  "cursor-pointer",
                  ((active === undefined && pathname === href) || active) &&
                  "bg-secondary"
                )}
                href={href}
              >
                <p className="max-w-[180px] truncate">{label}</p>
              </Link>
            }
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

