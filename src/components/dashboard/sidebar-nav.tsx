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
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useAuth } from '@/lib/hooks/use-auth';
import type { UserRole } from '@/lib/types';

const navItemsByRole: Record<UserRole, { href: string; label: string; icon: any }[]> = {
  admin: [
    { href: '/dashboard/admin', label: 'Home & Members', icon: Home },
    { href: '/dashboard/admin/reports', label: 'Department Reports', icon: BarChart2 },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ],
  staff: [
    { href: '/dashboard/staff', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/staff/verify', label: 'Verify Submissions', icon: CheckSquare },
    { href: '/dashboard/staff/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ],
  student: [
    { href: '/dashboard/student', label: 'My Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/student/add-activity', label: 'Add Activity', icon: PlusCircle },
    { href: '/dashboard/student/progress', label: 'My Progress', icon: TrendingUp },
    { href: '/dashboard/student/leaderboard', label: 'Leaderboard', icon: Award },
    { href: '/dashboard/student/reports', label: 'My Reports', icon: FileText },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ],
};


export function SidebarNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const currentNav = navItemsByRole[user.role] || [];
  
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo />
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {currentNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === item.href ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
