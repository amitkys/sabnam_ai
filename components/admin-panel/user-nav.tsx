"use client";

import { LayoutGrid, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
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
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts[0]) {
      return parts[0].substring(0, 2).toUpperCase();
    }
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "U";
}

export function UserNav() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  };

  const name = user?.name || "User";
  const email = user?.email || "";
  const initials = getInitials(user?.name, user?.email);
  const imageSrc = user?.image || undefined;

  return (
    <DropdownMenu>
      <TooltipProvider delay={100}>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "relative h-8 w-8 rounded-full p-0 flex items-center justify-center cursor-pointer"
                )}
              >
                <Avatar className="h-8 w-8">
                  {imageSrc && <AvatarImage src={imageSrc} alt={name} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
            }
          />
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              {email && (
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="hover:cursor-pointer"
            render={
              <Link href="/home" className="flex items-center">
                <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
                Home
              </Link>
            }
          />
          <DropdownMenuItem
            className="hover:cursor-pointer"
            render={
              <Link href="/account" className="flex items-center">
                <User className="w-4 h-4 mr-3 text-muted-foreground" />
                Account
              </Link>
            }
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
