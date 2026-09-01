/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CirclePlus,
  Trophy,
  LayoutGrid,
  LucideIcon,
  Book,
  BookPlus,
  School,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/home",
          label: "Home",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Administration",
      menus: [
        {
          href: "/admin",
          label: "Admin Panel",
          icon: ShieldCheck,
        },
      ],
    },
  ];
}
