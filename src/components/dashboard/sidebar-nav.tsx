'use client';

import {
  Home,
  Users,
  BarChart2,
  Settings,
  PlusCircle,
  CheckSquare,
  TrendingUp,
  Award,
  FileText,
  PanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { useAuth } from '@/lib/hooks/use-auth';
import type { UserRole } from '@/lib/types';
import { Separator } from '../ui/separator';

const studentNav = [
  { href: '/dashboard/student', label: 'Home', icon: Home },
  { href: '/dashboard/student/add-activity', label: 'Add Activity', icon: PlusCircle },
  { href: '/dashboard/student/progress', label: 'My Progress', icon: TrendingUp },
  { href: '/dashboard/student/leaderboard', label: 'Leaderboard', icon: Award },
  { href: '/dashboard/student/reports', label: 'Reports', icon: FileText },
];

const staffNav = [
  { href: '/dashboard/staff', label: 'Home', icon: Home },
  { href: '/dashboard/staff/verify', label: 'Verify Submissions', icon: CheckSquare },
  { href: '/dashboard/staff/analytics', label: 'Department Analytics', icon: BarChart2 },
];

const adminNav = [
  { href: '/dashboard/admin', label: 'Home & Members', icon: Home },
  { href: '/dashboard/admin/reports', label: 'Department Reports', icon: BarChart2 },
];

const sharedNav = [
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
];

const navItems: Record<UserRole, typeof studentNav> = {
  student: studentNav,
  staff: staffNav,
  admin: adminNav,
};

export function SidebarNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const currentNav = navItems[user.role] || [];
  const finalNav = [...currentNav, ...sharedNav];

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {finalNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                icon={<item.icon />}
                tooltip={item.label}
              >
                <Link href={item.href}>{item.label}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarTrigger asChild>
              <SidebarMenuButton icon={<PanelLeft />}>
                Toggle Sidebar
              </SidebarMenuButton>
            </SidebarTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
