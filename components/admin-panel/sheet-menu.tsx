import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Menu } from "@/components/admin-panel/menu";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-8 lg:hidden",
        )}
      >
        <MenuIcon size={20} />
      </SheetTrigger>
      <SheetContent
        className="sm:w-72 px-3 h-full flex flex-col bg-sidebar text-sidebar-foreground"
        side="left"
      >
        <SheetHeader className="text-left">
          <Link
            className={cn(
              buttonVariants({ variant: "link" }),
              "flex justify-start items-center gap-2 pb-2 pt-1 px-4",
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
            <SheetTitle className="font-brand text-2xl tracking-wide text-sidebar-foreground">
              Sabnam
            </SheetTitle>
          </Link>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
