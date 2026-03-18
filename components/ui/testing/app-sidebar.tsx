'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/ui/testing/nav-main';
import { NavUser, type UserProfile } from '@/components/ui/testing/nav-user';

type AppSidebarProps = {
  profile: UserProfile;
} & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ profile, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Header: Brand logo ── */}
      <SidebarHeader>
        <SidebarMenuButton
          asChild
          size="lg"
          className="data-[state=open]:bg-sidebar-accent"
          tooltip="Store Home"
        >
          <Link href="/dashboard">
            {/* Icon — always visible even when collapsed */}
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingCart className="size-4" />
            </div>
            {/* Text — hidden when collapsed */}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">My Store</span>
              <span className="truncate text-xs text-muted-foreground">
                E-commerce Admin
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      {/* ── Content: Main nav groups ── */}
      <SidebarContent>
        <NavMain />
      </SidebarContent>

      {/* ── Footer: User profile dropdown ── */}
      <SidebarFooter>
        <NavUser profile={profile} />
      </SidebarFooter>

      {/* Rail: thin clickable strip to collapse/expand on desktop */}
      <SidebarRail />
    </Sidebar>
  );
}