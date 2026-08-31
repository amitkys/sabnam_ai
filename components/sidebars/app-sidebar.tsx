import Link from "next/link";
import {
  BookOpenIcon,
  BrainCircuitIcon,
  CalendarClockIcon,
  ChartNoAxesCombinedIcon,
  GraduationCapIcon,
  LayoutGridIcon,
  SquareActivityIcon,
  TrophyIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <ChartNoAxesCombinedIcon />
                    <span className="font-brand text-xl tracking-wide">
                      Sabnam AI
                    </span>
                  </a>
                </SidebarMenuButton>
                {/* <SidebarMenuBadge className='bg-primary/10 rounded-full'>5</SidebarMenuBadge> */}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Test Series</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* All exams — landing page */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/home">
                    <LayoutGridIcon />
                    <span>All Exams</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Board exams — BSEB, CBSE, ICSE */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/home?domain=BOARD">
                    <BookOpenIcon />
                    <span>Board Exams</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Entrance exams — JEE, NEET, CUET */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/home?domain=ENTRANCE">
                    <GraduationCapIcon />
                    <span>Entrance Exams</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Competitive exams — SSC, UPSC, BPSC */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/home?domain=COMPETITIVE">
                    <TrophyIcon />
                    <span>Competitive Exams</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Olympiads */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/home?domain=OLYMPIAD">
                    <BrainCircuitIcon />
                    <span>Olympiads</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Attempt History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <SquareActivityIcon />
                    <span>Pending</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <CalendarClockIcon />
                    <span>Completed</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>AI Chat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <SquareActivityIcon />
                    <span>History</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <CalendarClockIcon />
                    <span>AI Usages Report</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
