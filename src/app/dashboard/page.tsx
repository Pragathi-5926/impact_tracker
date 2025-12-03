'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    switch (user.role) {
      case 'admin':
        router.replace('/dashboard/admin');
        break;
      case 'staff':
        router.replace('/dashboard/staff');
        break;
      case 'student':
        router.replace('/dashboard/student');
        break;
      default:
        // Fallback or error page
        router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
    </div>
  );
}
