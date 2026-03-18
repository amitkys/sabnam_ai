'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Users,
  BarChart3,
  Truck,
  MessageSquare,
  Star,
  Megaphone,
} from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { title: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
      { title: 'Products', href: '/dashboard/products', icon: Package },
      { title: 'Categories', href: '/dashboard/categories', icon: Tags },
      { title: 'Inventory', href: '/dashboard/inventory', icon: Truck },
    ],
  },
  {
    label: 'Customers',
    items: [
      { title: 'Customers', href: '/dashboard/customers', icon: Users },
      { title: 'Reviews', href: '/dashboard/reviews', icon: Star },
      { title: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { title: 'Promotions', href: '/dashboard/promotions', icon: Megaphone },
    ],
  },
];

export function NavMain() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}