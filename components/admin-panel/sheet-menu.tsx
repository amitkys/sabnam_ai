import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "@/components/admin-panel/menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col bg-sidebar text-sidebar-foreground" side="left">
        <SheetHeader className="text-left">
          <Button
            className="flex justify-start items-center pb-2 pt-1 px-4"
            variant="link"
            asChild
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Logo" width={24} height={24} className="mr-1" />
              <SheetTitle className="font-bold text-lg text-sidebar-foreground">Sabnam</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
