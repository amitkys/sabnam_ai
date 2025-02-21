/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon
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
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Test Series",
      menus: [
        {
          href: "",
          label: "BSEB",
          icon: SquarePen,
          submenus: [
            {
              href: "/posts",
              label: "10th"
            },
            {
              href: "/posts/new",
              label: "12th"
            }
          ]
        },
        {
          href: "/CBSE",
          label: "CBSE",
          icon: Bookmark,
          submenus: [
            {
              href: "/CBSE/10th",
              label: "10th"
            },
            {
              href: "/CBSE/12th",
              label: "12th"
            }
          ]
        },
        {
          href: "/Computer Science",
          label: "Computer Science",
          icon: Tag,
          submenus: [
            {
              href: "/comingsoon",
              label: "Coming Soon"
            }
          ]
        }
      ]
    },
    {
      groupLabel: "Others",
      menus: [
        {
          href: "/create",
          label: "Create Test",
          icon: Users,
        },
        {
          href: "/users",
          label: "Users",
          icon: Settings
        }
      ]
    }
  ];
}
