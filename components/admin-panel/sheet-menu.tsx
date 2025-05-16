import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Button className="h-8" size="icon" variant="outline">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            asChild
            className="flex justify-center items-center pb-2 pt-1"
            variant="link"
          >
            <a className="flex items-center gap-2" href="/home">
              <Image src={"/logo.svg"} width={40} height={40} alt="logo" />
              <SheetTitle className="font-bold text-lg">Sabnam AI</SheetTitle>
            </a>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
