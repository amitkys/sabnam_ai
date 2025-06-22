"use client";
import Link from "next/link";
import { LayoutGrid, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuthStore } from "@/lib/store/auth-store";

export function UserNav() {
  const { data: session, status } = useSession();
  const { isAuthenticated } = useAuthStore();

  // If not authenticated, show login button
  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="text-sm font-semibold bg-primary text-background px-2 md:px-3 py-1 rounded hover:bg-primary/90 transition-colors"
      >
        Login
      </Link>
    );
  }

  // Extract user information from session
  const user = session?.user;
  const name = user?.name || "User";
  const email = user?.email || "No email";
  const image = user?.image || null;

  // Create initials for avatar fallback
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                className="relative h-8 w-8 rounded-full"
                disabled={status === "loading"}
                variant="outline"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage alt={`${name}'s avatar`} src={image || ""} />
                  <AvatarFallback className="bg-primary/10">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {status === "authenticated" && (
        <DropdownMenuContent forceMount align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="hover:cursor-pointer">
              <Link className="flex items-center" href="/dashboard">
                <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem className="hover:cursor-pointer" asChild>
              <Link href="/account" className="flex items-center">
                <User className="w-4 h-4 mr-3 text-muted-foreground" />
                Account
              </Link>
            </DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
