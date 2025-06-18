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
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Test Series for:",
      menus: [
        {
          href: "/board",
          label: "Board Exams",
          icon: School,
          // submenus: [
          //   {
          //     href: "/bseb/10th",
          //     label: "10th",
          //   },
          //   {
          //     href: "/bseb/12th",
          //     label: "12th",
          //   },
          // ],
        },
        {
          href: "/exams",
          label: "Competi. & Other",
          icon: Trophy,
          // submenus: [
          //   {
          //     href: "/CBSE/10th",
          //     label: "10th",
          //   },
          //   {
          //     href: "/CBSE/12th",
          //     label: "12th",
          //   },
          // ],
        },
        {
          href: "/subjects",
          label: "Individual Subjects",
          icon: Book,
          // submenus: [
          //   {
          //     href: "/comingsoon",
          //     label: "Coming Soon",
          //   },
          // ],
        },
      ],
    },
    {
      groupLabel: "User Voice", // Or any of the above
      menus: [
        {
          href: "/feedback",
          label: "Feedback",
          icon: MessageCircle, // Instead of Users
        },
        {
          href: "/req",
          label: "Request a Test",
          icon: Mail, // Instead of Settings
        },
      ],
    },

    {
      groupLabel: "More..",
      menus: [
        {
          href: "/create",
          label: "Add Test",
          icon: CirclePlus,
        },
      ],
    },
  ];
}
